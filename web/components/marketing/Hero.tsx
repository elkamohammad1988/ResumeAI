import Link from "next/link";

export function Hero({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
        aria-hidden="true"
      />
      {/* Glow */}
      <div
        className="animate-blob absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,217,111,0.55) 0%, rgba(0,217,111,0) 70%)",
        }}
        aria-hidden="true"
      />
      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-b from-transparent to-zinc-50/100 dark:to-zinc-900/60"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <span
            className="animate-heroRise inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-accent-deep dark:text-accent bg-accent/10 border border-accent/20 rounded-full"
            style={{ animationDelay: "50ms" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Powered by Gemini 2.5 Flash
          </span>
          <h1
            className="animate-heroRise mt-6 text-5xl md:text-7xl font-bold text-balance tracking-tight text-zinc-900 dark:text-white leading-[1.02]"
            style={{ animationDelay: "180ms" }}
          >
            The resume that gets you{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">the interview.</span>
              <svg
                className="absolute -bottom-1.5 left-0 right-0 w-full h-2.5 text-accent"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6 Q 50 2, 100 5 T 198 4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
          <p
            className="animate-heroRise mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl text-balance leading-relaxed"
            style={{ animationDelay: "320ms" }}
          >
            AI-tuned, ATS-ready, and exported as a polished PDF — in under 30
            seconds. Cover letter included.
          </p>

          <div
            className="animate-heroRise mt-10 flex flex-wrap gap-3"
            style={{ animationDelay: "440ms" }}
          >
            <Link
              href={ctaHref}
              className="px-6 py-3 text-base font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow-strong transition-all hover:-translate-y-px"
            >
              {ctaLabel}
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 text-base font-semibold text-zinc-900 dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              See pricing
            </Link>
          </div>

          <div
            className="animate-heroRise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400"
            style={{ animationDelay: "560ms" }}
          >
            <Check>No credit card</Check>
            <Check>30-second generation</Check>
            <Check>Cover letter included</Check>
          </div>
        </div>

        <div
          className="animate-heroRise lg:col-span-5"
          style={{ animationDelay: "700ms" }}
        >
          <ResumeMockup />
        </div>
      </div>
    </section>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <svg
        className="h-4 w-4 text-accent"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </span>
  );
}

function ResumeMockup() {
  return (
    <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto" style={{ perspective: "1500px" }}>
      <div
        className="relative bg-white rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.1)] border border-zinc-200 overflow-hidden"
        style={{ transform: "rotateY(-6deg) rotateX(2deg) rotateZ(0.5deg)" }}
      >
        <div className="h-14 bg-[#0a0a0a] flex items-center justify-center text-white text-sm font-semibold tracking-tight">
          Jane Doe
        </div>
        <div className="px-6 pt-3 pb-2 text-center text-[10px] text-zinc-500 border-b border-zinc-100">
          jane@example.com  •  +1 555 123 4567
        </div>
        <div className="p-6 space-y-5 text-[10px]">
          <Section title="Summary">
            <Bar w="92%" />
            <Bar w="88%" />
            <Bar w="60%" />
          </Section>
          <Section title="Skills">
            <div className="flex flex-wrap gap-1.5">
              {["React", "TypeScript", "Node.js", "AWS", "Figma", "GraphQL"].map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[9px] font-medium text-zinc-900 bg-zinc-100 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          </Section>
          <Section title="Experience">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-zinc-900">Senior Frontend Engineer</span>
              <span className="text-zinc-500">2022 — Now</span>
            </div>
            <div className="text-[9px] text-zinc-500 mb-1.5">Acme Corp</div>
            <Bar w="95%" />
            <Bar w="78%" />
            <Bar w="84%" />
          </Section>
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold text-accent-deep bg-accent/15 rounded-full">
          <span className="h-1 w-1 rounded-full bg-accent" />
          ATS-tuned
        </div>
      </div>

      <div className="hidden md:flex absolute -bottom-6 -left-6 items-center gap-2 bg-white rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-zinc-200 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent-deep">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <div>
          <div className="text-xs font-semibold text-zinc-900">Generated in 24s</div>
          <div className="text-[10px] text-zinc-500">Cover letter included</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-bold text-accent-deep uppercase tracking-widest mb-2">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Bar({ w }: { w: string }) {
  return (
    <div className="h-1.5 rounded-full bg-zinc-200" style={{ width: w }} aria-hidden="true" />
  );
}
