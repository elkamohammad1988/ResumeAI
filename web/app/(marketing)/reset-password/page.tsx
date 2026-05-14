import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = { title: "Set a new password · ResumeAI" };

export default async function ResetPasswordPage() {
  // The recovery-link callback exchanges the code and lands here with a session.
  // If there's no session, the user clicked a stale/invalid link — bounce.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/forgot-password?error=invalid_link");
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center bg-zinc-50/50 dark:bg-zinc-900/40 px-6 pt-16 pb-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            For {user.email}
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
