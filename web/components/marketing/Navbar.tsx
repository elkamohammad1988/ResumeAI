"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

const linkClass = (active: boolean) =>
  cn(
    "px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
    active
      ? "text-white bg-white/10"
      : "text-zinc-400 hover:text-white hover:bg-white/5",
  );

export function MarketingNavbar({ user }: { user: { email?: string } | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const close = () => setMobileOpen(false);

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 transition-all duration-200 text-white",
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10"
          : "bg-[#0a0a0a] border-b border-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" onClick={close} className="text-white">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />
          <Link href="/" className={linkClass(pathname === "/")}>
            Home
          </Link>
          <Link href="/pricing" className={linkClass(pathname === "/pricing")}>
            Pricing
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="ml-2 px-3.5 py-1.5 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-md transition-colors ring-glow"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className={linkClass(pathname === "/login")}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-2 px-3.5 py-1.5 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-md transition-colors ring-glow"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="p-2 text-zinc-300 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-14 bg-[#0a0a0a] border-b border-white/10 shadow-2xl">
          <div className="px-6 py-5 flex flex-col gap-1">
            <MobileLink href="/" onClick={close}>
              Home
            </MobileLink>
            <MobileLink href="/pricing" onClick={close}>
              Pricing
            </MobileLink>
            {user ? (
              <Link
                href="/dashboard"
                onClick={close}
                className="mt-3 px-4 py-3 text-center text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-md"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <MobileLink href="/login" onClick={close}>
                  Sign in
                </MobileLink>
                <Link
                  href="/register"
                  onClick={close}
                  className="mt-3 px-4 py-3 text-center text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-md"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-md"
    >
      {children}
    </Link>
  );
}
