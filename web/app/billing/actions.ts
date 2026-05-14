"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { stripe, priceIdFor, type Cadence } from "@/lib/stripe";
import { env, features } from "@/lib/env";

/**
 * Create or reuse a Stripe Checkout session for the signed-in user
 * and redirect them to Stripe's hosted checkout page.
 */
export async function checkout(formData: FormData) {
  if (!features.stripe) {
    redirect("/pricing?error=stripe_not_configured");
  }

  const cadence = (formData.get("cadence") ?? "monthly") as Cadence;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pricing");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", user.id)
    .single();

  // Reuse existing customer or create a fresh one
  let customerId = profile?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: user.email,
      name: profile?.full_name ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const hdrs = await headers();
  const origin =
    env.NEXT_PUBLIC_APP_URL ||
    hdrs.get("origin") ||
    "http://localhost:3000";

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdFor(cadence), quantity: 1 }],
    client_reference_id: user.id,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
  });

  if (!session.url) {
    redirect("/pricing?error=checkout_failed");
  }
  redirect(session.url);
}

/**
 * Open the Stripe-hosted Customer Portal so the user can manage
 * payment method, cancel, switch plans, view invoices.
 */
export async function openBillingPortal() {
  if (!features.stripe) {
    redirect("/dashboard?error=stripe_not_configured");
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    redirect("/pricing");
  }

  const hdrs = await headers();
  const origin =
    env.NEXT_PUBLIC_APP_URL ||
    hdrs.get("origin") ||
    "http://localhost:3000";

  const portal = await stripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard`,
  });

  redirect(portal.url);
}
