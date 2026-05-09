import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResumeForm from "../components/ResumeForm.jsx";
import ResumePreview from "../components/ResumePreview.jsx";
import CoverLetter from "../components/CoverLetter.jsx";
import LiveTemplatePreview from "../components/LiveTemplatePreview.jsx";
import { resumeApi, authApi } from "../api.js";
import { generateResumePDF, generateCoverLetterPDF } from "../utils/pdf.js";
import { useToast } from "../context/ToastContext.jsx";

const TEMPLATE_LABEL = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  executive: "Executive",
};

const LANG_LABEL = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

function GenerationSkeleton() {
  return (
    <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#00d96f] animate-pulse" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          AI is writing…
        </span>
      </div>
      <div className="p-8 md:p-10 space-y-4">
        <div className="h-7 w-48 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
        <div className="pt-3 space-y-2">
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
          <div className="h-4 w-11/12 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
          <div className="h-4 w-9/12 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
        </div>
        <div className="pt-3 space-y-2">
          <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
          <div className="h-4 w-10/12 rounded bg-zinc-100 dark:bg-zinc-800/60 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00d96f]/10 text-[#00a350] dark:text-[#00d96f] mb-4">
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
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#0a0a0a] dark:text-white">
        Your resume will appear here
      </h3>
      <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
        Fill out the form above and hit generate. AI delivers a polished resume
        and cover letter in under 30 seconds.
      </p>
    </div>
  );
}

export default function Generator() {
  const [form, setForm] = useState(null);
  const [liveForm, setLiveForm] = useState(null);
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const { showToast } = useToast();

  const handleFormChange = useCallback((next) => setLiveForm(next), []);

  // Load fresh usage on mount
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((data) => {
        if (cancelled || !data?.user) return;
        const limit = data.user.usageLimit;
        const count = data.user.usageCount || 0;
        setUsage({
          count,
          limit,
          remaining: limit === null ? null : Math.max(0, limit - count),
        });
        if (limit !== null && count >= limit) setQuotaExceeded(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async (formData) => {
    setError("");
    setLoading(true);
    setResume("");
    setCoverLetter("");
    try {
      const data = await resumeApi.generate(formData);
      setForm(formData);
      setResume(data.resume || "");
      setCoverLetter(data.coverLetter || "");
      if (data.usage) {
        setUsage(data.usage);
        if (
          data.usage.limit !== null &&
          data.usage.remaining !== null &&
          data.usage.remaining <= 0
        ) {
          setQuotaExceeded(true);
        }
      }
      showToast({
        type: "success",
        message: "Resume generated. Scroll down to preview.",
      });
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      const msg = data?.error || "Failed to generate documents.";
      if (status === 402 || data?.code === "quota_exceeded") {
        setQuotaExceeded(true);
        if (data?.usage) setUsage(data.usage);
      }
      setError(msg);
      showToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  const hasOutput = (resume || coverLetter) && form;

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-900/40 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
              Generate your resume
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Fill in your details. AI does the writing.
            </p>
          </div>
          {usage && (
            <div className="shrink-0 px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Usage this month
              </div>
              {usage.limit === null ? (
                <div className="mt-0.5 text-sm font-semibold text-[#00a350] dark:text-[#00d96f]">
                  {usage.count} · Unlimited
                </div>
              ) : (
                <>
                  <div className="mt-0.5 text-sm font-semibold text-[#0a0a0a] dark:text-white">
                    {usage.count} / {usage.limit}
                  </div>
                  <div className="mt-1.5 h-1 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usage.remaining > 1
                          ? "bg-[#00d96f]"
                          : usage.remaining === 1
                            ? "bg-amber-400"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(100, (usage.count / usage.limit) * 100)}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Quota exceeded banner */}
        {quotaExceeded && (
          <div className="mb-6 relative overflow-hidden rounded-xl bg-[#0a0a0a] dark:bg-zinc-900 border border-[#00d96f]/30 p-5 flex flex-wrap items-center justify-between gap-4">
            <div
              className="absolute -bottom-20 right-0 h-48 w-48 opacity-30 blur-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,217,111,0.6) 0%, rgba(0,217,111,0) 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-sm font-semibold text-white">
                You&apos;ve used all 5 free generations this month.
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Upgrade to Pro for unlimited resumes, JD targeting, and version
                history.
              </p>
            </div>
            <Link
              to="/pricing"
              className="relative px-4 py-2 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-[0_8px_24px_-4px_rgba(0,217,111,0.5)] transition-all hover:-translate-y-px"
            >
              See plans →
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT — Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 md:p-8 shadow-sm">
              <ResumeForm
                onSubmit={handleGenerate}
                onChange={handleFormChange}
                loading={loading || quotaExceeded}
              />
            </div>
          </div>

          {/* RIGHT — Sticky live preview */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#00d96f] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00d96f]" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Live preview
                  </span>
                </div>
                {liveForm?.template && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {TEMPLATE_LABEL[liveForm.template] || liveForm.template}
                    {liveForm.language && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{LANG_LABEL[liveForm.language]}</span>
                      </>
                    )}
                  </span>
                )}
              </div>
              <LiveTemplatePreview form={liveForm} />
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">
                A scaled mock of your chosen template. The AI will fill the
                section bodies once you generate.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2">
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 mt-0.5 shrink-0 text-red-600 dark:text-red-400"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-13a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {loading && <GenerationSkeleton />}

        {hasOutput && (
          <div className="mt-8 p-5 bg-[#0a0a0a] rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="text-white">
              <p className="text-sm font-semibold flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00d96f]">
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3 w-3 text-black"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                Your documents are ready
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Download as PDF or regenerate for a different angle.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {resume && (
                <button
                  onClick={async () => {
                    await generateResumePDF({ form, resume });
                    showToast({
                      type: "success",
                      message: "Resume PDF downloaded.",
                    });
                  }}
                  className="px-4 py-2 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg transition-colors"
                >
                  Download resume PDF
                </button>
              )}
              {coverLetter && (
                <button
                  onClick={() => {
                    generateCoverLetterPDF({ form, coverLetter });
                    showToast({
                      type: "success",
                      message: "Cover letter PDF downloaded.",
                    });
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                >
                  Download cover letter
                </button>
              )}
              <button
                onClick={() => handleGenerate(form)}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-white/5 hover:bg-white/15 border border-white/15 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Re-run AI on the same inputs"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                Regenerate
              </button>
            </div>
          </div>
        )}

        {!loading && !hasOutput && !error && <EmptyState />}

        <ResumePreview resume={resume} />
        <CoverLetter content={coverLetter} />
      </div>
    </div>
  );
}
