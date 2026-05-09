import { Card, CardBody } from "@/components/ui/card";

export const metadata = { title: "Generator · ResumeAI" };

export default function GeneratorPage() {
  return (
    <div className="px-6 py-10 md:px-10 md:py-12 max-w-6xl">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Generate your resume
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Fill in your details. AI does the writing.
        </p>
      </header>

      <Card>
        <CardBody>
          <div className="text-center py-16">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent-deep dark:text-accent mb-4">
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
                <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l3.5 8.5L22 14l-5.5 2.5L13 22l-3.5-5.5L4 14l5.5-2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Generator coming in Phase 2
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Form, AI generation, live preview, photo upload, 4 PDF templates,
              and multi-language. Phase 1 is auth + landing + dashboard
              skeleton — solid foundation to build on.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
