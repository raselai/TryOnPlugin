import type { FastifyRequest, FastifyReply } from "fastify";

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // per window per IP

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

function getClientIp(request: FastifyRequest): string {
  // Vercel / proxy headers
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return request.ip;
}

export async function tryOnRateLimit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  entry.count++;

  reply.header("X-RateLimit-Limit", MAX_REQUESTS);
  reply.header("X-RateLimit-Remaining", Math.max(0, MAX_REQUESTS - entry.count));
  reply.header("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

  if (entry.count > MAX_REQUESTS) {
    reply.code(429);
    throw { error: "Too many requests. Please wait a moment and try again.", code: "RATE_LIMITED", retryable: true };
  }
}
