import React from "react";

export default function RouteLoading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="h-4 w-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-[#00d96f] rounded-full animate-spin" />
        Loading…
      </div>
    </div>
  );
}
