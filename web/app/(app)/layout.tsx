import { redirect } from "next/navigation";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        user={{
          email: user.email,
          full_name: profile?.full_name ?? null,
        }}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 animate-fadeIn">{children}</main>
      </div>
    </div>
  );
}
