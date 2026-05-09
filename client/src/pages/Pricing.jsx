import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal from "../components/Reveal.jsx";

const TIERS = [
  {
    name: "Free",
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
      "ATS-tuned output",
    ],
  },
  {
    name: "Pro",
    monthly: 9,
    yearly: 7,
    summary: "For active job seekers iterating on multiple roles.",
    cta: "Start Pro trial",
    href: "/register",
    featured: true,
    features: [
      "Unlimited generations",
      "Job-description targeting",
      "Resume version history",
      "Priority AI queue",
      "Email support",
      "Everything in Free",
    ],
  },
  {
    name: "Team",
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
      "Everything in Pro",
    ],
  },
];

const COMPARE_ROWS = [
  { label: "Generations / month", values: ["5", "Unlimited", "Unlimited"] },
  { label: "PDF templates", values: ["All 4", "All 4", "All 4 + custom branding"] },
  { label: "Job-description targeting", values: [false, true, true] },
  { label: "Cover letter", values: [true, true, true] },
  { label: "Multi-language", values: [true, true, true] },
  { label: "Resume version history", values: [false, true, true] },
  { label: "Priority AI queue", values: [false, true, true] },
  { label: "Team seats", values: ["1", "1", "Up to 10"] },
  { label: "Bulk imports", values: [false, false, true] },
  { label: "Support", values: ["Community", "Email", "Dedicated"] },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [billing, setBilling] = useState("yearly");

  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12 md:pt-28 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-[#00a350] dark:text-[#00d96f] bg-[#00d96f]/10 border border-[#00d96f]/20 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00d96f]" />
            Pricing
          </span>
        </Reveal>
        <Reveal delay={120}>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-balance text-[#0a0a0a] dark:text-white leading-[1.05]">
            Simple, honest pricing.
          </h1>
        </Reveal>
        <Reveal delay={240}>
          <p className="mt-5 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade only when you&apos;re actively job-hunting and
            need unlimited iterations.
          </p>
        </Reveal>

        {/* Billing toggle */}
        <Reveal delay={320}>
          <div className="mt-10 inline-flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 relative">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                billing === "monthly"
                  ? "bg-white dark:bg-zinc-950 text-[#0a0a0a] dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`relative px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                billing === "yearly"
                  ? "bg-white dark:bg-zinc-950 text-[#0a0a0a] dark:text-white shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              Yearly
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-[#00a350] dark:text-[#00d96f] bg-[#00d96f]/15 rounded">
                −22%
              </span>
            </button>
          </div>
        </Reveal>
      </section>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 100}>
              <Tier
                tier={tier}
                billing={billing}
                isAuthenticated={isAuthenticated}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Compare table */}
      <section className="bg-zinc-50/50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-[#00a350] dark:text-[#00d96f] uppercase tracking-wider">
                Compare
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                Every feature, side by side.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="grid grid-cols-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Feature
                </span>
                <span className="text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Free
                </span>
                <span className="text-center text-xs font-semibold text-[#00a350] dark:text-[#00d96f] uppercase tracking-wider">
                  Pro
                </span>
                <span className="text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Team
                </span>
              </div>
              {COMPARE_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-4 px-6 py-3 border-b last:border-0 border-zinc-100 dark:border-zinc-800"
                >
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {row.label}
                  </span>
                  {row.values.map((v, i) => (
                    <span
                      key={i}
                      className="text-center text-sm text-zinc-700 dark:text-zinc-300 flex items-center justify-center"
                    >
                      <CompareCell value={v} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
              Not ready to commit?
            </h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Free is genuinely free. No credit card. No trial countdown. Use
              it until you actually need more.
            </p>
            <Link
              to={isAuthenticated ? "/generator" : "/register"}
              className="inline-block mt-8 px-7 py-3.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-[0_8px_24px_-4px_rgba(0,217,111,0.5)] transition-all hover:-translate-y-px"
            >
              {isAuthenticated ? "Open the generator →" : "Start free"}
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CompareCell({ value }) {
  if (value === true) {
    return (
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5 text-[#00d96f]"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (value === false) {
    return <span className="text-zinc-300 dark:text-zinc-600">—</span>;
  }
  return <span>{value}</span>;
}

function Tier({ tier, billing, isAuthenticated }) {
  const featured = tier.featured;
  const price = billing === "yearly" ? tier.yearly : tier.monthly;
  const cadence = billing === "yearly" ? "/ mo, billed yearly" : "/ month";

  const wrapClass = featured
    ? "relative bg-[#0a0a0a] dark:bg-zinc-900 border border-[#00d96f]/40 ring-1 ring-[#00d96f]/30 shadow-[0_30px_60px_-20px_rgba(0,217,111,0.4)]"
    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors";

  return (
    <div className={`${wrapClass} rounded-2xl p-8 flex flex-col h-full`}>
      {featured && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-black bg-[#00d96f] rounded-full">
          <span className="h-1 w-1 rounded-full bg-black" />
          Recommended
        </span>
      )}
      <h3
        className={`text-sm font-semibold uppercase tracking-wider ${
          featured ? "text-[#00d96f]" : "text-[#00a350] dark:text-[#00d96f]"
        }`}
      >
        {tier.name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={`text-5xl font-bold tracking-tight ${
            featured ? "text-white" : "text-[#0a0a0a] dark:text-white"
          }`}
        >
          ${price}
        </span>
        <span
          className={`text-sm ${
            featured ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {price === 0 ? "forever" : cadence}
        </span>
      </div>
      {billing === "yearly" && tier.monthly > 0 && (
        <div
          className={`mt-1 text-xs ${
            featured ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          <span className="line-through">${tier.monthly}/mo</span>
          <span className="ml-2 text-[#00a350] dark:text-[#00d96f] font-semibold">
            Save ${(tier.monthly - tier.yearly) * 12}/year
          </span>
        </div>
      )}
      <p
        className={`mt-3 text-sm leading-relaxed ${
          featured ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {tier.summary}
      </p>

      <Link
        to={isAuthenticated && tier.name !== "Team" ? "/generator" : tier.href}
        className={`mt-6 px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all ${
          featured
            ? "text-black bg-[#00d96f] hover:bg-[#00c463] shadow-[0_8px_24px_-4px_rgba(0,217,111,0.5)] hover:-translate-y-px"
            : "text-[#0a0a0a] dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
        }`}
      >
        {isAuthenticated && tier.name !== "Team"
          ? "Use this plan"
          : tier.cta}
      </Link>

      <ul
        className={`mt-8 space-y-3 text-sm ${
          featured ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <svg
              viewBox="0 0 20 20"
              className="mt-0.5 shrink-0 h-4 w-4 text-[#00d96f]"
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
