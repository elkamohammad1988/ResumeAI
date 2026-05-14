import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { FREE_LIMIT, monthlyUsage } from "@/lib/usage";
import { isPremium } from "@/types/database";
import { GeneratorForm } from "./GeneratorForm";

export const metadata = { title: "Generator · ResumeAI" };

export default async function GeneratorPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/generator");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const premium = isPremium(profile);
  const usage = profile ? monthlyUsage(profile) : 0;
  const limit = premium ? null : FREE_LIMIT;
  const quotaExceeded = limit !== null && usage >= limit;

  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-4xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Generate your resume
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Fill in your details. AI does the writing.
          </p>
        </div>
        {limit !== null && (
          <div className="shrink-0 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Usage this month
            </div>
            <div className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
              {usage} / {limit}
            </div>
            <div className="mt-1.5 h-1 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  limit - usage > 1
                    ? "bg-accent"
                    : limit - usage === 1
                      ? "bg-amber-400"
                      : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(100, (usage / limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {limit === null && (
          <div className="shrink-0 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Usage this month
            </div>
            <div className="mt-0.5 text-sm font-semibold text-accent-deep dark:text-accent">
              {usage} · Unlimited
            </div>
          </div>
        )}
      </header>

      {quotaExceeded && (
        <div className="mb-6 relative overflow-hidden rounded-xl bg-[#0a0a0a] dark:bg-zinc-900 border border-accent/30 p-5 flex flex-wrap items-center justify-between gap-4">
          <div
            className="absolute -bottom-20 right-0 h-48 w-48 opacity-30 blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(0,217,111,0.6) 0%, rgba(0,217,111,0) 70%)",
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-sm font-semibold text-white">
              You&apos;ve used all {limit} free generations this month.
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Upgrade to Pro for unlimited resumes, JD targeting, and version
              history.
            </p>
          </div>
          <Link
            href="/pricing"
            className="relative px-4 py-2 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow-strong transition-all hover:-translate-y-px"
          >
            See plans →
          </Link>
        </div>
      )}

      <GeneratorForm quotaExceeded={quotaExceeded} />
    </div>
  );
}
