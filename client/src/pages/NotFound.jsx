import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white dark:bg-zinc-950 flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center mb-6">
          <span className="text-7xl font-bold tracking-tighter text-[#0a0a0a] dark:text-white">
            4
          </span>
          <span className="relative mx-0.5">
            <span className="text-7xl font-bold tracking-tighter text-[#00d96f]">
              0
            </span>
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-[#00d96f]/40 animate-spin pointer-events-none" />
          </span>
          <span className="text-7xl font-bold tracking-tighter text-[#0a0a0a] dark:text-white">
            4
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm transition-colors"
          >
            Back to home
          </Link>
          <Link
            to="/generator"
            className="px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Open the generator
          </Link>
        </div>
      </div>
    </div>
  );
}
