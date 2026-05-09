import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Create account · ResumeAI" };

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center bg-zinc-50/50 dark:bg-zinc-900/40 px-6 pt-16 pb-24">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Free forever. No credit card.
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-sm text-center text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
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
