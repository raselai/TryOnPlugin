import Stripe from "stripe";
import { prisma, getPlan, PLANS, type PlanId } from "../db.js";
import { getBillableUsage, getStoresWithOverage } from "./usage.js";

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

// Stripe price IDs (configured in Stripe dashboard)
const STRIPE_PRICES = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  // Metered price for overage
  overage_starter: process.env.STRIPE_OVERAGE_STARTER_PRICE_ID,
  overage_growth: process.env.STRIPE_OVERAGE_GROWTH_PRICE_ID,
};

/**
 * Create a Stripe customer for a store
 */
export async function createStripeCustomer(
  storeId: string,
  email: string,
  name: string
): Promise<string | null> {
  if (!stripe) {
    console.warn("Stripe not configured");
    return null;
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        storeId,
      },
    });

    // Update store with Stripe customer ID
    await prisma.store.update({
      where: { id: storeId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  } catch (error) {
    console.error("Failed to create Stripe customer:", error);
    throw error;
  }
}

/**
 * Create a checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  storeId: string,
  planId: PlanId,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const priceId = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];
  if (!priceId) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  // Create or get Stripe customer
  let customerId = store.stripeCustomerId;
  if (!customerId) {
    customerId = await createStripeCustomer(storeId, store.email, store.name);
  }

  if (!customerId) {
    throw new Error("Failed to create Stripe customer");
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      storeId,
      planId,
    },
    subscription_data: {
      metadata: {
        storeId,
        planId,
      },
    },
  });

  return session.url;
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createPortalSession(
  storeId: string,
  returnUrl: string
): Promise<string | null> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: store.stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Handle successful checkout - upgrade store plan
 */
export async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
): Promise<void> {
  const storeId = session.metadata?.storeId;
  const planId = session.metadata?.planId as PlanId;

  if (!storeId || !planId) {
    console.error("Missing metadata in checkout session");
    return;
  }

  const plan = getPlan(planId);

  await prisma.store.update({
    where: { id: storeId },
    data: {
      planId,
      monthlyQuota: plan.monthlyQuota,
      stripeCustomerId: session.customer as string,
      status: "active",
    },
  });

  console.log(`Store ${storeId} upgraded to ${planId}`);
}

/**
 * Handle subscription update (plan change)
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<void> {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) {
    console.error("Missing storeId in subscription metadata");
    return;
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id;
  let planId: PlanId = "free";

  if (priceId === STRIPE_PRICES.starter) {
    planId = "starter";
  } else if (priceId === STRIPE_PRICES.growth) {
    planId = "growth";
  }

  const plan = getPlan(planId);

  await prisma.store.update({
    where: { id: storeId },
    data: {
      planId,
      monthlyQuota: plan.monthlyQuota,
      status: subscription.status === "active" ? "active" : "suspended",
    },
  });
}

/**
 * Handle subscription cancellation
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const storeId = subscription.metadata?.storeId;
  if (!storeId) {
    return;
  }

  // Downgrade to free plan
  const freePlan = getPlan("free");

  await prisma.store.update({
    where: { id: storeId },
    data: {
      planId: "free",
      monthlyQuota: freePlan.monthlyQuota,
      status: "active",
    },
  });

  console.log(`Store ${storeId} downgraded to free plan`);
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId = invoice.customer as string;

  const store = await prisma.store.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!store) {
    return;
  }

  // Suspend store after payment failure
  await prisma.store.update({
    where: { id: store.id },
    data: { status: "suspended" },
  });

  console.log(`Store ${store.id} suspended due to payment failure`);
}

/**
 * Report overage usage to Stripe for metered billing
 */
export async function reportOverageUsage(
  billingPeriod: string
): Promise<void> {
  if (!stripe) {
    console.warn("Stripe not configured, skipping overage reporting");
    return;
  }

  const storesWithOverage = await getStoresWithOverage(billingPeriod);

  for (const { storeId, overage, stripeCustomerId } of storesWithOverage) {
    if (!stripeCustomerId || overage <= 0) {
      continue;
    }

    try {
      // Find the subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });

      const subscription = subscriptions.data[0];
      if (!subscription) {
        continue;
      }

      // Find the metered item
      const meteredItem = subscription.items.data.find(
        item => item.price.recurring?.usage_type === "metered"
      );

      if (meteredItem) {
        // Report overage usage
        await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
          quantity: overage,
          timestamp: Math.floor(Date.now() / 1000),
          action: "set",
        });

        console.log(`Reported ${overage} overage for store ${storeId}`);
      }
    } catch (error) {
      console.error(`Failed to report overage for store ${storeId}:`, error);
    }
  }
}

/**
 * Get subscription status for a store
 */
export async function getSubscriptionStatus(
  storeId: string
): Promise<{
  planId: string;
  status: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
} | null> {
  if (!stripe) {
    return null;
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store?.stripeCustomerId) {
    return {
      planId: store?.planId || "free",
      status: store?.status || "active",
    };
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: store.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    if (!subscription) {
      return {
        planId: "free",
        status: "active",
      };
    }

    return {
      planId: store.planId,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    console.error("Failed to get subscription status:", error);
    return null;
  }
}
