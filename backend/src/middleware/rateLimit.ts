import type { FastifyRequest, FastifyReply } from "fastify";
import { getPlan } from "../db";
import type { AuthenticatedRequest, RateLimitInfo } from "../types";

// Try to import Vercel KV, fallback to in-memory for local dev
let kv: any = null;
try {
  const vercelKv = await import("@vercel/kv");
  kv = vercelKv.kv;
} catch {
  // Vercel KV not available, will use in-memory fallback
}

// In-memory rate limit store for local development
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt < now) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

/**
 * Get rate limit counter from storage
 */
async function getRateLimit(
  key: string,
  windowMs: number
): Promise<{ count: number; resetAt: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (kv) {
    // Use Vercel KV (Redis)
    try {
      const data = await kv.get<{ count: number; resetAt: number }>(key);
      if (data && data.resetAt > now) {
        return data;
      }
      return { count: 0, resetAt: now + windowMs };
    } catch (error) {
      console.error("KV read error:", error);
      // Fallback to allowing request on KV error
      return { count: 0, resetAt: now + windowMs };
    }
  } else {
    // Use in-memory store
    const data = memoryStore.get(key);
    if (data && data.resetAt > now) {
      return data;
    }
    return { count: 0, resetAt: now + windowMs };
  }
}

/**
 * Increment rate limit counter
 */
async function incrementRateLimit(
  key: string,
  windowMs: number,
  currentCount: number,
  resetAt: number
): Promise<number> {
  const newCount = currentCount + 1;
  const ttlSeconds = Math.ceil((resetAt - Date.now()) / 1000);

  if (kv) {
    try {
      await kv.set(key, { count: newCount, resetAt }, { ex: ttlSeconds });
    } catch (error) {
      console.error("KV write error:", error);
    }
  } else {
    memoryStore.set(key, { count: newCount, resetAt });
  }

  return newCount;
}

/**
 * Get daily usage counter
 */
async function getDailyUsage(storeId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const key = `daily:${storeId}:${today}`;

  if (kv) {
    try {
      const count = await kv.get<number>(key);
      return count || 0;
    } catch {
      return 0;
    }
  } else {
    const data = memoryStore.get(key);
    return data?.count || 0;
  }
}

/**
 * Increment daily usage counter
 */
async function incrementDailyUsage(storeId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const key = `daily:${storeId}:${today}`;

  // TTL: expire at end of day (24 hours from now to be safe)
  const ttlSeconds = 24 * 60 * 60;

  if (kv) {
    try {
      const current = (await kv.get<number>(key)) || 0;
      const newCount = current + 1;
      await kv.set(key, newCount, { ex: ttlSeconds });
      return newCount;
    } catch (error) {
      console.error("Daily usage increment error:", error);
      return 0;
    }
  } else {
    const data = memoryStore.get(key);
    const newCount = (data?.count || 0) + 1;
    memoryStore.set(key, { count: newCount, resetAt: Date.now() + ttlSeconds * 1000 });
    return newCount;
  }
}

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(
  reply: FastifyReply,
  limit: number,
  remaining: number,
  resetAt: number
): void {
  reply.header("X-RateLimit-Limit", limit);
  reply.header("X-RateLimit-Remaining", Math.max(0, remaining));
  reply.header("X-RateLimit-Reset", Math.ceil(resetAt / 1000));
}

/**
 * Per-tenant rate limiting middleware
 * Enforces per-minute and daily limits based on plan
 */
export async function tenantRateLimit(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authRequest = request as AuthenticatedRequest;

  // Skip if no store context
  if (!authRequest.store) {
    return;
  }

  const store = authRequest.store;
  const plan = getPlan(store.planId);
  const windowMs = 60_000; // 1 minute window

  // Rate limit key includes store ID
  const rateLimitKey = `ratelimit:${store.id}`;

  // Check per-minute rate limit
  const { count, resetAt } = await getRateLimit(rateLimitKey, windowMs);

  if (count >= plan.requestsPerMin) {
    setRateLimitHeaders(reply, plan.requestsPerMin, 0, resetAt);
    reply.header("Retry-After", Math.ceil((resetAt - Date.now()) / 1000));
    reply.code(429);
    reply.send({
      error: `Rate limit exceeded. Maximum ${plan.requestsPerMin} requests per minute.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    });
    return;
  }

  // Check daily limit
  const dailyUsage = await getDailyUsage(store.id);
  if (dailyUsage >= plan.dailyLimit) {
    reply.code(429);
    reply.send({
      error: `Daily limit exceeded. Maximum ${plan.dailyLimit} requests per day.`,
      code: "DAILY_LIMIT_EXCEEDED",
      retryable: true,
      retryAfter: getSecondsUntilMidnight(),
    });
    return;
  }

  // Increment counters
  const newCount = await incrementRateLimit(rateLimitKey, windowMs, count, resetAt);
  await incrementDailyUsage(store.id);

  // Set rate limit headers
  setRateLimitHeaders(reply, plan.requestsPerMin, plan.requestsPerMin - newCount, resetAt);
}

/**
 * Check monthly quota (not rate limit, but usage limit)
 * Returns true if quota is available, false if exceeded
 */
export async function checkMonthlyQuota(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<boolean> {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.store) {
    return true;
  }

  const store = authRequest.store;
  const plan = getPlan(store.planId);

  // Free tier: hard limit
  if (store.planId === "free" && store.usedQuota >= plan.monthlyQuota) {
    reply.code(402); // Payment Required
    reply.send({
      error: `Monthly quota exceeded (${plan.monthlyQuota} try-ons). Upgrade to continue.`,
      code: "QUOTA_EXCEEDED",
      retryable: false,
      quotaUsed: store.usedQuota,
      quotaLimit: plan.monthlyQuota,
    });
    return false;
  }

  // Paid tiers: allow overage (will be billed)
  // Just track it, don't block
  return true;
}

/**
 * Get seconds until midnight UTC
 */
function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

/**
 * Rate limit info for including in response
 */
export function getRateLimitInfo(request: FastifyRequest): RateLimitInfo | null {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.store) {
    return null;
  }

  const plan = getPlan(authRequest.store.planId);

  return {
    limit: plan.requestsPerMin,
    remaining: plan.requestsPerMin, // Will be updated by middleware
    reset: Math.ceil((Date.now() + 60_000) / 1000),
  };
}
