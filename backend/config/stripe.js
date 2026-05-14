import Stripe from "stripe";

let _stripe = null;

export const stripeEnabled = () =>
  Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRICE_PRO_MONTHLY,
  );

export const stripe = () => {
  if (!stripeEnabled()) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PRICE_PRO_MONTHLY.",
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      typescript: false,
      appInfo: { name: "ResumeAI", version: "1.0.0" },
    });
  }
  return _stripe;
};

export const priceIdFor = (cadence) => {
  const id =
    cadence === "yearly"
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!id) {
    throw new Error(
      `Stripe price ID missing for ${cadence}. Set STRIPE_PRICE_PRO_${cadence.toUpperCase()}.`,
    );
  }
  return id;
};
