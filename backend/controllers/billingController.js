import User from "../models/User.js";
import { stripe, stripeEnabled, priceIdFor } from "../config/stripe.js";
import { publicUser } from "./authController.js";

const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

const clientOrigin = () => {
  // Use the first comma-separated origin as the canonical app URL for redirects
  const raw = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return raw.split(",")[0].trim();
};

/**
 * POST /api/billing/checkout
 * Body: { cadence: "monthly" | "yearly" }
 * Returns: { url } — Stripe-hosted checkout page
 */
export const createCheckout = async (req, res) => {
  if (!stripeEnabled()) {
    return res
      .status(503)
      .json({ error: "Payments not configured on this deployment." });
  }

  const cadence = req.body?.cadence === "yearly" ? "yearly" : "monthly";

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Create or reuse Stripe Customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe().customers.create({
        email: user.email,
        name: user.name,
        metadata: { user_id: String(user._id) },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const origin = clientOrigin();
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceIdFor(cadence), quantity: 1 }],
      client_reference_id: String(user._id),
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      subscription_data: {
        metadata: { user_id: String(user._id) },
      },
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
    });

    if (!session.url) {
      return res.status(500).json({ error: "Checkout session has no URL" });
    }
    res.json({ url: session.url });
  } catch (err) {
    console.error("createCheckout error:", err);
    res.status(500).json({ error: "Failed to start checkout" });
  }
};

/**
 * POST /api/billing/portal
 * Returns: { url } — Stripe Customer Portal for manage/cancel/invoices
 */
export const openPortal = async (req, res) => {
  if (!stripeEnabled()) {
    return res
      .status(503)
      .json({ error: "Payments not configured on this deployment." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.stripeCustomerId) {
      return res
        .status(400)
        .json({ error: "No subscription to manage. Upgrade first." });
    }

    const portal = await stripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${clientOrigin()}/dashboard`,
    });

    res.json({ url: portal.url });
  } catch (err) {
    console.error("openPortal error:", err);
    res.status(500).json({ error: "Failed to open billing portal" });
  }
};

/**
 * POST /api/billing/webhook
 * RAW BODY required — never apply express.json() upstream.
 * Verifies Stripe HMAC signature, then syncs subscription state to Mongo.
 */
export const handleWebhook = async (req, res) => {
  if (!stripeEnabled()) {
    return res.status(503).send("stripe not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("missing signature");
  }

  let event;
  try {
    event = stripe().webhooks.constructEvent(
      req.body, // Buffer — raw body
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.subscription && session.customer) {
          await syncSubscription(session.customer, session.subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await syncSubscription(sub.customer, sub.id);
        break;
      }
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    return res.status(500).send("handler error");
  }

  res.json({ received: true });
};

/**
 * Pull current Stripe subscription state and mirror to Mongo.
 */
async function syncSubscription(customerId, subscriptionId) {
  const subscription = await stripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? null;
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null;
  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  // Find user by stripeCustomerId
  let user = await User.findOne({ stripeCustomerId: customerId });

  if (!user) {
    // Fallback: pull customer metadata.user_id (set at customer creation)
    const customer = await stripe().customers.retrieve(customerId);
    const userId = customer?.metadata?.user_id;
    if (!userId) {
      console.warn(
        `[stripe webhook] no user found for customer ${customerId} and no metadata`,
      );
      return;
    }
    user = await User.findById(userId);
    if (!user) return;
    user.stripeCustomerId = customerId;
  }

  user.stripeSubscriptionId = subscription.id;
  user.subscriptionStatus = subscription.status;
  user.currentPeriodEnd = currentPeriodEnd;
  user.priceId = priceId;
  user.plan = isActive ? "pro" : "free";
  await user.save();
}

/**
 * GET /api/billing/me — convenience endpoint for the client to fetch
 * the latest billing snapshot (used after returning from Checkout).
 */
export const getBillingMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("getBillingMe error:", err);
    res.status(500).json({ error: "Failed to fetch billing" });
  }
};
