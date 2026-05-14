import type { Language } from "@/types/database";

export const RESUME_TAG = "===RESUME===";
export const COVER_TAG = "===COVER_LETTER===";

const LANG_INSTRUCTIONS: Record<Language, { label: string; salutation: string; extra: string }> = {
  en: {
    label: "English",
    salutation: 'addressed generically ("Dear Hiring Manager,")',
    extra: "Write everything in English.",
  },
  fr: {
    label: "French",
    salutation: 'addressed generically ("Madame, Monsieur,")',
    extra:
      "Write everything in clear, professional French. Section titles like Résumé, Compétences, Expérience, Formation.",
  },
  ar: {
    label: "Arabic",
    salutation: 'addressed generically ("السيد/السيدة المسؤول/ة عن التوظيف،")',
    extra:
      "Write everything in clear, professional Modern Standard Arabic (الفصحى). Use standard resume section titles in Arabic (الملخص، المهارات، الخبرة، التعليم). Right-to-left reads naturally — do not insert direction markers.",
  },
};

export interface PromptInput {
  name: string;
  email?: string;
  phone?: string;
  jobTitle: string;
  jobDescription?: string;
  skills?: string;
  experience?: string;
  education?: string;
  language?: Language;
}

export function buildPrompt(input: PromptInput): string {
  const lang = LANG_INSTRUCTIONS[input.language ?? "en"];

  const targetingBlock = input.jobDescription?.trim()
    ? `
TARGETING — Tailor specifically to this job posting:
"""
${input.jobDescription.trim()}
"""
Mirror the employer's language. Reorder the candidate's experience and skills to lead with what matches this posting. Quantify wins around what this job will measure success by. The cover letter must reference 2–3 specific points from the posting (the company's stated goals, must-have skills, or domain) — not generic praise.`
    : "";

  return `
You are a senior HR manager with 15+ years of experience reviewing resumes for international companies.

Create a professional, ATS-optimized resume AND a tailored cover letter for the candidate below.

Output language: ${lang.label}. ${lang.extra}

Candidate Information:
- Name: ${input.name}
- Email: ${input.email || "N/A"}
- Phone: ${input.phone || "N/A"}
- Target Job Title: ${input.jobTitle}
- Skills: ${input.skills || "N/A"}
- Experience: ${input.experience || "N/A"}
- Education: ${input.education || "N/A"}
${targetingBlock}

Rules:
- Use strong action verbs.
- Make achievements measurable where possible.
- Optimize for ATS keyword matching against the target job title${
    input.jobDescription ? " AND the provided job description" : ""
  }.
- Use clear sections (Summary, Skills, Experience, Education) and bullet points.
- The cover letter should be 3 short paragraphs, ${lang.salutation}.
- Use Markdown: **bold** for section headings, "- " for bullets.

Output format — return EXACTLY this structure, with the two markers on their own lines and nothing before or after:

${RESUME_TAG}
<the full resume here>
${COVER_TAG}
<the full cover letter here>
`;
}

export function splitOutput(raw: string): { resume: string; coverLetter: string } {
  const text = raw || "";
  const resumeIdx = text.indexOf(RESUME_TAG);
  const coverIdx = text.indexOf(COVER_TAG);
  if (resumeIdx !== -1 && coverIdx !== -1 && coverIdx > resumeIdx) {
    return {
      resume: text.slice(resumeIdx + RESUME_TAG.length, coverIdx).trim(),
      coverLetter: text.slice(coverIdx + COVER_TAG.length).trim(),
    };
  }
  return { resume: text.trim(), coverLetter: "" };
}
