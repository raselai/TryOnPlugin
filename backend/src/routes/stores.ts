import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma, PLANS, type PlanId } from "../db";
import { generateApiKey, hashApiKey } from "../middleware/auth";
import { getUsageStats, getDailyUsage } from "../services/usage";
import type { AuthenticatedRequest } from "../types";

interface CreateStoreBody {
  name: string;
  email: string;
  domain: string;
}

interface UpdateStoreBody {
  name?: string;
  domain?: string;
  allowedDomains?: string[];
}

interface CreateApiKeyBody {
  name?: string;
}

/**
 * Register store management routes
 */
export function registerStoreRoutes(app: FastifyInstance): void {
  /**
   * Create a new store (signup)
   * Public endpoint - no authentication required
   */
  app.post<{ Body: CreateStoreBody }>(
    "/api/stores",
    async (request, reply) => {
      const { name, email, domain } = request.body;

      // Validate required fields
      if (!name || !email || !domain) {
        reply.code(400);
        return {
          error: "Name, email, and domain are required",
          code: "MISSING_FIELDS",
        };
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        reply.code(400);
        return { error: "Invalid email format", code: "INVALID_EMAIL" };
      }

      // Validate domain format
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(domain)) {
        reply.code(400);
        return { error: "Invalid domain format", code: "INVALID_DOMAIN" };
      }

      // Check if email already exists
      const existing = await prisma.store.findUnique({
        where: { email },
      });

      if (existing) {
        reply.code(409);
        return {
          error: "A store with this email already exists",
          code: "EMAIL_EXISTS",
        };
      }

      // Generate API key
      const { key, hash, prefix } = generateApiKey();

      try {
        // Create store and API key in a transaction
        const store = await prisma.store.create({
          data: {
            name,
            email,
            domain,
            allowedDomains: [domain],
            planId: "free",
            monthlyQuota: PLANS.free.monthlyQuota,
            apiKeys: {
              create: {
                keyHash: hash,
                keyPrefix: prefix,
                name: "Default",
              },
            },
          },
          include: {
            apiKeys: true,
          },
        });

        // Return store info with the API key (only time it's shown in full)
        return {
          store: {
            id: store.id,
            name: store.name,
            email: store.email,
            domain: store.domain,
            planId: store.planId,
            monthlyQuota: store.monthlyQuota,
          },
          apiKey: {
            id: store.apiKeys[0].id,
            key, // Full key - only shown once!
            prefix: store.apiKeys[0].keyPrefix,
            name: store.apiKeys[0].name,
          },
          embedCode: generateEmbedCode(key),
        };
      } catch (error: any) {
        app.log.error(error, "Failed to create store");
        reply.code(500);
        return { error: "Failed to create store", code: "CREATE_ERROR" };
      }
    }
  );

  /**
   * Get current store info
   * Requires authentication
   */
  app.get("/api/stores/me", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    const store = authRequest.store;

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      domain: store.domain,
      allowedDomains: store.allowedDomains,
      planId: store.planId,
      planName: PLANS[store.planId as PlanId]?.name || "Free",
      monthlyQuota: store.monthlyQuota,
      usedQuota: store.usedQuota,
      quotaResetAt: store.quotaResetAt,
      status: store.status,
      createdAt: store.createdAt,
    };
  });

  /**
   * Update store settings
   * Requires authentication
   */
  app.patch<{ Body: UpdateStoreBody }>(
    "/api/stores/me",
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;

      if (!authRequest.store) {
        reply.code(401);
        return { error: "Authentication required", code: "UNAUTHORIZED" };
      }

      const { name, domain, allowedDomains } = request.body;

      // Validate allowed domains if provided
      if (allowedDomains) {
        for (const d of allowedDomains) {
          if (!/^(\*\.)?[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z]{2,}$/.test(d)) {
            reply.code(400);
            return {
              error: `Invalid domain format: ${d}`,
              code: "INVALID_DOMAIN",
            };
          }
        }
      }

      const updated = await prisma.store.update({
        where: { id: authRequest.store.id },
        data: {
          ...(name && { name }),
          ...(domain && { domain }),
          ...(allowedDomains && { allowedDomains }),
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        domain: updated.domain,
        allowedDomains: updated.allowedDomains,
      };
    }
  );

  /**
   * Get store's API keys
   * Requires authentication
   */
  app.get("/api/stores/me/api-keys", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { storeId: authRequest.store.id },
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { apiKeys };
  });

  /**
   * Create a new API key
   * Requires authentication
   */
  app.post<{ Body: CreateApiKeyBody }>(
    "/api/stores/me/api-keys",
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;

      if (!authRequest.store) {
        reply.code(401);
        return { error: "Authentication required", code: "UNAUTHORIZED" };
      }

      const { name = "API Key" } = request.body;

      // Limit number of API keys per store
      const keyCount = await prisma.apiKey.count({
        where: { storeId: authRequest.store.id },
      });

      if (keyCount >= 10) {
        reply.code(400);
        return {
          error: "Maximum of 10 API keys allowed",
          code: "MAX_KEYS_REACHED",
        };
      }

      const { key, hash, prefix } = generateApiKey();

      const apiKey = await prisma.apiKey.create({
        data: {
          storeId: authRequest.store.id,
          keyHash: hash,
          keyPrefix: prefix,
          name,
        },
      });

      return {
        id: apiKey.id,
        key, // Full key - only shown once!
        prefix: apiKey.keyPrefix,
        name: apiKey.name,
      };
    }
  );

  /**
   * Revoke an API key
   * Requires authentication
   */
  app.delete<{ Params: { keyId: string } }>(
    "/api/stores/me/api-keys/:keyId",
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;

      if (!authRequest.store) {
        reply.code(401);
        return { error: "Authentication required", code: "UNAUTHORIZED" };
      }

      const { keyId } = request.params;

      // Verify key belongs to store
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: keyId,
          storeId: authRequest.store.id,
        },
      });

      if (!apiKey) {
        reply.code(404);
        return { error: "API key not found", code: "KEY_NOT_FOUND" };
      }

      // Deactivate instead of delete for audit trail
      await prisma.apiKey.update({
        where: { id: keyId },
        data: { isActive: false },
      });

      return { success: true };
    }
  );

  /**
   * Get store usage statistics
   * Requires authentication
   */
  app.get("/api/stores/me/usage", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    const [stats, daily] = await Promise.all([
      getUsageStats(authRequest.store.id),
      getDailyUsage(authRequest.store.id, 30),
    ]);

    return {
      summary: stats,
      daily,
    };
  });

  /**
   * Get embed code for store
   * Requires authentication
   */
  app.get("/api/stores/me/embed-code", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    // Get the first active API key
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        storeId: authRequest.store.id,
        isActive: true,
      },
      select: { keyPrefix: true },
    });

    return {
      embedCode: generateEmbedCode(apiKey?.keyPrefix + "..." || "YOUR_API_KEY"),
      note: "Replace the API key with your actual key from the API Keys page.",
    };
  });
}

/**
 * Generate embed code snippet for a store
 */
function generateEmbedCode(apiKey: string): string {
  const cdnUrl = process.env.CDN_URL || "https://cdn.tryonplugin.com";
  const version = process.env.WIDGET_VERSION || "v1";

  return `<!-- TryOn Plugin -->
<script
  src="${cdnUrl}/${version}/loader.js"
  data-tryon-api-key="${apiKey}"
  async
></script>

<!-- Add to any product image button -->
<button data-tryon-image="YOUR_PRODUCT_IMAGE_URL">
  Try this on
</button>`;
}
