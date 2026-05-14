"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export async function deleteResumeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/dashboard");

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
