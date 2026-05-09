import { Hero } from "@/components/marketing/Hero";
import { supabaseServer } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctaHref = user ? "/generator" : "/register";
  const ctaLabel = user ? "Open the generator →" : "Get started — free";

  return (
    <>
      <Hero ctaHref={ctaHref} ctaLabel={ctaLabel} />

      {/* Stats strip */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat value="30s" label="Average generation" />
          <Stat value="100%" label="ATS-readable" />
          <Stat value="3" label="Languages supported" />
          <Stat value="4" label="PDF templates" />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-semibold text-accent-deep dark:text-accent uppercase tracking-wider">
              How it works
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
              From blank page to interview-ready, in three steps.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Tell us about you",
                body: "Drop in your name, target role, skills, experience, and education. Free-form, no rigid format.",
              },
              {
                n: "02",
                title: "AI does the writing",
                body: "Gemini 2.5 rewrites every line to land cleanly with recruiters and ATS scanners.",
              },
              {
                n: "03",
                title: "Download & apply",
                body: "Polished PDFs for the resume and cover letter. Ready to send. Under 30 seconds end-to-end.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-5xl font-bold text-accent tracking-tighter">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 mb-2" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] px-8 py-16 md:px-16 md:py-20 text-center">
            <div
              className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-96 w-[140%] opacity-30 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(0,217,111,0.6) 0%, rgba(0,217,111,0) 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Land the interview.
              </h2>
              <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
                Stop staring at a blank page. Start sending applications today.
              </p>
              <a
                href={ctaHref}
                className="inline-block mt-10 px-7 py-3.5 text-base font-semibold text-black bg-accent hover:bg-accent-dark rounded-lg ring-glow-strong transition-all hover:-translate-y-px"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}
