import { supabaseServer } from "@/lib/supabase/server";
import { features } from "@/lib/env";
import { isPremium as checkPremium } from "@/types/database";
import { PricingClient } from "./PricingClient";

export const metadata = { title: "Pricing · ResumeAI" };

const TIERS = [
  {
    name: "Free",
    cadenceLabel: "forever",
    monthly: 0,
    yearly: 0,
    summary: "For job seekers who want polished resumes without commitment.",
    cta: "Start free",
    href: "/register",
    featured: false,
    features: [
      "5 generations / month",
      "All 4 PDF templates",
      "Cover letter included",
      "Multi-language (EN / FR / AR)",
      "Photo upload",
    ],
  },
  {
    name: "Pro",
    cadenceLabel: "/ month",
    monthly: 9,
    yearly: 7,
    summary: "For active job seekers iterating on multiple roles.",
    cta: "Start Pro",
    href: null,
    featured: true,
    features: [
      "Unlimited generations",
      "Job-description targeting",
      "Resume version history",
      "Priority AI queue",
      "Email support",
    ],
  },
  {
    name: "Team",
    cadenceLabel: "/ month",
    monthly: 29,
    yearly: 23,
    summary: "For career coaches and bootcamps managing many candidates.",
    cta: "Contact sales",
    href: "mailto:hello@resumeai.app?subject=Team plan inquiry",
    featured: false,
    features: [
      "Up to 10 seats",
      "Shared workspace",
      "Branded PDFs",
      "Bulk imports",
      "Dedicated support",
    ],
  },
];

export default async function PricingPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("plan, subscription_status, current_period_end")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="bg-white dark:bg-zinc-950">
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-6 md:pt-28 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-accent-deep dark:text-accent bg-accent/10 border border-accent/20 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Pricing
        </span>
        <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-balance text-zinc-900 dark:text-white leading-[1.05]">
          Simple, honest pricing.
        </h1>
        <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Start free. Upgrade only when you&apos;re actively job-hunting and
          need unlimited iterations.
        </p>
      </section>

      <PricingClient
        tiers={TIERS}
        stripeConfigured={features.stripe}
        authenticated={!!user}
        isPremium={checkPremium(profile)}
      />
    </div>
  );
}
