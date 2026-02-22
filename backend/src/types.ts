import type { Store, ApiKey } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "fastify";

// Extended request type with authenticated store context
export interface AuthenticatedRequest extends FastifyRequest {
  store: Store;
  apiKey: ApiKey;
}

// API Error response format
export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

// Store with relations
export interface StoreWithApiKeys extends Store {
  apiKeys: ApiKey[];
}

// Plan tier configuration
export interface PlanConfig {
  id: string;
  name: string;
  priceMonthly: number;
  monthlyQuota: number;
  requestsPerMin: number;
  dailyLimit: number;
  overagePrice: number;
  stripePriceId: string | null;
}

// Usage event types
export type UsageEventType = "tryon" | "classify";
export type UsageStatus = "success" | "error" | "quota_exceeded" | "rate_limited";

// Billing period format: YYYY-MM
export type BillingPeriod = string;

// Store status values
export type StoreStatus = "active" | "suspended" | "cancelled";

// Request metadata for logging
export interface RequestMetadata {
  productCategory?: string;
  processingMs?: number;
  errorCode?: string;
  origin?: string;
}

// Stripe webhook event types we handle
export type StripeWebhookEvent =
  | "checkout.session.completed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_failed";

// Rate limit info included in response headers
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}
