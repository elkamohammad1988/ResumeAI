import { GoogleGenAI } from "@google/genai";
import Resume from "../models/Resume.js";
import User from "../models/User.js";
import {
  FREE_MONTHLY_LIMIT,
  isSameMonth,
  monthlyUsage,
  remainingQuota,
} from "../config/plans.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESUME_TAG = "===RESUME===";
const COVER_TAG = "===COVER_LETTER===";

const SUPPORTED_LANGS = ["en", "fr", "ar"];

const LANG_INSTRUCTIONS = {
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

const buildPrompt = ({
  name,
  email,
  phone,
  jobTitle,
  jobDescription,
  skills,
  experience,
  education,
  language = "en",
}) => {
  const lang = LANG_INSTRUCTIONS[language] || LANG_INSTRUCTIONS.en;

  const targetingBlock = jobDescription
    ? `
TARGETING — Tailor specifically to this job posting:
"""
${jobDescription.trim()}
"""
The candidate is applying to THIS exact job. Extract the key requirements, technologies, soft skills, and outcomes the employer wants. Mirror their language. Reorder the candidate's experience and skills to lead with what matches this posting. Quantify wins that align with what this job will measure success by. The cover letter must reference 2–3 specific points from the posting (the company's stated goals, must-have skills, or domain) — not generic praise.`
    : "";

  return `
You are a senior HR manager with 15+ years of experience reviewing resumes for international companies.

Create a professional, ATS-optimized resume AND a tailored cover letter for the candidate below.

Output language: ${lang.label}. ${lang.extra}

Candidate Information:
- Name: ${name}
- Email: ${email || "N/A"}
- Phone: ${phone || "N/A"}
- Target Job Title: ${jobTitle}
- Skills: ${skills || "N/A"}
- Experience: ${experience || "N/A"}
- Education: ${education || "N/A"}
${targetingBlock}

Rules:
- Use strong action verbs.
- Make achievements measurable where possible.
- Optimize for ATS keyword matching against the target job title${jobDescription ? " AND the provided job description" : ""}.
- Use clear sections (Summary, Skills, Experience, Education) and bullet points.
- The cover letter should be 3 short paragraphs, ${lang.salutation}.
- Use Markdown: **bold** for section headings, "- " for bullets.

Output format — return EXACTLY this structure, with the two markers on their own lines and nothing before or after:

${RESUME_TAG}
<the full resume here>
${COVER_TAG}
<the full cover letter here>
`;
};

const splitResponse = (raw) => {
  const text = raw || "";
  const resumeIdx = text.indexOf(RESUME_TAG);
  const coverIdx = text.indexOf(COVER_TAG);

  if (resumeIdx !== -1 && coverIdx !== -1 && coverIdx > resumeIdx) {
    const resume = text
      .slice(resumeIdx + RESUME_TAG.length, coverIdx)
      .trim();
    const coverLetter = text.slice(coverIdx + COVER_TAG.length).trim();
    return { resume, coverLetter };
  }

  return { resume: text.trim(), coverLetter: "" };
};

export const generateResumeAndCoverLetter = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      jobTitle,
      jobDescription,
      skills,
      experience,
      education,
      photo,
      language: rawLanguage,
      template: rawTemplate,
    } = req.body;

    if (!name || !jobTitle) {
      return res
        .status(400)
        .json({ error: "Name and target job title are required" });
    }

    // Quota check (free plan only)
    const userDoc = await User.findById(req.user.id);
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    if (userDoc.plan !== "premium") {
      const remaining = remainingQuota(userDoc);
      if (remaining <= 0) {
        return res.status(402).json({
          error: `You've used all ${FREE_MONTHLY_LIMIT} free generations this month. Upgrade to Pro for unlimited.`,
          code: "quota_exceeded",
          usage: {
            count: monthlyUsage(userDoc),
            limit: FREE_MONTHLY_LIMIT,
            remaining: 0,
          },
        });
      }
    }

    const language = SUPPORTED_LANGS.includes(rawLanguage) ? rawLanguage : "en";
    const SUPPORTED_TEMPLATES = ["modern", "classic", "creative", "executive"];
    const template = SUPPORTED_TEMPLATES.includes(rawTemplate)
      ? rawTemplate
      : "modern";

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: buildPrompt({
        name,
        email,
        phone,
        jobTitle,
        jobDescription,
        skills,
        experience,
        education,
        language,
      }),
      config: {
        systemInstruction: "You are an expert resume writer.",
      },
    });

    const raw = result.text || "";
    const { resume, coverLetter } = splitResponse(raw);

    // Validate photo size (max ~500KB after base64 to avoid bloating Mongo)
    const safePhoto =
      typeof photo === "string" &&
      photo.startsWith("data:image/") &&
      photo.length < 700000
        ? photo
        : undefined;

    const saved = await Resume.create({
      user: req.user.id,
      name,
      email,
      phone,
      jobTitle,
      jobDescription,
      skills,
      experience,
      education,
      photo: safePhoto,
      language,
      template,
      resume,
      coverLetter,
    });

    // Increment usage counter (free plan only)
    if (userDoc.plan !== "premium") {
      const now = new Date();
      const reset = userDoc.usageResetAt
        ? new Date(userDoc.usageResetAt)
        : now;
      if (!isSameMonth(now, reset)) {
        userDoc.usageCount = 1;
        userDoc.usageResetAt = now;
      } else {
        userDoc.usageCount = (userDoc.usageCount || 0) + 1;
      }
      await userDoc.save();
    }

    const usageNow = monthlyUsage(userDoc);
    const limit = userDoc.plan === "premium" ? null : FREE_MONTHLY_LIMIT;

    res.json({
      success: true,
      id: saved._id,
      resume,
      coverLetter,
      usage: {
        count: usageNow,
        limit,
        remaining: userDoc.plan === "premium" ? null : Math.max(0, FREE_MONTHLY_LIMIT - usageNow),
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
};

export const duplicateResume = async (req, res) => {
  try {
    const original = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!original) return res.status(404).json({ error: "Resume not found" });

    const copy = await Resume.create({
      user: req.user.id,
      name: original.name,
      email: original.email,
      phone: original.phone,
      jobTitle: original.jobTitle,
      jobDescription: original.jobDescription,
      skills: original.skills,
      experience: original.experience,
      education: original.education,
      photo: original.photo,
      language: original.language,
      template: original.template,
      resume: original.resume,
      coverLetter: original.coverLetter,
    });

    res.json({
      success: true,
      id: copy._id,
      item: {
        _id: copy._id,
        name: copy.name,
        jobTitle: copy.jobTitle,
        language: copy.language,
        template: copy.template,
        jobDescription: copy.jobDescription,
        createdAt: copy.createdAt,
      },
    });
  } catch (err) {
    console.error("Duplicate error:", err);
    res.status(500).json({ error: "Failed to duplicate resume" });
  }
};

export const listMyResumes = async (req, res) => {
  try {
    const items = await Resume.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select("name jobTitle language template jobDescription createdAt");
    res.json({ items });
  } catch (err) {
    console.error("List resumes error:", err);
    res.status(500).json({ error: "Failed to load resumes" });
  }
};

export const getMyResume = async (req, res) => {
  try {
    const item = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!item) return res.status(404).json({ error: "Resume not found" });
    res.json({ item });
  } catch (err) {
    console.error("Get resume error:", err);
    res.status(500).json({ error: "Failed to load resume" });
  }
};

export const deleteMyResume = async (req, res) => {
  try {
    const item = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!item) return res.status(404).json({ error: "Resume not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ error: "Failed to delete resume" });
  }
};
