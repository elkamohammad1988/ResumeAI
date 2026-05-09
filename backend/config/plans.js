export const FREE_MONTHLY_LIMIT = 5;

export const isSameMonth = (a, b) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth();

export const monthlyUsage = (user) => {
  const now = new Date();
  const reset = user.usageResetAt ? new Date(user.usageResetAt) : now;
  return isSameMonth(now, reset) ? user.usageCount || 0 : 0;
};

export const remainingQuota = (user) => {
  if (user.plan === "premium") return Infinity;
  return Math.max(0, FREE_MONTHLY_LIMIT - monthlyUsage(user));
};
