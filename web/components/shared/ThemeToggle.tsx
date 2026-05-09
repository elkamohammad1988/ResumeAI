"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const onDarkBg = variant === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition-colors ${
        onDarkBg
          ? "border-white/15 bg-white/5 hover:bg-white/10"
          : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      }`}
    >
      <SunIcon
        className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-30 text-zinc-500" : "opacity-90 text-amber-400"
        }`}
      />
      <MoonIcon
        className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-90 text-indigo-200" : "opacity-30 text-zinc-500"
        }`}
      />
      <span
        className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM17 10a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM5 10a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
    </svg>
  );
}
