import React, { useState } from "react";
import MarkdownText from "../utils/markdown.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ResumePreview({ resume }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!resume) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resume);
      setCopied(true);
      showToast({ type: "success", message: "Resume text copied." });
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      showToast({ type: "error", message: "Couldn't copy to clipboard." });
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#00d96f]" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
            Resume
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Copy text to clipboard"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Preview
          </span>
        </div>
      </div>
      <div className="p-8 md:p-10">
        <MarkdownText text={resume} />
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-[#00a350] dark:text-[#00d96f]"
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
