import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma, PLANS, type PlanId } from "../db";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
} from "../services/billing";
import type { AuthenticatedRequest } from "../types";

interface CheckoutBody {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

interface PortalBody {
  returnUrl: string;
}

/**
 * Register billing routes
 */
export function registerBillingRoutes(app: FastifyInstance): void {
  /**
   * Get available plans
   */
  app.get("/api/billing/plans", async () => {
    return {
      plans: Object.values(PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        priceMonthly: plan.priceMonthly,
        monthlyQuota: plan.monthlyQuota,
        requestsPerMin: plan.requestsPerMin,
        overagePrice: plan.overagePrice,
      })),
    };
  });

  /**
   * Create checkout session for subscription
   * Requires authentication
   */
  app.post<{ Body: CheckoutBody }>(
    "/api/billing/checkout",
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;

      if (!authRequest.store) {
        reply.code(401);
        return { error: "Authentication required", code: "UNAUTHORIZED" };
      }

      const { planId, successUrl, cancelUrl } = request.body;

      // Validate plan
      if (!["starter", "growth"].includes(planId)) {
        reply.code(400);
        return { error: "Invalid plan ID", code: "INVALID_PLAN" };
      }

      try {
        const checkoutUrl = await createCheckoutSession(
          authRequest.store.id,
          planId as PlanId,
          successUrl,
          cancelUrl
        );

        if (!checkoutUrl) {
          reply.code(500);
          return { error: "Failed to create checkout session", code: "CHECKOUT_ERROR" };
        }

        return { url: checkoutUrl };
      } catch (error: any) {
        app.log.error(error, "Checkout session creation failed");
        reply.code(500);
        return { error: error.message, code: "CHECKOUT_ERROR" };
      }
    }
  );

  /**
   * Create billing portal session
   * Requires authentication
   */
  app.post<{ Body: PortalBody }>(
    "/api/billing/portal",
    async (request, reply) => {
      const authRequest = request as AuthenticatedRequest;

      if (!authRequest.store) {
        reply.code(401);
        return { error: "Authentication required", code: "UNAUTHORIZED" };
      }

      const { returnUrl } = request.body;

      try {
        const portalUrl = await createPortalSession(
          authRequest.store.id,
          returnUrl
        );

        if (!portalUrl) {
          reply.code(500);
          return { error: "Failed to create portal session", code: "PORTAL_ERROR" };
        }

        return { url: portalUrl };
      } catch (error: any) {
        app.log.error(error, "Portal session creation failed");
        reply.code(500);
        return { error: error.message, code: "PORTAL_ERROR" };
      }
    }
  );

  /**
   * Get current subscription status
   * Requires authentication
   */
  app.get("/api/billing/subscription", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    const store = authRequest.store;
    const status = await getSubscriptionStatus(store.id);

    return {
      planId: store.planId,
      planName: PLANS[store.planId as PlanId]?.name || "Free",
      status: store.status,
      monthlyQuota: store.monthlyQuota,
      usedQuota: store.usedQuota,
      quotaResetAt: store.quotaResetAt,
      subscription: status,
    };
  });

  /**
   * Get usage summary for current billing period
   * Requires authentication
   */
  app.get("/api/billing/usage", async (request, reply) => {
    const authRequest = request as AuthenticatedRequest;

    if (!authRequest.store) {
      reply.code(401);
      return { error: "Authentication required", code: "UNAUTHORIZED" };
    }

    const store = authRequest.store;
    const plan = PLANS[store.planId as PlanId] || PLANS.free;

    // Calculate overage
    const overage = Math.max(0, store.usedQuota - plan.monthlyQuota);
    const overageCost = overage * plan.overagePrice;

    return {
      periodStart: store.quotaResetAt,
      periodEnd: getNextMonth(store.quotaResetAt),
      quota: {
        limit: plan.monthlyQuota,
        used: store.usedQuota,
        remaining: Math.max(0, plan.monthlyQuota - store.usedQuota),
      },
      overage: {
        count: overage,
        pricePerUnit: plan.overagePrice,
        estimatedCost: overageCost,
      },
    };
  });
}

function getNextMonth(date: Date): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}
