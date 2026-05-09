import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Pricing · ResumeAI" };

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
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
    price: "$9",
    cadence: "/ month",
    summary: "For active job seekers iterating on multiple roles.",
    cta: "Start Pro",
    href: "/register",
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
    price: "$29",
    cadence: "/ month",
    summary: "For career coaches and bootcamps managing many candidates.",
    cta: "Contact sales",
    href: "mailto:hello@resumeai.app",
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

  return (
    <div className="bg-white dark:bg-zinc-950">
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 md:pt-28 text-center">
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

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <Tier key={tier.name} tier={tier} authed={!!user} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Tier({
  tier,
  authed,
}: {
  tier: (typeof TIERS)[number];
  authed: boolean;
}) {
  const wrapClass = tier.featured
    ? "relative bg-[#0a0a0a] dark:bg-zinc-900 border border-accent/40 ring-1 ring-accent/30 shadow-[0_30px_60px_-20px_rgba(0,217,111,0.4)]"
    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800";

  return (
    <div className={`${wrapClass} rounded-2xl p-8 flex flex-col`}>
      {tier.featured && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-black bg-accent rounded-full">
          <span className="h-1 w-1 rounded-full bg-black" />
          Recommended
        </span>
      )}
      <h3
        className={`text-sm font-semibold uppercase tracking-wider ${
          tier.featured ? "text-accent" : "text-accent-deep dark:text-accent"
        }`}
      >
        {tier.name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={`text-5xl font-bold tracking-tight ${
            tier.featured ? "text-white" : "text-zinc-900 dark:text-white"
          }`}
        >
          {tier.price}
        </span>
        <span
          className={`text-sm ${
            tier.featured ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {tier.cadence}
        </span>
      </div>
      <p
        className={`mt-3 text-sm leading-relaxed ${
          tier.featured ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {tier.summary}
      </p>
      <Link
        href={authed && tier.name !== "Team" ? "/dashboard" : tier.href}
        className={`mt-6 px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
          tier.featured
            ? "text-black bg-accent hover:bg-accent-dark ring-glow-strong hover:-translate-y-px"
            : "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        {authed && tier.name !== "Team" ? "Use this plan" : tier.cta}
      </Link>
      <ul
        className={`mt-8 space-y-3 text-sm ${
          tier.featured ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 shrink-0 h-4 w-4 text-accent"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
