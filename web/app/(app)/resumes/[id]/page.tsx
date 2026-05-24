import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import MarkdownText from "@/components/shared/MarkdownText";
import { DownloadButtons } from "@/components/shared/DownloadButtons";
import type { Template } from "@/types/database";
import { isUuid } from "@/lib/safe-redirect";
import { deleteResumeAction } from "./actions";

export const metadata = { title: "Resume · ResumeAI" };

const LANG_LABEL: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Validate UUID shape before querying — avoids a Postgres 22P02 error
  // bubbling up and gives a clean 404 for garbage paths.
  if (!isUuid(id)) notFound();

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) notFound();

  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-5xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
      >
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H17a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to dashboard
      </Link>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {resume.name}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {resume.job_title}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
            <span>
              {new Date(resume.created_at).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </span>
            <span>·</span>
            <Badge>{resume.template}</Badge>
            <Badge>{LANG_LABEL[resume.language] || resume.language}</Badge>
            {resume.job_description && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-accent-deep dark:text-accent bg-accent/10 border border-accent/20 rounded">
                <span className="h-1 w-1 rounded-full bg-accent" />
                Tailored
              </span>
            )}
          </div>
        </div>

        <form action={deleteResumeAction}>
          <input type="hidden" name="id" value={resume.id} />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
          >
            Delete
          </button>
        </form>
      </header>

      {/* Download CTAs */}
      <div className="mb-8 p-5 bg-[#0a0a0a] dark:bg-zinc-900 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="text-white min-w-0">
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent">
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
            Polished PDFs in the {resume.template} template — ready to send.
          </p>
        </div>
        <DownloadButtons
          name={resume.name}
          email={resume.email}
          phone={resume.phone}
          jobTitle={resume.job_title}
          skills={resume.skills}
          education={resume.education}
          photo={resume.photo}
          template={resume.template as Template}
          resume={resume.resume}
          coverLetter={resume.cover_letter}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
            Resume
          </h3>
        </div>
        <div className="p-8 md:p-10">
          <MarkdownText text={resume.resume} />
        </div>
      </Card>

      {resume.cover_letter && (
        <Card className="mt-6 overflow-hidden">
          <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
              Cover letter
            </h3>
          </div>
          <div className="p-8 md:p-10">
            <MarkdownText text={resume.cover_letter} />
          </div>
        </Card>
      )}

    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded capitalize">
      {children}
    </span>
  );
}
