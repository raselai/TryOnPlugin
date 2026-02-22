import { prisma, getCurrentBillingPeriod, shouldResetQuota, getNextQuotaResetDate } from "../db.js";
import type { UsageEventType, UsageStatus, RequestMetadata } from "../types.js";
import type { Store } from "@prisma/client";

/**
 * Log a usage event for a store
 */
export async function logUsage(
  storeId: string,
  eventType: UsageEventType,
  status: UsageStatus,
  metadata?: RequestMetadata
): Promise<void> {
  const billingPeriod = getCurrentBillingPeriod();

  try {
    await prisma.usageLog.create({
      data: {
        storeId,
        eventType,
        status,
        processingMs: metadata?.processingMs,
        errorCode: metadata?.errorCode,
        billingPeriod,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error("Failed to log usage:", error);
  }
}

/**
 * Increment store's used quota
 * Also resets quota if billing period has changed
 */
export async function incrementQuota(store: Store): Promise<Store> {
  // Check if quota needs to be reset
  if (shouldResetQuota(store.quotaResetAt)) {
    // Reset quota for new billing period
    return prisma.store.update({
      where: { id: store.id },
      data: {
        usedQuota: 1,
        quotaResetAt: getNextQuotaResetDate(),
      },
    });
  }

  // Increment used quota
  return prisma.store.update({
    where: { id: store.id },
    data: {
      usedQuota: { increment: 1 },
    },
  });
}

/**
 * Get usage statistics for a store
 */
export async function getUsageStats(
  storeId: string,
  billingPeriod?: string
): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  byEventType: Record<string, number>;
  byStatus: Record<string, number>;
}> {
  const period = billingPeriod || getCurrentBillingPeriod();

  const logs = await prisma.usageLog.findMany({
    where: {
      storeId,
      billingPeriod: period,
    },
    select: {
      eventType: true,
      status: true,
    },
  });

  const stats = {
    totalRequests: logs.length,
    successfulRequests: logs.filter(l => l.status === "success").length,
    failedRequests: logs.filter(l => l.status === "error").length,
    byEventType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  };

  for (const log of logs) {
    stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
  }

  return stats;
}

/**
 * Get daily usage breakdown for a store
 */
export async function getDailyUsage(
  storeId: string,
  days: number = 30
): Promise<Array<{ date: string; count: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await prisma.usageLog.groupBy({
    by: ["createdAt"],
    where: {
      storeId,
      createdAt: { gte: startDate },
      status: "success",
    },
    _count: true,
  });

  // Group by date
  const dailyMap = new Map<string, number>();
  for (const log of logs) {
    const date = log.createdAt.toISOString().split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + log._count);
  }

  // Convert to array and sort
  return Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get usage count for billing (overage calculation)
 */
export async function getBillableUsage(
  storeId: string,
  billingPeriod: string
): Promise<number> {
  const count = await prisma.usageLog.count({
    where: {
      storeId,
      billingPeriod,
      status: "success",
      eventType: "tryon", // Only bill for try-on requests
    },
  });

  return count;
}

/**
 * Get stores with overage for billing
 */
export async function getStoresWithOverage(
  billingPeriod: string
): Promise<Array<{ storeId: string; overage: number; stripeCustomerId: string | null }>> {
  const stores = await prisma.store.findMany({
    where: {
      status: "active",
      planId: { not: "free" },
    },
    select: {
      id: true,
      monthlyQuota: true,
      stripeCustomerId: true,
    },
  });

  const results: Array<{ storeId: string; overage: number; stripeCustomerId: string | null }> = [];

  for (const store of stores) {
    const usage = await getBillableUsage(store.id, billingPeriod);
    if (usage > store.monthlyQuota) {
      results.push({
        storeId: store.id,
        overage: usage - store.monthlyQuota,
        stripeCustomerId: store.stripeCustomerId,
      });
    }
  }

  return results;
}

/**
 * Clean up old usage logs (older than 90 days)
 */
export async function cleanupOldLogs(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const result = await prisma.usageLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  return result.count;
}
