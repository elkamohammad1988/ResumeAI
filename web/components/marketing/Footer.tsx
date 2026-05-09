import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-[#0a0a0a] text-zinc-400">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="text-white">
            <Logo />
          </Link>
          <p className="mt-4 text-sm text-zinc-500 max-w-sm leading-relaxed">
            AI-tuned resumes and cover letters in under 30 seconds. ATS-ready,
            recruiter-friendly, free forever.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Account
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link
                href="/login"
                className="hover:text-white transition-colors"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="hover:text-white transition-colors"
              >
                Create account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </footer>
  );
}
