import { z } from "zod";

/**
 * Server-side env vars (never expose to client).
 * Validated at boot — boot fails fast on misconfiguration.
 */
const serverSchema = z.object({
  // Supabase (server-side admin operations)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // Stripe — optional so build works without keys; runtime checks before use
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_").optional(),
  STRIPE_PRICE_PRO_YEARLY: z.string().startsWith("price_").optional(),

  // AI
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Public env vars (safe to expose to client).
 * Must be prefixed NEXT_PUBLIC_ and statically inlined by Next.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const serverParsed = serverSchema.safeParse(process.env);
const publicParsed = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!serverParsed.success && typeof window === "undefined") {
  console.error(
    "[env] Server env validation failed:\n",
    serverParsed.error.flatten().fieldErrors,
  );
}

if (!publicParsed.success) {
  console.error(
    "[env] Public env validation failed — see .env.example:\n",
    publicParsed.error.flatten().fieldErrors,
  );
}

type ServerEnv = Partial<z.infer<typeof serverSchema>>;
type PublicEnv = Partial<z.infer<typeof publicSchema>>;

/**
 * Validated env. All fields typed as optional so callers must null-check —
 * works even when some env vars are missing (which we explicitly support
 * for Stripe, OpenAI, etc.).
 */
export const env: ServerEnv & PublicEnv = {
  ...(serverParsed.success ? serverParsed.data : ({} as ServerEnv)),
  ...(publicParsed.success ? publicParsed.data : ({} as PublicEnv)),
};

/** Type-safe checks for optional features. */
export const features = {
  stripe: Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.STRIPE_PRICE_PRO_MONTHLY,
  ),
  gemini: Boolean(env.GEMINI_API_KEY),
  openai: Boolean(env.OPENAI_API_KEY),
};
