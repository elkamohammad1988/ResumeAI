export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}
    >
      <span className="relative inline-flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-md bg-accent" />
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
        Resume<span className="text-accent">AI</span>
      </span>
    </span>
  );
}
