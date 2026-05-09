import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center mb-6">
          <span className="text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            4
          </span>
          <span className="relative mx-0.5">
            <span className="text-7xl font-bold tracking-tighter text-accent">
              0
            </span>
            <span className="absolute inset-0 rounded-full border-2 border-dashed border-accent/40 animate-spin pointer-events-none" />
          </span>
          <span className="text-7xl font-bold tracking-tighter text-zinc-900 dark:text-white">
            4
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
