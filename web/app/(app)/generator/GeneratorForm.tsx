"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  generateResumeAction,
  type GenerateState,
} from "./actions";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Language, Template } from "@/types/database";

interface FormShape {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  jobDescription: string;
  skills: string;
  experience: string;
  education: string;
  language: Language;
  template: Template;
}

const SAMPLE = {
  name: "Alex Carter",
  email: "alex.carter@email.com",
  phone: "+1 415 555 0142",
  jobTitle: "Senior Frontend Engineer",
  jobDescription:
    "We're hiring a Senior Frontend Engineer to lead our checkout team. You'll own the Stripe integration, mentor 3 junior engineers, and build a design system used across 4 products. Must have 5+ years of React + TypeScript, experience shipping consumer-facing products at scale, and a strong eye for UX. Bonus: Next.js, Vercel, conversion optimization.",
  skills:
    "React, TypeScript, Node.js, Next.js, Tailwind CSS, Stripe, Figma, GraphQL, AWS, Jest",
  experience:
    "2022–2024 — Senior Frontend Engineer at Linearly\nLed redesign of checkout flow, lifting conversion 18% across 200K monthly users.\nBuilt component library used by 4 product teams; reduced ship-time for new features by 35%.\nMentored 2 junior engineers from intern to mid-level.\n\n2020–2022 — Frontend Engineer at NorthStar\nDelivered consumer-facing dashboards for 50K+ B2B clients.\nDrove migration from Webpack to Vite, cutting CI build time from 8 min to 90 s.",
  education:
    "B.Sc. Computer Science, ENSAM Casablanca, 2020 — Honors graduate",
};

const initial: FormShape = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  jobDescription: "",
  skills: "",
  experience: "",
  education: "",
  language: "en",
  template: "executive",
};

const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
] as const;

const TEMPLATES = [
  { code: "executive", label: "Executive", desc: "Navy sidebar + skill bars." },
  { code: "modern", label: "Modern", desc: "Green band header." },
  { code: "classic", label: "Classic", desc: "Centered serif, navy." },
  { code: "creative", label: "Creative", desc: "Two-column dark sidebar." },
] as const;

const STORAGE_KEY = "resumeai-web-form-draft";

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition";

