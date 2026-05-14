export const FREE_MONTHLY_LIMIT = 5;

// Plans that bypass the monthly quota. "premium" is a legacy alias kept so
// existing rows (created before Stripe was wired up) keep working.
export const PAID_PLANS = new Set(["pro", "premium"]);

export const isPaid = (user) => PAID_PLANS.has(user?.plan);

export const isSameMonth = (a, b) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth();

export const monthlyUsage = (user) => {
  const now = new Date();
  const reset = user.usageResetAt ? new Date(user.usageResetAt) : now;
  return isSameMonth(now, reset) ? user.usageCount || 0 : 0;
};

export const remainingQuota = (user) => {
  if (isPaid(user)) return Infinity;
  return Math.max(0, FREE_MONTHLY_LIMIT - monthlyUsage(user));
};

// Source-of-truth on "is currently subscribed?" — uses live Stripe state
// when available, falls back to plan field for legacy users.
export const isSubscribed = (user) => {
  if (!user) return false;
  if (user.plan === "premium") return true; // legacy
  if (user.plan === "pro" || user.plan === "team") {
    if (
      user.subscriptionStatus === "active" ||
      user.subscriptionStatus === "trialing"
    ) {
      if (user.currentPeriodEnd) {
        return new Date(user.currentPeriodEnd) > new Date();
      }
      return true;
    }
    // Plan is "pro" but no active subscription state — treat as expired
    return false;
  }
  return false;
};
