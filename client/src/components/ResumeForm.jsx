import React, { useEffect, useRef, useState } from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  jobDescription: "",
  skills: "",
  experience: "",
  education: "",
  photo: "",
  language: "en",
  template: "executive",
};

// Resize and compress image to a square data URL ≤ ~80KB
const resizeImage = (file, maxSize = 360, quality = 0.82) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        const side = Math.min(w, h);
        const sx = (w - side) / 2;
        const sy = (h - side) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const STORAGE_KEY = "resumeFormDraft";

const inputClass =
  "w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#00d96f] focus:ring-2 focus:ring-[#00d96f]/20 transition";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
];

function FieldGroup({ label, hint, required, children }) {
  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
          {label}
          {required && <span className="text-[#00a350] dark:text-[#00d96f]"> *</span>}
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

function SectionHeader({ n, title, hint }) {
  return (
    <div className="flex items-baseline gap-3 pb-3 mb-5 border-b border-zinc-200 dark:border-zinc-800">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#00d96f]/10 text-[#00a350] dark:text-[#00d96f] text-xs font-bold">
        {n}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">{title}</h3>
        {hint && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function TemplatePreview({ template }) {
  // SVG mini-preview of the actual PDF layout (hand-drawn approximation)
  if (template === "modern") {
    return (
      <svg
        viewBox="0 0 100 130"
        className="w-full h-auto"
        aria-hidden="true"
      >
        <rect width="100" height="130" fill="#ffffff" stroke="#e5e5e5" />
        <rect width="100" height="22" fill="#00d96f" />
        <rect x="30" y="9" width="40" height="3" fill="#0a0a0a" rx="0.5" />
        <rect x="35" y="14" width="30" height="2" fill="#0a0a0a" opacity="0.6" />
        <rect x="38" y="28" width="24" height="1.2" fill="#999" />
        <rect x="8" y="40" width="20" height="2.5" fill="#00a350" />
        <rect x="8" y="44" width="84" height="0.5" fill="#00d96f" />
        <rect x="8" y="49" width="84" height="1.5" fill="#bbb" />
        <rect x="8" y="52.5" width="76" height="1.5" fill="#bbb" />
        <rect x="8" y="56" width="80" height="1.5" fill="#bbb" />
        <rect x="8" y="65" width="20" height="2.5" fill="#00a350" />
        <rect x="8" y="69" width="84" height="0.5" fill="#00d96f" />
        <circle cx="11" cy="74" r="0.8" fill="#00d96f" />
        <rect x="14" y="73" width="68" height="1.5" fill="#bbb" />
        <circle cx="11" cy="78" r="0.8" fill="#00d96f" />
        <rect x="14" y="77" width="74" height="1.5" fill="#bbb" />
        <circle cx="11" cy="82" r="0.8" fill="#00d96f" />
        <rect x="14" y="81" width="62" height="1.5" fill="#bbb" />
        <rect x="8" y="92" width="20" height="2.5" fill="#00a350" />
        <rect x="8" y="96" width="84" height="0.5" fill="#00d96f" />
        <rect x="8" y="101" width="84" height="1.5" fill="#bbb" />
        <rect x="8" y="104.5" width="70" height="1.5" fill="#bbb" />
      </svg>
    );
  }
  if (template === "classic") {
    return (
      <svg
        viewBox="0 0 100 130"
        className="w-full h-auto"
        aria-hidden="true"
      >
        <rect width="100" height="130" fill="#fafafa" stroke="#e5e5e5" />
        <rect x="20" y="14" width="60" height="4" fill="#1a2845" />
        <rect x="32" y="22" width="36" height="2" fill="#777" />
        <rect x="20" y="29" width="60" height="0.5" fill="#1a2845" />
        <rect x="20" y="30.5" width="60" height="0.3" fill="#1a2845" />
        <rect x="32" y="36" width="36" height="1.5" fill="#555" />
        <rect x="40" y="48" width="20" height="2.5" fill="#1a2845" />
        <rect x="46" y="53" width="8" height="0.5" fill="#1a2845" />
        <rect x="8" y="58" width="84" height="1.5" fill="#bbb" />
        <rect x="8" y="61.5" width="80" height="1.5" fill="#bbb" />
        <rect x="8" y="65" width="84" height="1.5" fill="#bbb" />
        <rect x="40" y="72" width="20" height="2.5" fill="#1a2845" />
        <rect x="46" y="77" width="8" height="0.5" fill="#1a2845" />
        <text x="9" y="84" fontSize="3" fill="#1a2845">◆</text>
        <rect x="14" y="82" width="74" height="1.5" fill="#bbb" />
        <text x="9" y="89" fontSize="3" fill="#1a2845">◆</text>
        <rect x="14" y="87" width="68" height="1.5" fill="#bbb" />
        <text x="9" y="94" fontSize="3" fill="#1a2845">◆</text>
        <rect x="14" y="92" width="78" height="1.5" fill="#bbb" />
        <rect x="40" y="102" width="20" height="2.5" fill="#1a2845" />
        <rect x="46" y="107" width="8" height="0.5" fill="#1a2845" />
        <rect x="8" y="112" width="84" height="1.5" fill="#bbb" />
      </svg>
    );
  }
  if (template === "executive") {
    return (
      <svg
        viewBox="0 0 100 130"
        className="w-full h-auto"
        aria-hidden="true"
      >
        <rect width="100" height="130" fill="#ffffff" stroke="#e5e5e5" />
        {/* Sidebar */}
        <rect x="0" y="0" width="36" height="130" fill="#0d3b66" />
        {/* Photo circle */}
        <circle cx="18" cy="20" r="11" fill="#ffffff" stroke="#4682c8" strokeWidth="1.5" />
        {/* Name */}
        <rect x="3" y="36" width="30" height="2.5" fill="#ffffff" />
        <rect x="6" y="40" width="24" height="1.5" fill="#b4c8e6" />
        {/* Contact section */}
        <rect x="3" y="52" width="14" height="1.5" fill="#ffffff" />
        <rect x="3" y="56" width="20" height="0.8" fill="#dcdcdc" />
        <rect x="3" y="59" width="24" height="0.8" fill="#dcdcdc" />
        <rect x="3" y="62" width="22" height="0.8" fill="#dcdcdc" />
        {/* Education on sidebar */}
        <rect x="3" y="74" width="16" height="1.5" fill="#ffffff" />
        <rect x="3" y="78" width="22" height="0.8" fill="#dcdcdc" />
        <rect x="3" y="81" width="20" height="0.8" fill="#dcdcdc" />
        {/* Right column timeline */}
        <line x1="42" y1="14" x2="42" y2="120" stroke="#dcdcdc" strokeWidth="0.5" />
        {/* Section circles */}
        <circle cx="42" cy="14" r="3.5" fill="#0d3b66" />
        <text x="42" y="15.7" fontSize="3" fill="#fff" textAnchor="middle" fontWeight="bold">1</text>
        <circle cx="42" cy="46" r="3.5" fill="#0d3b66" />
        <text x="42" y="47.7" fontSize="3" fill="#fff" textAnchor="middle" fontWeight="bold">2</text>
        <circle cx="42" cy="78" r="3.5" fill="#0d3b66" />
        <text x="42" y="79.7" fontSize="3" fill="#fff" textAnchor="middle" fontWeight="bold">3</text>
        <circle cx="42" cy="108" r="3.5" fill="#0d3b66" />
        <text x="42" y="109.7" fontSize="3" fill="#fff" textAnchor="middle" fontWeight="bold">4</text>
        {/* Section content */}
        <rect x="50" y="13" width="20" height="2.2" fill="#0d3b66" />
        <rect x="50" y="18" width="40" height="1" fill="#bbb" />
        <rect x="50" y="20.5" width="36" height="1" fill="#bbb" />

        <rect x="50" y="45" width="20" height="2.2" fill="#0d3b66" />
        <rect x="50" y="50" width="42" height="1" fill="#bbb" />
        <rect x="50" y="52.5" width="38" height="1" fill="#bbb" />
        <rect x="50" y="55" width="40" height="1" fill="#bbb" />

        {/* Skills section with bars */}
        <rect x="50" y="77" width="22" height="2.2" fill="#0d3b66" />
        <rect x="50" y="82" width="14" height="1" fill="#666" />
        <rect x="66" y="82" width="26" height="1.2" fill="#0d3b66" />
        <rect x="50" y="85" width="14" height="1" fill="#666" />
        <rect x="66" y="85" width="22" height="1.2" fill="#0d3b66" />
        <rect x="50" y="88" width="14" height="1" fill="#666" />
        <rect x="66" y="88" width="20" height="1.2" fill="#0d3b66" />
        <rect x="50" y="91" width="14" height="1" fill="#666" />
        <rect x="66" y="91" width="18" height="1.2" fill="#0d3b66" />

        <rect x="50" y="107" width="20" height="2.2" fill="#0d3b66" />
        <rect x="50" y="112" width="38" height="1" fill="#bbb" />
        <rect x="50" y="114.5" width="34" height="1" fill="#bbb" />
      </svg>
    );
  }
  // creative
  return (
    <svg viewBox="0 0 100 130" className="w-full h-auto" aria-hidden="true">
      <rect width="100" height="130" fill="#ffffff" stroke="#e5e5e5" />
      <rect x="0" y="0" width="34" height="130" fill="#0a0a0a" />
      <rect x="3" y="9" width="28" height="3" fill="#ffffff" rx="0.3" />
      <rect x="3" y="14" width="20" height="3" fill="#ffffff" rx="0.3" />
      <rect x="3" y="20" width="24" height="1.5" fill="#c8593a" />
      <rect x="3" y="32" width="14" height="1.5" fill="#c8593a" />
      <rect x="3" y="34" width="8" height="0.5" fill="#c8593a" />
      <rect x="3" y="38" width="26" height="1" fill="#888" />
      <rect x="3" y="40.5" width="20" height="1" fill="#888" />
      <rect x="3" y="50" width="10" height="1.5" fill="#c8593a" />
      <rect x="3" y="52" width="6" height="0.5" fill="#c8593a" />
      <rect x="3" y="56" width="22" height="1" fill="#888" />
      <rect x="3" y="58.5" width="20" height="1" fill="#888" />
      <rect x="3" y="61" width="24" height="1" fill="#888" />
      <rect x="3" y="63.5" width="18" height="1" fill="#888" />
      <rect x="40" y="9" width="40" height="3.5" fill="#0a0a0a" />
      <rect x="40" y="14.5" width="14" height="1.5" fill="#c8593a" />
      <rect x="40" y="22" width="56" height="1.5" fill="#bbb" />
      <rect x="40" y="25" width="50" height="1.5" fill="#bbb" />
      <rect x="40" y="28" width="56" height="1.5" fill="#bbb" />
      <rect x="40" y="38" width="20" height="2.5" fill="#0a0a0a" />
      <rect x="40" y="42" width="10" height="1" fill="#c8593a" />
      <rect x="40" y="46" width="2" height="6" fill="#c8593a" />
      <rect x="44" y="47" width="50" height="1.2" fill="#bbb" />
      <rect x="44" y="49.5" width="42" height="1.2" fill="#bbb" />
      <rect x="40" y="56" width="2" height="6" fill="#c8593a" />
      <rect x="44" y="57" width="48" height="1.2" fill="#bbb" />
      <rect x="44" y="59.5" width="44" height="1.2" fill="#bbb" />
      <rect x="40" y="66" width="2" height="6" fill="#c8593a" />
      <rect x="44" y="67" width="52" height="1.2" fill="#bbb" />
      <rect x="40" y="80" width="20" height="2.5" fill="#0a0a0a" />
      <rect x="40" y="84" width="10" height="1" fill="#c8593a" />
      <rect x="40" y="88" width="56" height="1.2" fill="#bbb" />
      <rect x="40" y="91" width="48" height="1.2" fill="#bbb" />
    </svg>
  );
}

const TEMPLATES = [
  {
    code: "executive",
    label: "Executive",
    description: "Navy sidebar, timeline + skill bars. Premium.",
  },
  {
    code: "modern",
    label: "Modern",
    description: "Bold green header. Clean. Single column.",
  },
  {
    code: "classic",
    label: "Classic",
    description: "Centered serif, navy. Traditional.",
  },
  {
    code: "creative",
    label: "Creative",
    description: "Two-column dark sidebar, terracotta.",
  },
];

function TemplatePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {TEMPLATES.map((t) => {
        const active = value === t.code;
        return (
          <button
            key={t.code}
            type="button"
            onClick={() => onChange(t.code)}
            className={`group relative overflow-hidden text-left rounded-xl border transition-all ${
              active
                ? "border-[#00d96f] ring-2 ring-[#00d96f]/30 shadow-[0_8px_24px_-8px_rgba(0,217,111,0.3)]"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
            }`}
          >
            <div className="aspect-[100/130] bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden p-1.5">
              <TemplatePreview template={t.code} />
            </div>
            <div className="p-3 bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold tracking-tight ${
                    active ? "text-[#0a0a0a] dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {t.label}
                </span>
                {active && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#00d96f] text-black">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3 w-3"
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
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {t.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LanguagePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LANGUAGES.map((l) => {
        const active = value === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-all ${
              active
                ? "bg-[#00d96f]/10 border-[#00d96f] text-[#0a0a0a] dark:text-white font-semibold ring-2 ring-[#00d96f]/20"
                : "bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            <span aria-hidden="true">{l.flag}</span>
            <span>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ResumeForm({ onSubmit, onChange, loading }) {
  const [form, setForm] = useState(initialState);
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimer = useRef(null);
  const isInitialMount = useRef(true);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...initialState, ...parsed });
      }
    } catch (e) {
      // ignore — corrupt draft
    }
  }, []);

  // Emit form changes to parent (for live preview)
  useEffect(() => {
    onChange?.(form);
  }, [form, onChange]);

  // Debounced autosave
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const hasContent = Object.entries(form).some(
        ([k, v]) => k !== "language" && v && v.toString().trim(),
      );
      if (hasContent) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 1500);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [form]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLanguageChange = (code) =>
    setForm((prev) => ({ ...prev, language: code }));

  const handleTemplateChange = (code) =>
    setForm((prev) => ({ ...prev, template: code }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImage(file);
      setForm((prev) => ({ ...prev, photo: dataUrl }));
    } catch (_) {
      // ignore
    } finally {
      // allow re-selecting the same file
      e.target.value = "";
    }
  };

  const handlePhotoRemove = () =>
    setForm((prev) => ({ ...prev, photo: "" }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const handleClearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    setForm(initialState);
  };

  const handleFillSample = () => {
    setForm({
      ...initialState,
      name: "Alex Carter",
      email: "alex.carter@email.com",
      phone: "+1 415 555 0142",
      jobTitle: "Senior Frontend Engineer",
      jobDescription:
        "We're hiring a Senior Frontend Engineer to lead our checkout team. You'll own the Stripe integration, mentor 3 junior engineers, and build a design system used across 4 products. Must have 5+ years of React + TypeScript, experience shipping consumer-facing products at scale, and a strong eye for UX. Bonus: Next.js, Vercel, conversion optimization.",
      skills:
        "React, TypeScript, Node.js, Next.js, Tailwind CSS, Stripe, Figma, GraphQL, AWS, Jest",
      experience:
        "2022–2024 — Senior Frontend Engineer at Linearly\nLed redesign of checkout flow, lifting conversion 18% across 200K monthly users.\nBuilt component library used by 4 product teams; reduced ship-time for new features by 35%.\nMentored 2 junior engineers from intern to mid-level.\n\n2020–2022 — Frontend Engineer at NorthStar\nDelivered consumer-facing dashboards for 50K+ B2B clients.\nDrove migration from Webpack to Vite, cutting CI build time from 8min to 90s.",
      education:
        "B.Sc. Computer Science, ENSAM Casablanca, 2020 — Honors graduate",
      photo: form.photo, // preserve user's uploaded photo
      language: form.language,
      template: form.template,
    });
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 1500);
  };

  const isEmpty = !form.name && !form.jobTitle && !form.experience;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Sample data nudge — only when form is empty */}
      {isEmpty && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#00d96f]/5 dark:bg-[#00d96f]/10 border border-[#00d96f]/20 rounded-lg">
          <div className="flex items-start gap-3 min-w-0">
            <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#00d96f]/15 text-[#00a350] dark:text-[#00d96f]">
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
              <p className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                First time? Try with sample data.
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Pre-fills the form so you can see it work end-to-end.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillSample}
            className="shrink-0 px-3 py-1.5 text-xs font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-md transition-colors"
          >
            Fill sample
          </button>
        </div>
      )}

      {/* Section 1 — About you (with photo) */}
      <section>
        <SectionHeader
          n="1"
          title="About you"
          hint="The basics. We use these on the resume header."
        />

        {/* Photo upload */}
        <div className="mb-5 flex items-start gap-5">
          <div className="relative shrink-0">
            {form.photo ? (
              <img
                src={form.photo}
                alt="Your photo"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-[#00d96f]/20 border-2 border-white dark:border-zinc-800 shadow-md"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Profile photo
              <span className="ml-1 text-zinc-400 dark:text-zinc-500 normal-case tracking-normal font-normal">
                (optional)
              </span>
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Embedded in your CV PDF. Square shots work best. Auto-resized to
              360×360.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#0a0a0a] dark:text-white bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-[#00d96f] hover:bg-[#00d96f]/5 rounded-md cursor-pointer transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {form.photo ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              {form.photo && (
                <button
                  type="button"
                  onClick={handlePhotoRemove}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldGroup label="Full name" required>
            <input
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Target job title" required hint="What you're applying for">
            <input
              name="jobTitle"
              type="text"
              placeholder="Senior Frontend Developer"
              value={form.jobTitle}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Email">
            <input
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </FieldGroup>
          <FieldGroup label="Phone">
            <input
              name="phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </FieldGroup>
        </div>
      </section>

      {/* Section 2 — Target job description (NEW killer feature) */}
      <section>
        <SectionHeader
          n="2"
          title="The job you're applying for"
          hint="Optional but powerful — paste the actual job posting and AI tunes the resume to match."
        />
        <div className="relative">
          <textarea
            name="jobDescription"
            value={form.jobDescription}
            onChange={handleChange}
            placeholder={
              "Paste the full job description here.\n\nExample: 'We are looking for a Senior Frontend Engineer with 4+ years of React experience to lead our checkout team. Must have strong TypeScript skills, experience with design systems, and a track record of shipping consumer-facing products at scale...'"
            }
            rows={6}
            className={inputClass + " resize-y leading-relaxed"}
          />
          {form.jobDescription.trim() && (
            <span className="absolute top-2.5 right-3 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#00a350] dark:text-[#00d96f] bg-[#00d96f]/10 border border-[#00d96f]/20 rounded-full">
              <span className="h-1 w-1 rounded-full bg-[#00d96f]" />
              Tailored mode
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          When you paste a job posting, the AI mirrors the employer&apos;s
          language, reorders your experience to lead with what matches, and
          quantifies wins around what they care about. The cover letter
          references specific points from the posting.
        </p>
      </section>

      {/* Section 3 — Background */}
      <section>
        <SectionHeader
          n="3"
          title="Your background"
          hint="The more detail you give, the better the AI will write."
        />
        <div className="space-y-4">
          <FieldGroup label="Skills" hint="Comma-separated, in order of strength">
            <textarea
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, TypeScript, AWS, Figma"
              rows={2}
              className={inputClass + " resize-y leading-relaxed"}
            />
          </FieldGroup>
          <FieldGroup
            label="Experience"
            hint="Roles, companies, achievements with numbers if you can"
          >
            <textarea
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder={
                "2021–2024 — Frontend Engineer at Acme Corp.\nLed redesign of checkout flow, lifting conversion 18%.\nBuilt component library used by 4 product teams."
              }
              rows={6}
              className={inputClass + " resize-y leading-relaxed"}
            />
          </FieldGroup>
          <FieldGroup label="Education">
            <textarea
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="B.Sc. Computer Science, ENSAM Casablanca, 2021"
              rows={2}
              className={inputClass + " resize-y leading-relaxed"}
            />
          </FieldGroup>
        </div>
      </section>

      {/* Section 4 — Output language */}
      <section>
        <SectionHeader
          n="4"
          title="Output language"
          hint="The AI will write the resume and cover letter in this language."
        />
        <LanguagePicker value={form.language} onChange={handleLanguageChange} />
      </section>

      {/* Section 5 — Visual template */}
      <section>
        <SectionHeader
          n="5"
          title="PDF template"
          hint="Pick the visual style for your downloaded resume."
        />
        <TemplatePicker
          value={form.template}
          onChange={handleTemplateChange}
        />
      </section>

      {/* Submit + meta row */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-[0_0_0_1px_rgba(0,217,111,0.3),0_8px_24px_-4px_rgba(0,217,111,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:-translate-y-px disabled:translate-y-0"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Generating with AI…
            </span>
          ) : (
            "Generate resume & cover letter →"
          )}
        </button>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span
            className={`flex items-center gap-1.5 transition-opacity ${
              draftSaved ? "opacity-100 text-[#00a350] dark:text-[#00d96f]" : "opacity-0"
            }`}
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
              onClick={handleFillSample}
              className="inline-flex items-center gap-1 text-[#00a350] dark:text-[#00d96f] hover:underline underline-offset-2 font-semibold"
              title="Fill the form with example data"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-3 w-3"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M11.3 1.046A1 1 0 0 1 12 2v5h4a1 1 0 0 1 .82 1.573l-7 10A1 1 0 0 1 8 18v-5H4a1 1 0 0 1-.82-1.573l7-10a1 1 0 0 1 1.12-.38z" />
              </svg>
              Try sample data
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
            >
              Clear form
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
