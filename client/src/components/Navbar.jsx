import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  const isPremium = user?.plan === "premium";

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#00d96f] text-black font-semibold text-sm hover:scale-105 transition-transform ring-2 ring-transparent hover:ring-white/20"
      >
        {initial}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#00d96f] text-black font-semibold">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#0a0a0a] dark:text-white truncate">
                  {user?.name || "Account"}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user?.email || ""}
                </div>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1 mt-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                isPremium
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPremium ? "bg-amber-500" : "bg-zinc-400"
                }`}
              />
              {isPremium ? "Premium" : "Free"}
            </span>
          </div>
          <div className="py-1">
            <NavLink
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <DashIcon /> Dashboard
            </NavLink>
            <NavLink
              to="/generator"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <GenIcon /> Generator
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <CogIcon /> Settings
            </NavLink>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 py-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <SignOutIcon /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const iconCls =
  "h-4 w-4 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600";
function DashIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}
function GenIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
function CogIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 text-sm font-medium transition-colors rounded-md ${
    isActive
      ? "text-white bg-white/10"
      : "text-zinc-400 hover:text-white hover:bg-white/5"
  }`;

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-7 w-14 items-center rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors mr-1"
    >
      {/* Sun icon — visible in light mode position */}
      <svg
        viewBox="0 0 20 20"
        className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-30 text-zinc-500" : "opacity-90 text-amber-300"
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.464-4.95a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0Zm-7.072 7.072a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM17 10a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 10a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm8.536 4.95a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414Zm-7.072 0a1 1 0 0 1-1.414 0L4.343 14.243a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
          clipRule="evenodd"
        />
      </svg>
      {/* Moon icon */}
      <svg
        viewBox="0 0 20 20"
        className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-90 text-indigo-200" : "opacity-30 text-zinc-500"
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
      </svg>
      {/* Slider knob */}
      <span
        className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Logo() {
  return (
    <span className="flex items-center gap-2 text-white font-semibold tracking-tight">
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-md bg-[#00d96f]" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      </span>
      <span>
        Resume<span className="text-[#00d96f]">AI</span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10"
          : "bg-[#0a0a0a] border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" onClick={closeMobile}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/pricing" className={linkClass}>
            Pricing
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/generator" className={linkClass}>
                Generator
              </NavLink>
              <ProfileMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
              <NavLink
                to="/register"
                className="ml-2 px-3.5 py-1.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-md transition-colors shadow-[0_0_0_1px_rgba(0,217,111,0.2),0_4px_12px_-2px_rgba(0,217,111,0.4)]"
              >
                Get started
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute inset-x-0 top-14 bg-[#0a0a0a] border-b border-white/10 shadow-2xl">
          <div className="px-6 py-5 flex flex-col gap-1">
            <MobileLink to="/" onClick={closeMobile}>
              Home
            </MobileLink>
            <MobileLink to="/pricing" onClick={closeMobile}>
              Pricing
            </MobileLink>
            {isAuthenticated ? (
              <>
                <MobileLink to="/dashboard" onClick={closeMobile}>
                  Dashboard
                </MobileLink>
                <MobileLink to="/generator" onClick={closeMobile}>
                  Generator
                </MobileLink>
                <MobileLink to="/settings" onClick={closeMobile}>
                  Settings
                </MobileLink>
                <button
                  onClick={handleLogout}
                  className="mt-2 px-3 py-3 text-left text-sm font-medium text-zinc-400 hover:text-white border-t border-white/10"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/login" onClick={closeMobile}>
                  Sign in
                </MobileLink>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="mt-3 px-4 py-3 text-center text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-md transition-colors"
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

function MobileLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `px-3 py-3 text-sm font-medium rounded-md ${
          isActive
            ? "text-white bg-white/10"
            : "text-zinc-300 hover:text-white hover:bg-white/5"
        }`
      }
      end={to === "/"}
    >
      {children}
    </NavLink>
  );
}
