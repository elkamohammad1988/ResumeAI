"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { signOut } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/generator", label: "Generator" },
  { href: "/settings", label: "Settings" },
];

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Mobile: show logo + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open menu"
            className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/" className="text-zinc-900 dark:text-white">
            <Logo />
          </Link>
        </div>

        {/* Desktop: page title is implicit via the route's heading */}
        <div className="hidden md:block" />

        <div className="flex items-center gap-3">
          <ThemeToggle variant="light" />
          <form action={signOut}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Mobile slide-out */}
      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-3 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
