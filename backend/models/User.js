import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    // Plan vocabulary
    // - "free"    — default
    // - "pro"     — new (Stripe-paid)
    // - "premium" — legacy alias, retained for backwards compatibility
    //   with users created before Stripe was wired up. Both "pro" and
    //   "premium" are treated as paid by remainingQuota().
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },

    // Usage tracking (resets monthly)
    usageCount: { type: Number, default: 0 },
    usageResetAt: { type: Date, default: () => new Date() },

    // ─── Stripe (all optional; only populated after first Checkout) ───
    stripeCustomerId: { type: String, index: true, sparse: true },
    stripeSubscriptionId: { type: String, index: true, sparse: true },
    subscriptionStatus: {
      type: String,
      enum: [
        "trialing",
        "active",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "canceled",
        "unpaid",
        "paused",
        null,
      ],
      default: null,
    },
    currentPeriodEnd: { type: Date, default: null },
    priceId: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
