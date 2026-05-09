import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { resumeApi } from "../api.js";
import ResumePreview from "../components/ResumePreview.jsx";
import CoverLetter from "../components/CoverLetter.jsx";
import { generateResumePDF, generateCoverLetterPDF } from "../utils/pdf.js";
import { useToast } from "../context/ToastContext.jsx";

const LANG_LABEL = {
  en: { label: "English", flag: "🇬🇧" },
  fr: { label: "Français", flag: "🇫🇷" },
  ar: { label: "العربية", flag: "🇲🇦" },
};

const TEMPLATE_LABEL = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  executive: "Executive",
};

function LanguageBadge({ code }) {
  const l = LANG_LABEL[code] || LANG_LABEL.en;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded">
      <span aria-hidden="true">{l.flag}</span>
      {l.label}
    </span>
  );
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await resumeApi.list();
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = async (id) => {
    try {
      const data = await resumeApi.get(id);
      setActive(data.item);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to open resume.");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const data = await resumeApi.duplicate(id);
      if (data?.item) {
        setItems((prev) => [data.item, ...prev]);
      } else {
        // Refetch as fallback
        const list = await resumeApi.list();
        setItems(list.items || []);
      }
      showToast({ type: "success", message: "Resume duplicated." });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to duplicate.";
      setError(msg);
      showToast({ type: "error", message: msg });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this resume permanently?")) return;
    try {
      await resumeApi.remove(id);
      if (active?._id === id) setActive(null);
      setItems((prev) => prev.filter((i) => i._id !== id));
      showToast({ type: "success", message: "Resume deleted." });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete.";
      setError(msg);
      showToast({ type: "error", message: msg });
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        (i.name || "").toLowerCase().includes(q) ||
        (i.jobTitle || "").toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-900/40 min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
              Your resumes
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {items.length === 0
                ? "Saved generations live here."
                : `${items.length} saved generation${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            to="/generator"
            className="shrink-0 px-4 py-2.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm transition-colors"
          >
            + New resume
          </Link>
        </header>

        {/* Search bar — only shown if there are items */}
        {items.length > 0 && (
          <div className="mb-6 relative">
            <svg
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or job title…"
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 dark:text-white rounded-lg placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#00d96f] focus:ring-2 focus:ring-[#00d96f]/20 transition"
            />
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="h-4 w-4 border-2 border-zinc-300 dark:border-zinc-700 border-t-[#00d96f] rounded-full animate-spin" />
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="px-8 py-16 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-[#0a0a0a] dark:text-white">
              Nothing here yet.
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Generate your first resume in under a minute.
            </p>
            <Link
              to="/generator"
              className="inline-block mt-6 px-5 py-2.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm transition-colors"
            >
              Generate now →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-8 py-12 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No resumes match{" "}
              <span className="font-semibold text-[#0a0a0a] dark:text-white">
                &ldquo;{query}&rdquo;
              </span>
              .
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-sm font-semibold text-[#00a350] hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <li
                key={item._id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#0a0a0a] dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                      {item.jobTitle}
                    </p>
                    <div className="mt-2 flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <LanguageBadge code={item.language} />
                      {item.template && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded">
                          {TEMPLATE_LABEL[item.template] || item.template}
                        </span>
                      )}
                      {item.jobDescription &&
                        item.jobDescription.trim().length > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-[#00a350] bg-[#00d96f]/10 border border-[#00d96f]/20 rounded">
                            <span className="h-1 w-1 rounded-full bg-[#00d96f]" />
                            Tailored
                          </span>
                        )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleOpen(item._id)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDuplicate(item._id)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] dark:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                    title="Duplicate this resume"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="ml-auto px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {active && (
          <section className="mt-12">
            <div className="p-5 bg-[#0a0a0a] rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="text-white min-w-0">
                <p className="text-sm font-semibold truncate">{active.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5 truncate flex items-center gap-2">
                  {active.jobTitle}
                  {active.language && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-white/10 rounded">
                      {LANG_LABEL[active.language]?.flag}{" "}
                      {LANG_LABEL[active.language]?.label}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {active.resume && (
                  <button
                    onClick={async () => {
                      await generateResumePDF({
                        form: active,
                        resume: active.resume,
                      });
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-md transition-colors"
                  >
                    Resume PDF
                  </button>
                )}
                {active.coverLetter && (
                  <button
                    onClick={() =>
                      generateCoverLetterPDF({
                        form: active,
                        coverLetter: active.coverLetter,
                      })
                    }
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-md transition-colors"
                  >
                    Cover letter PDF
                  </button>
                )}
                <button
                  onClick={() => setActive(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <ResumePreview resume={active.resume} />
            <CoverLetter content={active.coverLetter} />
          </section>
        )}
      </div>
    </div>
  );
}
