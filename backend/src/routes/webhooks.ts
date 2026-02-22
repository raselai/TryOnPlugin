import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import Stripe from "stripe";
import {
  stripe,
  handleCheckoutComplete,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handlePaymentFailed,
} from "../services/billing.js";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Register webhook routes
 */
export function registerWebhookRoutes(app: FastifyInstance): void {
  /**
   * Stripe webhook endpoint
   * Receives events from Stripe and processes them
   */
  app.post(
    "/api/webhooks/stripe",
    {
      config: {
        // Disable body parsing - we need the raw body for signature verification
        rawBody: true,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!stripe || !STRIPE_WEBHOOK_SECRET) {
        app.log.warn("Stripe webhook not configured");
        reply.code(500);
        return { error: "Webhook not configured" };
      }

      // Get raw body for signature verification
      const rawBody = (request as any).rawBody;
      const signature = request.headers["stripe-signature"];

      if (!signature || !rawBody) {
        reply.code(400);
        return { error: "Missing signature or body" };
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature as string,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        app.log.error(err, "Webhook signature verification failed");
        reply.code(400);
        return { error: `Webhook Error: ${err.message}` };
      }

      // Handle the event
      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutComplete(session);
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionUpdate(subscription);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeleted(subscription);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            await handlePaymentFailed(invoice);
            break;
          }

          case "invoice.paid": {
            // Could trigger overage reconciliation here
            app.log.info(`Invoice paid: ${event.data.object.id}`);
            break;
          }

          default:
            app.log.info(`Unhandled webhook event type: ${event.type}`);
        }

        return { received: true };
      } catch (error) {
        app.log.error(error, "Webhook handler error");
        reply.code(500);
        return { error: "Webhook handler failed" };
      }
    }
  );

  /**
   * Health check for webhook endpoint
   */
  app.get("/api/webhooks/health", async () => {
    return {
      stripe: !!stripe,
      webhookConfigured: !!STRIPE_WEBHOOK_SECRET,
    };
  });
}

/**
 * Fastify plugin for raw body support
 * Required for Stripe webhook signature verification
 */
export async function rawBodyPlugin(app: FastifyInstance): Promise<void> {
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      try {
        // Store raw body for webhook verification
        (req as any).rawBody = body;

        // Parse JSON for normal use
        const json = JSON.parse(body.toString());
        done(null, json);
      } catch (err: any) {
        done(err, undefined);
      }
    }
  );
}
