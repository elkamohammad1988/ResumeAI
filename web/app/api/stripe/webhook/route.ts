import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env, features } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RELEVANT_EVENTS = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(req: NextRequest) {
  if (!features.stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // Log detail server-side; return a generic message to the caller. The
    // raw verification error can include the timestamp/signature header
    // contents, which we don't want to echo back to anyone probing this
    // endpoint with crafted bodies.
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[stripe webhook] signature verification failed:", message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 },
    );
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    // Stripe likes 200 for unhandled events — we still ack
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && session.customer) {
          await syncSubscription(
            session.customer as string,
            session.subscription as string,
          );
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub.customer as string, sub.id);
        break;
      }
    }
  } catch (err) {
    console.error(`[stripe webhook] handler error for ${event.type}:`, err);
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

/**
 * Sync subscription state from Stripe → Supabase `profiles` row.
 * Uses admin client (service_role) to bypass RLS.
 */
async function syncSubscription(customerId: string, subscriptionId: string) {
  const subscription = await stripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? null;
  const currentPeriodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  const admin = supabaseAdmin();

  // Find user by stripe_customer_id
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) {
    // Fallback: pull customer metadata for the supabase_user_id
    const customer = await stripe().customers.retrieve(customerId);
    const userId =
      !customer.deleted && "metadata" in customer
        ? customer.metadata?.supabase_user_id
        : undefined;
    if (!userId) {
      console.warn(
        `[stripe webhook] no profile found for customer ${customerId} and no metadata`,
      );
      return;
    }
    await admin
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: currentPeriodEnd,
        price_id: priceId,
        plan: isActive ? "pro" : "free",
      })
      .eq("id", userId);
    return;
  }

  await admin
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: currentPeriodEnd,
      price_id: priceId,
      plan: isActive ? "pro" : "free",
    })
    .eq("id", profile.id);
}
