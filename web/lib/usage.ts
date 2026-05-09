import type { Profile } from "@/types/database";

export const FREE_LIMIT = 5;

export const isSameMonth = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth();

export const monthlyUsage = (profile: Profile): number => {
  const now = new Date();
  const reset = new Date(profile.usage_reset_at);
  return isSameMonth(now, reset) ? profile.usage_count || 0 : 0;
};

export const remainingQuota = (profile: Profile): number => {
  if (profile.plan === "pro" || profile.plan === "team") return Infinity;
  return Math.max(0, FREE_LIMIT - monthlyUsage(profile));
};
