"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { safeRedirect } from "@/lib/safe-redirect";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const passwordSchema = z.string().min(6).max(128);
const nameSchema = z.string().trim().min(1).max(120);

// Generic auth failure message — never expose whether an email exists or
// which credential was wrong (user-enumeration defense, OWASP A07).
const GENERIC_AUTH_ERROR = "Invalid email or password.";

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithPassword(formData: FormData) {
  const ip = await clientIp();
  const limit = await rateLimit({
    bucket: "auth:signin",
    limit: 5,
    windowMs: 15 * 60_000,
    identifier: ip,
  });
  if (!limit.ok) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      next: z.string().optional(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      next: formData.get("next") ?? undefined,
    });
  if (!parsed.success) {
    return { error: GENERIC_AUTH_ERROR };
  }
  const { email, password } = parsed.data;
  const next = safeRedirect(parsed.data.next);

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: GENERIC_AUTH_ERROR };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const ip = await clientIp();
  const limit = await rateLimit({
    bucket: "auth:signup",
    limit: 5,
    windowMs: 60 * 60_000,
    identifier: ip,
  });
  if (!limit.ok) {
    return {
      error: `Too many signups from this network. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const parsed = z
    .object({
      name: nameSchema,
      email: emailSchema,
      password: passwordSchema,
    })
    .safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
  if (!parsed.success) {
    const first = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return { error: first || "Please check the form fields." };
  }
  const { name: fullName, email, password } = parsed.data;

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });
  // Generic message on failure — Supabase's raw message can leak whether the
  // email is already registered ("User already registered").
  if (error) return { error: "Could not create the account. Try again." };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  // Two-key limiter: per-IP and per-email. Per-email throttles targeted
  // mailbox flooding; per-IP throttles scraped-list enumeration.
  const ip = await clientIp();
  const ipLimit = await rateLimit({
    bucket: "auth:reset:ip",
    limit: 5,
    windowMs: 60 * 60_000,
    identifier: ip,
  });
  if (!ipLimit.ok) {
    // Still return success-shape to avoid revealing the limiter to attackers.
    return { success: true };
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { success: true }; // Don't reveal validation either.
  }
  const email = parsed.data;

  const emailLimit = await rateLimit({
    bucket: "auth:reset:email",
    limit: 3,
    windowMs: 60 * 60_000,
    identifier: email,
  });
  if (!emailLimit.ok) {
    return { success: true };
  }

  const hdrs = await headers();
  const origin =
    env.NEXT_PUBLIC_APP_URL ||
    hdrs.get("origin") ||
    "http://localhost:3000";

  const supabase = await supabaseServer();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Always return success — prevents account enumeration regardless of
  // whether Supabase returned an error.
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Reset link expired or invalid. Request a new one." };
  }

  // Rate-limit per user to slow down anyone who hijacked a recovery session.
  const limit = await rateLimit({
    bucket: "auth:update-password",
    limit: 5,
    windowMs: 15 * 60_000,
    identifier: user.id,
  });
  if (!limit.ok) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { error: "Password must be 6–128 characters." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: "Could not update password. Try again." };

  revalidatePath("/", "layout");
  redirect("/dashboard?password_reset=success");
}
