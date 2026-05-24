import { headers } from "next/headers";

/**
 * Fixed-window in-memory rate limiter for Next.js server actions and route
 * handlers. Keyed by `${bucket}:${identifier}` where identifier defaults to
 * the caller IP (X-Forwarded-For first hop, falling back to "unknown").
 *
 * Single-instance only — on multi-instance/serverless deployments each Lambda
 * has its own map, so the real rate per IP is `limit × instances`. For
 * production scale switch to @upstash/ratelimit (Redis) or a Postgres-backed
 * limiter. Even so, this is *defense in depth* over Supabase Auth's built-in
 * brute-force protection, not a replacement.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

// Background sweep to avoid unbounded growth. Runs every minute.
// `globalThis` keeps a single timer across hot reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __resumeai_ratelimit_timer__: NodeJS.Timeout | undefined;
}
if (!globalThis.__resumeai_ratelimit_timer__) {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets.entries()) {
      if (entry.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  // Don't keep the process alive just for the sweep timer.
  timer.unref?.();
  globalThis.__resumeai_ratelimit_timer__ = timer;
}

export interface RateLimitOptions {
  bucket: string;
  limit: number;
  windowMs: number;
  /** Override identifier (e.g. user id). Defaults to client IP. */
  identifier?: string;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function rateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const ident = options.identifier ?? (await clientIp());
  const key = `${options.bucket}:${ident}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + options.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: options.limit - 1, resetAt, retryAfterSeconds: 0 };
  }

  if (entry.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((entry.resetAt - now) / 1000),
    );
    return {
      ok: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }

  entry.count += 1;
  return {
    ok: true,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
    retryAfterSeconds: 0,
  };
}