export function GeneratorForm({
  quotaExceeded,
}: {
  quotaExceeded: boolean;
}) {
  const [form, setForm] = useState<FormShape>(initial);
  const [state, formAction] = useActionState<GenerateState | null, FormData>(
    generateResumeAction,
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [draftSaved, setDraftSaved] = useState(false);
  const router = useRouter();
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef(true);

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...initial, ...parsed });
      }
    } catch {}
  }, []);

  // Autosave
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const hasContent = Object.entries(form).some(
          ([k, v]) =>
            k !== "language" &&
            k !== "template" &&
            typeof v === "string" &&
            v.trim(),
        );
        if (hasContent) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 1500);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {}
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form]);

  // On success → navigate to resume detail
  useEffect(() => {
    if (state?.ok) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      router.push(`/resumes/${state.resumeId}`);
      router.refresh();
    }
  }, [state, router]);

  const handleChange = <K extends keyof FormShape>(
    k: K,
    v: FormShape[K],
  ) => setForm((p) => ({ ...p, [k]: v }));

  const fillSample = () => setForm((p) => ({ ...p, ...SAMPLE }));
  const clearForm = () => {
    setForm(initial);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };

  const isEmpty = !form.name && !form.jobTitle && !form.experience;
  const blocked = quotaExceeded || isPending;

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-10">
          {/* Sample data nudge */}
          {isEmpty && (
            <div className="flex items-center justify-between gap-4 px-4 py-3 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-start gap-3 min-w-0">
                <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/15 text-accent-deep dark:text-accent">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M11.3 1.046A1 1 0 0 1 12 2v5h4a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8 18v-5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    First time? Try with sample data.
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Pre-fills the form so you can see it work end-to-end.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillSample}
                className="shrink-0 px-3 py-1.5 text-xs font-semibold text-black bg-accent hover:bg-accent-dark rounded-md transition-colors"
              >
                Fill sample
              </button>
            </div>
          )}

          {/* Section 1 — About you */}
          <Section n="1" title="About you" hint="The basics. Used on the resume header.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <Input
                  name="name"
                  required
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </Field>
              <Field
                label="Target job title"
                required
                hint="What you're applying for"
              >
                <Input
                  name="jobTitle"
                  required
                  placeholder="Senior Frontend Engineer"
                  value={form.jobTitle}
                  onChange={(e) => handleChange("jobTitle", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  name="phone"
                  placeholder="+1 555 123 4567"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Section 2 — Target job description */}
          <Section
            n="2"
            title="The job you're applying for"
            hint="Optional but powerful — paste the actual posting and AI tunes the resume to match."
          >
            <div className="relative">
              <textarea
                name="jobDescription"
                value={form.jobDescription}
                onChange={(e) => handleChange("jobDescription", e.target.value)}
                rows={6}
                placeholder="Paste the full job description here…"
                className={cn(inputCls, "resize-y leading-relaxed")}
              />
              {form.jobDescription.trim() && (
                <span className="absolute top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-accent-deep dark:text-accent bg-accent/10 border border-accent/20 rounded-full">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Tailored mode
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The AI will mirror the employer&apos;s language, reorder your
              experience around what matches, and reference specific points in
              the cover letter.
            </p>
          </Section>

          {/* Section 3 — Background */}
          <Section n="3" title="Your background" hint="More detail → better output.">
            <div className="space-y-4">
              <Field label="Skills" hint="Comma-separated, in order of strength">
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  rows={2}
                  placeholder="React, Node.js, TypeScript, AWS"
                  className={cn(inputCls, "resize-y leading-relaxed")}
                />
              </Field>
              <Field label="Experience" hint="Numbers + outcomes if possible">
                <textarea
                  name="experience"
                  value={form.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                  rows={6}
                  placeholder={
                    "2022–2024 — Frontend Engineer at Acme Corp.\nLed redesign of checkout flow, lifting conversion 18%."
                  }
                  className={cn(inputCls, "resize-y leading-relaxed")}
                />
              </Field>
              <Field label="Education">
                <textarea
                  name="education"
                  value={form.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                  rows={2}
                  placeholder="B.Sc. Computer Science, ENSAM Casablanca, 2020"
                  className={cn(inputCls, "resize-y leading-relaxed")}
                />
              </Field>
            </div>
          </Section>

          {/* Section 4 — Language */}
          <Section n="4" title="Output language">
            <div className="grid grid-cols-3 gap-2">
              {LANGS.map((l) => {
                const active = form.language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleChange("language", l.code)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-all",
                      active
                        ? "bg-accent/10 border-accent text-zinc-900 dark:text-white font-semibold ring-2 ring-accent/20"
                        : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600",
                    )}
                  >
                    <span aria-hidden="true">{l.flag}</span>
                    {l.label}
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="language" value={form.language} />
          </Section>

          {/* Section 5 — Template */}
          <Section n="5" title="PDF template" hint="Visual style for the downloaded resume.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEMPLATES.map((t) => {
                const active = form.template === t.code;
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => handleChange("template", t.code)}
                    className={cn(
                      "p-4 text-left rounded-xl border transition-all",
                      active
                        ? "border-accent ring-2 ring-accent/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-semibold tracking-tight",
                        active
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-700 dark:text-zinc-300",
                      )}
                    >
                      {t.label}
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            <input type="hidden" name="template" value={form.template} />
          </Section>

          {/* Error / quota banner */}
          {state && !state.ok && (
            <div className="px-4 py-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
              {state.error}
            </div>
          )}

          {/* Submit */}
          <div>
            <Button
              type="submit"
              loading={isPending}
              disabled={blocked}
              className="w-full"
            >
              {isPending
                ? "Generating with AI…"
                : quotaExceeded
                  ? "Free quota reached — upgrade to Pro"
                  : "Generate resume & cover letter →"}
            </Button>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span
                className={cn(
                  "flex items-center gap-1.5 transition-opacity",
                  draftSaved
                    ? "opacity-100 text-accent-deep dark:text-accent"
                    : "opacity-0",
                )}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Draft saved
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fillSample}
                  className="text-accent-deep dark:text-accent hover:underline font-semibold"
                >
                  Try sample data
                </button>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <button
                  type="button"
                  onClick={clearForm}
                  className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  Clear form
                </button>
              </div>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function Section({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 pb-3 mb-5 border-b border-zinc-200 dark:border-zinc-800">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent-deep dark:text-accent text-xs font-bold">
          {n}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          {hint && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {hint}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          {label}
          {required && (
            <span className="text-accent-deep dark:text-accent"> *</span>
          )}
        </span>
        {hint && (
          <span className="block mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 normal-case tracking-normal font-normal">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
