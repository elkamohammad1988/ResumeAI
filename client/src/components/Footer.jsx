import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-[#0a0a0a] text-zinc-400">
      <div className="max-w-6xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-white font-semibold tracking-tight"
          >
            <span className="relative inline-flex h-7 w-7 items-center justify-center">
              <span className="absolute inset-0 rounded-md bg-[#00d96f]" />
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
              Resume<span className="text-[#00d96f]">AI</span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-zinc-500 max-w-sm leading-relaxed">
            AI-tuned resumes and cover letters in under 30 seconds. ATS-ready,
            recruiter-friendly, free forever.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/generator"
                className="hover:text-white transition-colors"
              >
                Generator
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Account
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link to="/login" className="hover:text-white transition-colors">
                Sign in
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-white transition-colors"
              >
                Create account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00d96f] animate-pulse" />
            Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>
    </footer>
  );
}
