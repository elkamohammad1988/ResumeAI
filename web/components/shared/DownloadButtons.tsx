"use client";

import { useState } from "react";
import { generateResumePDF, generateCoverLetterPDF } from "@/lib/pdf";
import type { Template } from "@/types/database";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string;
  skills: string | null;
  education: string | null;
  photo: string | null;
  template: Template;
  resume: string;
  coverLetter: string | null;
}

export function DownloadButtons(props: Props) {
  const [busy, setBusy] = useState<"resume" | "cover" | null>(null);

  const downloadResume = async () => {
    setBusy("resume");
    try {
      await generateResumePDF(props);
    } finally {
      setBusy(null);
    }
  };

  const downloadCover = () => {
    if (!props.coverLetter) return;
    setBusy("cover");
    try {
      generateCoverLetterPDF({
        name: props.name,
        email: props.email,
        phone: props.phone,
        template: props.template,
        coverLetter: props.coverLetter,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={downloadResume} loading={busy === "resume"}>
        {busy === "resume" ? "Generating PDF…" : "Download resume PDF"}
      </Button>
      {props.coverLetter && (
        <Button
          variant="secondary"
          onClick={downloadCover}
          loading={busy === "cover"}
        >
          {busy === "cover" ? "Generating…" : "Cover letter PDF"}
        </Button>
      )}
    </div>
  );
}
