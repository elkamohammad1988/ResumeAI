import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Reveal from "../components/Reveal.jsx";
import AnimatedNumber from "../components/AnimatedNumber.jsx";

const features = [
  {
    title: "ATS-tuned",
    body: "Wording, keywords and structure calibrated to pass applicant tracking systems on the first scan.",
    Icon: ScanIcon,
  },
  {
    title: "Cover letter included",
    body: "Every generation produces a tailored 3-paragraph cover letter — no extra step, no extra cost.",
    Icon: LetterIcon,
  },
  {
    title: "PDF in one click",
    body: "Polished, recruiter-ready PDFs with consistent typography. Download and send in under a minute.",
    Icon: DownloadIcon,
  },
];

const steps = [
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
    body: "Polished PDFs for the resume and cover letter. Ready to send. Under 30 seconds, end-to-end.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? "/generator" : "/register";
  const ctaLabel = isAuthenticated ? "Open the generator →" : "Get started — free";

  return (
    <div className="bg-white dark:bg-zinc-950">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
          aria-hidden="true"
        />
        {/* Green glow blob — slowly drifts */}
        <div
          className="animate-blob absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,217,111,0.55) 0%, rgba(0,217,111,0) 70%)",
          }}
          aria-hidden="true"
        />
        {/* Fade-out gradient at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-b from-transparent to-zinc-50/100 dark:to-zinc-900/60"
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span
              className="animate-heroRise inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-[#00a350] dark:text-[#00d96f] bg-[#00d96f]/10 border border-[#00d96f]/20 rounded-full"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#00d96f] opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00d96f]" />
              </span>
              Powered by Gemini 2.5 Flash
            </span>
            <h1
              className="animate-heroRise mt-6 text-5xl md:text-7xl font-bold text-balance tracking-tight text-[#0a0a0a] dark:text-white leading-[1.02]"
              style={{ animationDelay: "0.18s" }}
            >
              The resume that gets you{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">the interview.</span>
                <svg
                  className="absolute -bottom-1.5 left-0 right-0 w-full h-2.5 text-[#00d96f]"
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
              style={{ animationDelay: "0.32s" }}
            >
              AI-tuned, ATS-ready, and exported as a polished PDF — in under 30
              seconds. Cover letter included.
            </p>

            <div
              className="animate-heroRise mt-10 flex flex-wrap gap-3"
              style={{ animationDelay: "0.44s" }}
            >
              <Link
                to={ctaHref}
                className="px-6 py-3 text-base font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-[0_0_0_1px_rgba(0,217,111,0.3),0_8px_24px_-4px_rgba(0,217,111,0.4)] transition-all hover:-translate-y-px"
              >
                {ctaLabel}
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="px-6 py-3 text-base font-semibold text-[#0a0a0a] dark:text-white bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>

            <div
              className="animate-heroRise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400"
              style={{ animationDelay: "0.56s" }}
            >
              <span className="flex items-center gap-1.5">
                <CheckIcon /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon /> 30-second generation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckIcon /> Cover letter included
              </span>
            </div>
          </div>

          {/* Floating resume mockup */}
          <div
            className="animate-heroRise lg:col-span-5 relative"
            style={{ animationDelay: "0.7s" }}
          >
            <ResumeMockup />
          </div>
        </div>
      </section>

      {/* TRUSTED BY — typographic logo strip */}
      <section className="border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-6">
              Built with the same care as
            </p>
          </Reveal>
          <Reveal delay={120}>
            <LogoStrip />
          </Reveal>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Reveal delay={0}>
            <Stat label="Average generation">
              <AnimatedNumber value={30} suffix="s" />
            </Stat>
          </Reveal>
          <Reveal delay={80}>
            <Stat label="ATS-readable">
              <AnimatedNumber value={100} suffix="%" />
            </Stat>
          </Reveal>
          <Reveal delay={160}>
            <Stat label="Languages supported">
              <AnimatedNumber value={3} />
            </Stat>
          </Reveal>
          <Reveal delay={240}>
            <Stat label="PDF templates">
              <AnimatedNumber value={4} />
            </Stat>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-semibold text-[#00a350] dark:text-[#00d96f] uppercase tracking-wider">
                How it works
              </span>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                From blank page to interview-ready, in three steps.
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-5xl font-bold text-[#00d96f] tracking-tighter">
                      {s.n}
                    </span>
                    <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 mb-2" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-zinc-50/50 dark:bg-zinc-900/40 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <span className="text-xs font-semibold text-[#00a350] dark:text-[#00d96f] uppercase tracking-wider">
                Built for outcomes
              </span>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                Everything you need.
                <br />
                Nothing you don&apos;t.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800 md:grid-cols-3 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group p-8 bg-white dark:bg-zinc-950 hover:bg-zinc-50/70 dark:hover:bg-zinc-900/60 transition-all"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#00d96f]/10 text-[#00a350] dark:text-[#00d96f] mb-5 transition-transform group-hover:scale-110 group-hover:bg-[#00d96f]/20">
                    <f.Icon />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold text-[#00a350] dark:text-[#00d96f] uppercase tracking-wider">
                Frequently asked
              </span>
              <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
                Questions, answered.
              </h2>
            </div>
          </Reveal>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
            <FaqItem
              q="Is it really free?"
              a="Yes. ResumeAI is free to use, with no credit card and no hidden tier. We use Google Gemini's free tier for AI generation."
              defaultOpen
            />
            <FaqItem
              q="What is ATS optimization?"
              a="Most large companies filter resumes through Applicant Tracking Systems before a human sees them. The AI structures your resume — keyword density, headings, action verbs — to score well on those systems and reach a recruiter."
            />
            <FaqItem
              q="Can I edit the generated resume?"
              a="The PDF is formatted automatically, but you can re-generate as many times as you want with refined inputs. A built-in inline editor is on the roadmap."
            />
            <FaqItem
              q="What languages does it support?"
              a="The AI writes in English by default. You can prompt it in any language by writing your inputs in that language — Gemini will follow."
            />
            <FaqItem
              q="Is my data private?"
              a="Your inputs are stored in your account so you can re-download saved resumes. They're not shared, sold, or used to train any model."
            />
          </div>
        </div>
      </section>

      {/* TECH STACK — small showcase strip */}
      <section className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-6">
              Built with
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3">
              {[
                "React 18",
                "Vite",
                "TailwindCSS",
                "React Router",
                "Express",
                "MongoDB",
                "Gemini 2.5",
                "JWT",
                "jsPDF",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-[#00d96f]/40 hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-2xl bg-[#0a0a0a] px-8 py-16 md:px-16 md:py-20 text-center">
            {/* Glow */}
            <div
              className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-96 w-[140%] opacity-30 blur-3xl"
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
              <Link
                to={ctaHref}
                className="inline-block mt-10 px-7 py-3.5 text-base font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-[0_0_0_1px_rgba(0,217,111,0.3),0_8px_24px_-4px_rgba(0,217,111,0.5)] transition-all hover:-translate-y-px"
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LogoStrip() {
  // Stylized typographic placeholder logos. Replace with real partner logos when ready.
  const logos = [
    { name: "Northwind", style: { fontFamily: "Georgia, serif", fontWeight: 700, letterSpacing: "-0.02em" } },
    { name: "VORTEX", style: { fontFamily: "Inter, sans-serif", fontWeight: 800, letterSpacing: "0.18em" } },
    { name: "lumen.", style: { fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "-0.04em", fontStyle: "italic" } },
    { name: "ACME", style: { fontFamily: "ui-monospace, monospace", fontWeight: 700, letterSpacing: "0.25em" } },
    { name: "Helio", style: { fontFamily: "Georgia, serif", fontWeight: 400, fontStyle: "italic" } },
    { name: "Quark", style: { fontFamily: "Inter, sans-serif", fontWeight: 800, letterSpacing: "-0.03em" } },
  ];
  return (
    <div className="relative">
      <div className="flex gap-12 md:gap-16 items-center animate-scrollX hover:[animation-play-state:paused] whitespace-nowrap w-max">
        {[...logos, ...logos].map((l, i) => (
          <span
            key={i}
            className="text-2xl md:text-3xl text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors select-none"
            style={l.style}
          >
            {l.name}
          </span>
        ))}
      </div>
      {/* Edge fades */}
      <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent pointer-events-none" />
    </div>
  );
}

function FaqItem({ q, a, defaultOpen }) {
  return (
    <details
      className="group py-5"
      open={defaultOpen}
    >
      <summary className="flex items-center justify-between gap-6 cursor-pointer list-none">
        <span className="text-base md:text-lg font-semibold text-[#0a0a0a] dark:text-white tracking-tight">
          {q}
        </span>
        <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 transition-all group-open:rotate-45 group-open:bg-[#00d96f] group-open:border-[#00d96f] group-open:text-black">
          <svg
            viewBox="0 0 14 14"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M7 1v12M1 7h12" />
          </svg>
        </span>
      </summary>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed pr-12">{a}</p>
    </details>
  );
}

function Stat({ label, children, value }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
        {children ?? value}
      </div>
      <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  );
}

function HeroPhoto() {
  return (
    <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
      {/* Background glow */}
      <div
        className="absolute -inset-12 blur-3xl opacity-50"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(0,217,111,0.35) 0%, rgba(0,217,111,0) 60%)",
        }}
        aria-hidden="true"
      />

      {/* Photo */}
      <div className="relative aspect-square">
        <div
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#00d96f]/30 -m-4 pointer-events-none"
          aria-hidden="true"
        />
        <img
          src="/profile.jpg"
          alt="Elkabouri Mohammad"
          className="relative w-full h-full object-cover rounded-full border-[6px] border-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3),0_8px_24px_-8px_rgba(0,0,0,0.15)] ring-1 ring-zinc-200"
        />
      </div>
    </div>
  );
}

function ResumeMockup() {
  return (
    <div className="relative" style={{ perspective: "1500px" }}>
      <div
        className="relative bg-white rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25),0_8px_24px_-8px_rgba(0,0,0,0.1)] border border-zinc-200 overflow-hidden"
        style={{ transform: "rotateY(-6deg) rotateX(2deg) rotateZ(0.5deg)" }}
      >
        {/* Header band */}
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
              {["React", "Node.js", "TypeScript", "AWS", "Figma", "GraphQL"].map(
                (t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[9px] font-medium text-[#0a0a0a] bg-zinc-100 rounded"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </Section>

          <Section title="Experience">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-[#0a0a0a]">
                Senior Frontend Engineer
              </span>
              <span className="text-zinc-500">2022 — Now</span>
            </div>
            <div className="text-[9px] text-zinc-500 mb-1.5">Acme Corp</div>
            <Bar w="95%" />
            <Bar w="78%" />
            <Bar w="84%" />
          </Section>

          <Section title="Education">
            <Bar w="70%" />
            <Bar w="50%" />
          </Section>
        </div>

        {/* Bottom badge */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold text-[#00a350] bg-[#00d96f]/15 rounded-full">
          <span className="h-1 w-1 rounded-full bg-[#00d96f]" />
          ATS-tuned
        </div>
      </div>

      {/* Floating chip — generation success */}
      <div className="hidden md:flex absolute -bottom-6 -left-6 items-center gap-2 bg-white rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-zinc-200 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d96f]/10 text-[#00a350]">
          <CheckIcon className="h-4 w-4" />
        </span>
        <div>
          <div className="text-xs font-semibold text-[#0a0a0a]">
            Generated in 24s
          </div>
          <div className="text-[10px] text-zinc-500">Cover letter included</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-[9px] font-bold text-[#00a350] uppercase tracking-widest mb-2">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Bar({ w }) {
  return (
    <div
      className="h-1.5 rounded-full bg-zinc-200"
      style={{ width: w }}
      aria-hidden="true"
    />
  );
}

function CheckIcon({ className = "h-4 w-4 text-[#00d96f]" }) {
  return (
    <svg
      className={className}
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
  );
}

function ScanIcon() {
  return (
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
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
      <path d="M7 8h7" />
      <path d="M7 16h5" />
    </svg>
  );
}

function LetterIcon() {
  return (
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
