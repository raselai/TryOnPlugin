import crypto from "crypto";
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { prisma, getPlan } from "../db";
import type { AuthenticatedRequest, ApiError } from "../types";

const API_KEY_HEADER = "x-tryon-api-key";
const API_KEY_PREFIX = "tryon_live_";

/**
 * Hash an API key using SHA-256
 * API keys are stored as hashes, never in plain text
 */
export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Generate a new API key
 * Format: tryon_live_<32 random hex chars>
 */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomPart = crypto.randomBytes(16).toString("hex");
  const key = `${API_KEY_PREFIX}${randomPart}`;
  const hash = hashApiKey(key);
  const prefix = key.substring(0, 16); // "tryon_live_xxxx"
  return { key, hash, prefix };
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Format: tryon_live_<32 hex chars>
  const regex = /^tryon_live_[a-f0-9]{32}$/;
  return regex.test(key);
}

/**
 * Send authentication error response
 */
function sendAuthError(
  reply: FastifyReply,
  statusCode: number,
  error: string,
  code: string
): ApiError {
  reply.code(statusCode);
  return { error, code, retryable: false };
}

/**
 * Authentication middleware for protected routes
 * Validates API key and attaches store context to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.headers[API_KEY_HEADER] as string | undefined;

  // Check for missing API key
  if (!apiKey) {
    reply.send(sendAuthError(
      reply,
      401,
      "API key required. Include x-tryon-api-key header.",
      "MISSING_API_KEY"
    ));
    return;
  }

  // Validate key format
  if (!isValidApiKeyFormat(apiKey)) {
    reply.send(sendAuthError(
      reply,
      401,
      "Invalid API key format",
      "INVALID_API_KEY_FORMAT"
    ));
    return;
  }

  // Hash the key and look up in database
  const keyHash = hashApiKey(apiKey);

  try {
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { store: true },
    });

    // Key not found
    if (!apiKeyRecord) {
      reply.send(sendAuthError(
        reply,
        401,
        "Invalid API key",
        "INVALID_API_KEY"
      ));
      return;
    }

    // Key is deactivated
    if (!apiKeyRecord.isActive) {
      reply.send(sendAuthError(
        reply,
        401,
        "API key has been deactivated",
        "API_KEY_DEACTIVATED"
      ));
      return;
    }

    // Store is suspended or cancelled
    if (apiKeyRecord.store.status !== "active") {
      reply.send(sendAuthError(
        reply,
        403,
        `Store account is ${apiKeyRecord.store.status}. Please contact support.`,
        "STORE_INACTIVE"
      ));
      return;
    }

    // Attach store and API key to request
    (request as AuthenticatedRequest).store = apiKeyRecord.store;
    (request as AuthenticatedRequest).apiKey = apiKeyRecord;

    // Update last used timestamp (fire and forget)
    prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {
      // Ignore errors for last used update
    });

  } catch (error) {
    request.log.error(error, "Authentication database error");
    reply.send(sendAuthError(
      reply,
      500,
      "Authentication service unavailable",
      "AUTH_ERROR"
    ));
    return;
  }
}

/**
 * Register authentication preHandler for specific routes
 */
export function registerAuthRoutes(app: FastifyInstance, paths: string[]): void {
  app.addHook("preHandler", async (request, reply) => {
    // Only authenticate specific paths
    if (paths.some(path => request.url.startsWith(path))) {
      await authenticate(request, reply);
    }
  });
}

/**
 * Validate request origin against store's allowed domains
 */
export async function validateOrigin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authRequest = request as AuthenticatedRequest;

  // Skip if no store context (shouldn't happen if auth runs first)
  if (!authRequest.store) {
    return;
  }

  const origin = request.headers.origin;
  const store = authRequest.store;

  // No origin header (direct API call, not from browser)
  if (!origin) {
    // Allow direct API calls (non-browser requests)
    return;
  }

  // Parse origin to get hostname
  let originHost: string;
  try {
    const url = new URL(origin);
    originHost = url.hostname;
  } catch {
    reply.code(403);
    reply.send({
      error: "Invalid origin header",
      code: "INVALID_ORIGIN",
      retryable: false,
    });
    return;
  }

  // Check against store's allowed domains
  const allowedDomains = store.allowedDomains || [store.domain];

  // Check if origin matches any allowed domain
  const isAllowed = allowedDomains.some(domain => {
    // Exact match
    if (originHost === domain) return true;
    // Wildcard subdomain match (e.g., *.example.com)
    if (domain.startsWith("*.")) {
      const baseDomain = domain.slice(2);
      return originHost === baseDomain || originHost.endsWith(`.${baseDomain}`);
    }
    return false;
  });

  if (!isAllowed) {
    request.log.warn({
      storeId: store.id,
      origin,
      allowedDomains,
    }, "Origin not allowed");

    reply.code(403);
    reply.send({
      error: "Origin not allowed for this API key",
      code: "ORIGIN_NOT_ALLOWED",
      retryable: false,
    });
    return;
  }
}
