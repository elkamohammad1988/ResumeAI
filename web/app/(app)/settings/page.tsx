import { supabaseServer } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings · ResumeAI" };

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your account and plan.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardBody className="space-y-3">
          <Row label="Name" value={profile?.full_name || "—"} />
          <Row label="Email" value={user?.email || "—"} />
          <Row
            label="Plan"
            value={
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full ${
                  profile?.plan === "pro" || profile?.plan === "team"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-accent/10 text-accent-deep dark:text-accent"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    profile?.plan === "pro" || profile?.plan === "team"
                      ? "bg-amber-500"
                      : "bg-accent"
                  }`}
                />
                {profile?.plan ?? "free"}
              </span>
            }
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardBody>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc pl-5">
            <li>Change password</li>
            <li>Stripe upgrade to Pro</li>
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
