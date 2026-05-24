"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { isUuid } from "@/lib/safe-redirect";

export async function deleteResumeAction(formData: FormData) {
  const rawId = formData.get("id");
  // Reject non-UUID input early — Postgres would still reject via 22P02,
  // but doing it here avoids hitting the DB on garbage input and prevents
  // any future PostgREST error message from leaking through.
  if (!isUuid(rawId)) redirect("/dashboard");
  const id = rawId as string;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Defense in depth: both the explicit user_id filter and the RLS policy
  // on `resumes` enforce ownership. Either alone would suffice.
  await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
