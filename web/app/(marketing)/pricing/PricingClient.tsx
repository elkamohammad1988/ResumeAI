"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { checkout } from "@/app/billing/actions";
import { cn } from "@/lib/utils";

type Cadence = "monthly" | "yearly";

interface Tier {
  name: string;
  cadenceLabel: string;
  monthly: number;
  yearly: number;
  summary: string;
  cta: string;
  href: string | null; // null = use Stripe checkout
  featured: boolean;
  features: string[];
}

interface Props {
  tiers: Tier[];
  stripeConfigured: boolean;
  authenticated: boolean;
  isPremium: boolean;
}

export function PricingClient({
  tiers,
  stripeConfigured,
  authenticated,
  isPremium,
}: Props) {
  const [billing, setBilling] = useState<Cadence>("yearly");

  return (
    <>
      {/* Billing toggle */}
      <div className="mt-10 flex justify-center">
        <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-5 py-1.5 text-sm font-semibold rounded-full transition-colors",
              billing === "monthly"
                ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "relative px-5 py-1.5 text-sm font-semibold rounded-full transition-colors",
              billing === "yearly"
                ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
            )}
          >
            Yearly
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold text-accent-deep dark:text-accent bg-accent/15 rounded">
              −22%
            </span>
          </button>
        </div>
      </div>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto px-6 mt-12 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <TierCard
              key={tier.name}
              tier={tier}
              billing={billing}
              stripeConfigured={stripeConfigured}
              authenticated={authenticated}
              isPremium={isPremium}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function TierCard({
  tier,
  billing,
  stripeConfigured,
  authenticated,
  isPremium,
}: {
  tier: Tier;
  billing: Cadence;
  stripeConfigured: boolean;
  authenticated: boolean;
  isPremium: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const price = billing === "yearly" ? tier.yearly : tier.monthly;
  const cadenceLabel =
    price === 0
      ? "forever"
      : billing === "yearly"
        ? "/ mo · billed yearly"
        : "/ month";

  const wrapClass = tier.featured
    ? "relative bg-[#0a0a0a] dark:bg-zinc-900 border border-accent/40 ring-1 ring-accent/30 shadow-[0_30px_60px_-20px_rgba(0,217,111,0.4)]"
    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800";

  // Decide button behavior:
  // - Free → /register or /dashboard
  // - Pro → Stripe checkout (if configured) OR /register if not signed in
  // - Team → mailto (always)
  let buttonNode: React.ReactNode;
  if (tier.name === "Free") {
    buttonNode = (
      <Link
        href={authenticated ? "/dashboard" : "/register"}
        className={cn(
          "block px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all",
          tier.featured
            ? "text-black bg-accent hover:bg-accent-dark ring-glow-strong hover:-translate-y-px"
            : "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700",
        )}
      >
        {authenticated ? "Open dashboard" : tier.cta}
      </Link>
    );
  } else if (tier.name === "Team") {
    buttonNode = (
      <a
        href={tier.href ?? "mailto:hello@resumeai.app"}
        className={cn(
          "block px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-colors",
          "text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700",
        )}
      >
        {tier.cta}
      </a>
    );
  } else {
    // Pro tier
    if (isPremium) {
      buttonNode = (
        <div className="block px-4 py-2.5 text-center text-sm font-semibold rounded-lg text-zinc-400 bg-zinc-50 dark:bg-zinc-800 cursor-default">
          You&apos;re on Pro ✓
        </div>
      );
    } else if (!authenticated) {
      buttonNode = (
        <Link
          href={`/register?next=${encodeURIComponent("/pricing")}`}
          className="block px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all text-black bg-accent hover:bg-accent-dark ring-glow-strong hover:-translate-y-px"
        >
          Sign up to subscribe
        </Link>
      );
    } else if (!stripeConfigured) {
      buttonNode = (
        <button
          disabled
          title="Stripe not configured yet"
          className="block w-full px-4 py-2.5 text-center text-sm font-semibold rounded-lg text-zinc-400 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed"
        >
          Coming soon
        </button>
      );
    } else {
      buttonNode = (
        <form
          action={(formData) =>
            startTransition(async () => {
              await checkout(formData);
            })
          }
        >
          <input type="hidden" name="cadence" value={billing} />
          <button
            type="submit"
            disabled={pending}
            className="w-full px-4 py-2.5 text-center text-sm font-semibold rounded-lg transition-all text-black bg-accent hover:bg-accent-dark ring-glow-strong hover:-translate-y-px disabled:opacity-60 disabled:cursor-wait"
          >
            {pending
              ? "Redirecting to Stripe…"
              : `Subscribe — $${price}/mo`}
          </button>
        </form>
      );
    }
  }

  return (
    <div className={`${wrapClass} rounded-2xl p-8 flex flex-col`}>
      {tier.featured && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold text-black bg-accent rounded-full">
          <span className="h-1 w-1 rounded-full bg-black" />
          Recommended
        </span>
      )}
      <h3
        className={cn(
          "text-sm font-semibold uppercase tracking-wider",
          tier.featured ? "text-accent" : "text-accent-deep dark:text-accent",
        )}
      >
        {tier.name}
      </h3>
      <div className="mt-3 flex items-baseline gap-1">
        <span
          className={cn(
            "text-5xl font-bold tracking-tight",
            tier.featured ? "text-white" : "text-zinc-900 dark:text-white",
          )}
        >
          ${price}
        </span>
        <span
          className={cn(
            "text-sm",
            tier.featured ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {cadenceLabel}
        </span>
      </div>
      {billing === "yearly" && tier.monthly > 0 && (
        <div
          className={cn(
            "mt-1 text-xs",
            tier.featured ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          <span className="line-through">${tier.monthly}/mo</span>
          <span className="ml-2 text-accent-deep dark:text-accent font-semibold">
            Save ${(tier.monthly - tier.yearly) * 12}/year
          </span>
        </div>
      )}
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          tier.featured ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400",
        )}
      >
        {tier.summary}
      </p>

      <div className="mt-6">{buttonNode}</div>

      <ul
        className={cn(
          "mt-8 space-y-3 text-sm",
          tier.featured ? "text-zinc-300" : "text-zinc-700 dark:text-zinc-300",
        )}
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
