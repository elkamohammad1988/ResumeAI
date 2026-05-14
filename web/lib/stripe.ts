import Stripe from "stripe";
import { env, features } from "./env";

let _stripe: Stripe | null = null;

/**
 * Lazy Stripe singleton. Throws if STRIPE_SECRET_KEY is missing — callers
 * should check `features.stripe` before calling.
 */
export function stripe(): Stripe {
  if (!features.stripe || !env.STRIPE_SECRET_KEY) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PRICE_PRO_MONTHLY.",
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
      appInfo: {
        name: "ResumeAI",
        version: "0.1.0",
      },
    });
  }
  return _stripe;
}

export type Cadence = "monthly" | "yearly";

export function priceIdFor(cadence: Cadence): string {
  const id =
    cadence === "yearly"
      ? env.STRIPE_PRICE_PRO_YEARLY
      : env.STRIPE_PRICE_PRO_MONTHLY;
  if (!id) {
    throw new Error(
      `Stripe price ID missing for ${cadence}. Set STRIPE_PRICE_PRO_${cadence.toUpperCase()}.`,
    );
  }
  return id;
}
