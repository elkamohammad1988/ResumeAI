"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          We hit an unexpected error rendering this page. Your data is safe.
        </p>
        {error.digest && (
          <p className="mt-3 text-[10px] font-mono text-zinc-400">
            ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <a
            href="/dashboard"
            className="px-5 py-2 text-sm font-semibold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
