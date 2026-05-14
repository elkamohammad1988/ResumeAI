import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { openBillingPortal } from "@/app/billing/actions";
import { features } from "@/lib/env";
import { isPremium } from "@/types/database";

export const metadata = { title: "Settings · ResumeAI" };

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const premium = isPremium(profile);

  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your account, plan, and billing.
        </p>
      </header>

      {/* Account */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Row label="Name" value={profile?.full_name || "—"} />
          <Row label="Email" value={user.email || "—"} />
          <Row
            label="Member since"
            value={
              profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"
            }
          />
        </CardBody>
      </Card>

      {/* Plan + billing */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full ${
                    premium
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-accent/10 text-accent-deep dark:text-accent"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      premium ? "bg-amber-500" : "bg-accent"
                    }`}
                  />
                  {premium ? "Pro" : "Free"}
                </span>
                {profile?.subscription_status && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                    · {profile.subscription_status}
                  </span>
                )}
              </div>
              {profile?.current_period_end && (
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Renews{" "}
                  {new Date(profile.current_period_end).toLocaleDateString(
                    undefined,
                    { dateStyle: "long" },
                  )}
                </p>
              )}
            </div>

            <div>
              {!premium ? (
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow transition-all hover:-translate-y-px"
                >
                  Upgrade to Pro →
                </Link>
              ) : features.stripe && profile?.stripe_customer_id ? (
                <form action={openBillingPortal}>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Manage subscription
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Coming soon */}
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc pl-5">
            <li>Change password</li>
            <li>Two-factor authentication</li>
            <li>Delete account</li>
            <li>Email notification preferences</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="text-sm text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}
