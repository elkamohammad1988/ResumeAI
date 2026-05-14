import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Untyped to keep webhook/admin operations flexible. We don't get autocomplete
// on table fields, but Stripe webhook writes are well-tested independently.
let _admin: SupabaseClient | null = null;

/**
 * Server-only admin Supabase client (uses service_role key — bypasses RLS).
 * Use ONLY in trusted server contexts (webhooks, scheduled jobs).
 * Never import from client components.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Supabase admin not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!_admin) {
    _admin = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );
  }
  return _admin;
}
