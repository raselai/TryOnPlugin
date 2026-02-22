import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma Client instances in development (hot reload)
declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Plan configurations (in-memory for fast lookups)
export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    monthlyQuota: 100,
    requestsPerMin: 5,
    dailyLimit: 100,
    overagePrice: 0, // Hard limit, no overage
    stripePriceId: null,
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 2900, // $29
    monthlyQuota: 1000,
    requestsPerMin: 20,
    dailyLimit: 1000,
    overagePrice: 5, // $0.05
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || null,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 9900, // $99
    monthlyQuota: 10000,
    requestsPerMin: 60,
    dailyLimit: 10000,
    overagePrice: 3, // $0.03
    stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID || null,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlan(planId: string) {
  return PLANS[planId as PlanId] || PLANS.free;
}

// Helper to get current billing period
export function getCurrentBillingPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Helper to check if quota should reset
export function shouldResetQuota(quotaResetAt: Date): boolean {
  const now = new Date();
  return now >= quotaResetAt;
}

// Helper to get next quota reset date (first of next month)
export function getNextQuotaResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
