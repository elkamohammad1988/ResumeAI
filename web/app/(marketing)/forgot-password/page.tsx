import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata = { title: "Forgot password · ResumeAI" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center bg-zinc-50/50 dark:bg-zinc-900/40 px-6 pt-16 pb-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We&apos;ll send a recovery link to your inbox.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="mt-6 text-sm text-center text-zinc-600 dark:text-zinc-400">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-900 dark:text-white hover:text-accent-deep dark:hover:text-accent"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
