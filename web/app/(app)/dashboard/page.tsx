import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FREE_LIMIT, monthlyUsage } from "@/lib/usage";
import { isPremium } from "@/types/database";

export const metadata = { title: "Dashboard · ResumeAI" };

type SearchParams = { checkout?: string; password_reset?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { checkout, password_reset } = await searchParams;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileQuery, resumesQuery] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("resumes")
      .select("id, name, job_title, language, template, job_description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const profile = profileQuery.data;
  const resumes = resumesQuery.data ?? [];
  const usage = profile ? monthlyUsage(profile) : 0;
  const premium = isPremium(profile);
  const limit = premium ? null : FREE_LIMIT;

  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-6xl">
      {/* One-shot banners */}
      {checkout === "success" && (
        <SuccessBanner
          title="Welcome to Pro!"
          body="Your subscription is active. Unlimited generations are unlocked."
        />
      )}
      {password_reset === "success" && (
        <SuccessBanner
          title="Password updated"
          body="You're signed in with your new password."
        />
      )}

      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Your resumes
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {resumes.length === 0
              ? "Saved generations will appear here."
              : `${resumes.length} saved generation${resumes.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link href="/generator">
          <Button>+ New resume</Button>
        </Link>
      </header>

      {/* Usage card */}
      <Card className="mb-10 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Usage this month
          </div>
          {limit === null ? (
            <div className="mt-0.5 text-lg font-semibold text-accent-deep dark:text-accent">
              {usage} · Unlimited
            </div>
          ) : (
            <>
              <div className="mt-0.5 text-lg font-semibold text-zinc-900 dark:text-white">
                {usage} / {limit}
              </div>
              <div className="mt-2 h-1 w-48 max-w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
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
            </>
          )}
        </div>
        {limit !== null && usage >= limit ? (
          <Link href="/pricing">
            <Button>Upgrade to Pro →</Button>
          </Link>
        ) : null}
      </Card>

      {resumes.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {resumes.map((r) => (
            <li
              key={r.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow transition"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                {r.name}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                {r.job_title}
              </p>
              <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
                <span>·</span>
                <Badge>{r.template}</Badge>
                <Badge>{r.language.toUpperCase()}</Badge>
                {r.job_description && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-accent-deep dark:text-accent bg-accent/10 border border-accent/20 rounded">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    Tailored
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded capitalize">
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <Card className="px-8 py-20 text-center border-dashed">
      <CardBody className="p-0">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent-deep dark:text-accent mb-5">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="m9 14 2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Nothing here yet
        </h3>
        <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
          Generate your first resume in under a minute. AI handles the
          writing, you pick the template.
        </p>
        <Link
          href="/generator"
          className="inline-block mt-6 px-5 py-2.5 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow transition-all hover:-translate-y-px"
        >
          Generate now →
        </Link>
      </CardBody>
    </Card>
  );
}

function SuccessBanner({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-lg">
      <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent-deep dark:text-accent">
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{body}</p>
      </div>
    </div>
  );
}
