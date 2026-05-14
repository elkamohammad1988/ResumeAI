"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";
import { buildPrompt, splitOutput } from "@/lib/ai/prompts";
import { FREE_LIMIT, isSameMonth, monthlyUsage } from "@/lib/usage";
import { features } from "@/lib/env";
import { isPremium, type Language, type Template } from "@/types/database";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  jobTitle: z.string().trim().min(1, "Target job title is required").max(120),
  jobDescription: z.string().trim().max(8000).optional().or(z.literal("")),
  skills: z.string().trim().max(2000).optional().or(z.literal("")),
  experience: z.string().trim().max(8000).optional().or(z.literal("")),
  education: z.string().trim().max(2000).optional().or(z.literal("")),
  language: z.enum(["en", "fr", "ar"]).default("en"),
  template: z
    .enum(["executive", "modern", "classic", "creative"])
    .default("executive"),
});

export type GenerateState =
  | { ok: true; resumeId: string }
  | { ok: false; error: string; code?: "quota_exceeded" | "ai_not_configured" | "validation" | "unknown" };

export async function generateResumeAction(
  _prev: GenerateState | null,
  formData: FormData,
): Promise<GenerateState> {
  if (!features.gemini) {
    return {
      ok: false,
      error: "AI generation is not configured. Set GEMINI_API_KEY.",
      code: "ai_not_configured",
    };
  }

  // Parse + validate
  const parsed = formSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    jobTitle: formData.get("jobTitle") ?? "",
    jobDescription: formData.get("jobDescription") ?? "",
    skills: formData.get("skills") ?? "",
    experience: formData.get("experience") ?? "",
    education: formData.get("education") ?? "",
    language: (formData.get("language") as Language) ?? "en",
    template: (formData.get("template") as Template) ?? "executive",
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    const first = Object.values(flat).flat()[0];
    return {
      ok: false,
      error: first || "Please check the form fields.",
      code: "validation",
    };
  }

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/generator");

  // Quota enforcement (free plan only)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const premium = isPremium(profile);
  if (!premium) {
    const used = profile ? monthlyUsage(profile) : 0;
    if (used >= FREE_LIMIT) {
      return {
        ok: false,
        error: `You've used all ${FREE_LIMIT} free generations this month. Upgrade to Pro for unlimited.`,
        code: "quota_exceeded",
      };
    }
  }

  // Call Gemini
  let raw: string;
  try {
    raw = await generateText(buildPrompt(parsed.data));
  } catch (err) {
    console.error("[generator] Gemini error:", err);
    return {
      ok: false,
      error:
        err instanceof Error
          ? `AI generation failed: ${err.message}`
          : "AI generation failed.",
      code: "unknown",
    };
  }

  const { resume, coverLetter } = splitOutput(raw);
  if (!resume) {
    return {
      ok: false,
      error: "AI returned empty output. Try again.",
      code: "unknown",
    };
  }

  // Persist resume
  const { data: insertedRow, error: insertErr } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      job_title: parsed.data.jobTitle,
      job_description: parsed.data.jobDescription || null,
      skills: parsed.data.skills || null,
      experience: parsed.data.experience || null,
      education: parsed.data.education || null,
      language: parsed.data.language,
      template: parsed.data.template,
      resume,
      cover_letter: coverLetter || null,
    } as never)
    .select("id")
    .single();

  if (insertErr || !insertedRow) {
    console.error("[generator] DB insert failed:", insertErr);
    return {
      ok: false,
      error: "Saved generation failed. Try again.",
      code: "unknown",
    };
  }

  // Increment quota counter (free plan only)
  if (!premium && profile) {
    const now = new Date();
    const reset = new Date(profile.usage_reset_at);
    const update = isSameMonth(now, reset)
      ? { usage_count: (profile.usage_count ?? 0) + 1 }
      : { usage_count: 1, usage_reset_at: now.toISOString() };
    await supabase.from("profiles").update(update as never).eq("id", user.id);
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    resumeId: (insertedRow as { id: string }).id,
  };
}
