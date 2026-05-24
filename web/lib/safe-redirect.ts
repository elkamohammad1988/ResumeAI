/**
 * Whitelist a user-controlled `next` redirect target. Prevents the open-redirect
 * pattern `?next=//evil.com` or `?next=https://attacker/...` that survives
 * naive checks like `next.startsWith("/")` (a leading `//` is "protocol-relative"
 * and most browsers treat it as cross-origin).
 *
 * Returns a safe path or the fallback if input is missing/unsafe.
 */
export function safeRedirect(
  next: unknown,
  fallback = "/dashboard",
): string {
  if (typeof next !== "string" || !next) return fallback;
  // Must start with exactly one "/" (no protocol-relative "//"), no backslashes
  // (Windows-style URLs), no whitespace.
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//")) return fallback;
  if (next.startsWith("/\\")) return fallback;
  if (/[\s\\]/.test(next)) return fallback;
  return next;
}

/**
 * RFC4122 UUID v1–v5 shape. Used to validate path params before hitting
 * Postgres (avoids 22P02 invalid_text_representation errors leaking through).
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(s: unknown): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}
