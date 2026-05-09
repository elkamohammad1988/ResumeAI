import { MarketingNavbar } from "@/components/marketing/Navbar";
import { MarketingFooter } from "@/components/marketing/Footer";
import { supabaseServer } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <MarketingNavbar user={user ? { email: user.email } : null} />
      <main className="flex-1 animate-fadeIn">{children}</main>
      <MarketingFooter />
    </div>
  );
}
