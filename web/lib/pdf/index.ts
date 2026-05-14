import { jsPDF } from "jspdf";
import type { Template } from "@/types/database";
import { parseBlocks, stripDuplicateHeader, stripInline, type Block } from "./parse";
import { cropToCircle } from "./image";

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;

export interface PdfInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  jobTitle: string;
  skills?: string | null;
  education?: string | null;
  photo?: string | null;
  template: Template;
  resume: string;
  coverLetter?: string | null;
}

type Rgb = [number, number, number];

// ─── Shared helpers ──────────────────────────────────────────────────

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
}

function safeName(name: string): string {
  return (name || "resume").replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
}

// ─── TEMPLATE 1 — Modern (green band) ────────────────────────────────

function renderModern(doc: jsPDF, input: PdfInput, photoCircle: string | null) {
  const ACCENT: Rgb = [0, 217, 111];
  const TEXT: Rgb = [20, 20, 20];
  const MUTED: Rgb = [110, 110, 110];

  const hasPhoto = !!photoCircle;
  const bandH = hasPhoto ? 170 : 100;

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, bandH, "F");

  if (hasPhoto) {
    const ps = 84;
    const px = (PAGE_W - ps) / 2;
    const py = 24;
    doc.setFillColor(255, 255, 255);
    doc.circle(PAGE_W / 2, py + ps / 2, ps / 2 + 4, "F");
    doc.addImage(photoCircle!, "PNG", px, py, ps, ps);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(10, 10, 10);
  doc.text(input.name || "", PAGE_W / 2, hasPhoto ? 130 : 52, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 75, 35);
  doc.text(input.jobTitle || "", PAGE_W / 2, hasPhoto ? 152 : 76, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const contact = [input.email, input.phone].filter(Boolean).join("   •   ");
  const contactY = bandH + 24;
  if (contact) doc.text(contact, PAGE_W / 2, contactY, { align: "center" });

  let y = contact ? contactY + 36 : bandH + 30;
  const blocks = stripDuplicateHeader(parseBlocks(input.resume), input.name);
  const maxW = PAGE_W - MARGIN * 2;

  for (const b of blocks) {
    if (b.type === "heading") {
      y = ensureSpace(doc, y, 32);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(b.level <= 2 ? 13 : 11);
      doc.setTextColor(...ACCENT);
      doc.text(stripInline(b.text).toUpperCase(), MARGIN, y);
      y += 6;
      doc.setDrawColor(...ACCENT);
      doc.setLineWidth(1.2);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 14;
    } else if (b.type === "list") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...TEXT);
      for (const item of b.items) {
        y = ensureSpace(doc, y, 14);
        doc.setFillColor(...ACCENT);
        doc.circle(MARGIN + 4, y - 3, 1.6, "F");
        const lines = doc.splitTextToSize(stripInline(item), maxW - 16);
        for (const ln of lines) {
          y = ensureSpace(doc, y, 13);
          doc.text(ln, MARGIN + 14, y);
          y += 13;
        }
        y += 1;
      }
      y += 6;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(stripInline(b.text), maxW);
      for (const ln of lines) {
        y = ensureSpace(doc, y, 13);
        doc.text(ln, MARGIN, y);
        y += 13;
      }
      y += 4;
    }
  }
}

// ─── TEMPLATE 2 — Classic (centered serif, navy) ─────────────────────

function renderClassic(doc: jsPDF, input: PdfInput, photoCircle: string | null) {
  const NAVY: Rgb = [26, 40, 69];
  const TEXT: Rgb = [30, 30, 30];
  const MUTED: Rgb = [110, 110, 110];

  let top = 0;
  if (photoCircle) {
    const ps = 78;
    const px = (PAGE_W - ps) / 2;
    const py = 40;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(1.5);
    doc.circle(PAGE_W / 2, py + ps / 2, ps / 2 + 2);
    doc.addImage(photoCircle, "PNG", px, py, ps, ps);
    top = ps + 30;
  }

  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...NAVY);
  doc.text((input.name || "").toUpperCase(), PAGE_W / 2, 70 + top, {
    align: "center",
    charSpace: 1.5,
  });

  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...MUTED);
  doc.text(input.jobTitle || "", PAGE_W / 2, 92 + top, { align: "center" });

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(MARGIN + 60, 110 + top, PAGE_W - MARGIN - 60, 110 + top);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 60, 113 + top, PAGE_W - MARGIN - 60, 113 + top);

  const contact = [input.email, input.phone].filter(Boolean).join("   |   ");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  if (contact)
    doc.text(contact, PAGE_W / 2, 130 + top, { align: "center" });

  let y = (contact ? 165 : 145) + top;
  const blocks = stripDuplicateHeader(parseBlocks(input.resume), input.name);
  const maxW = PAGE_W - MARGIN * 2;

  for (const b of blocks) {
    if (b.type === "heading") {
      y = ensureSpace(doc, y, 28);
      y += 6;
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      doc.text(stripInline(b.text).toUpperCase(), PAGE_W / 2, y, {
        align: "center",
        charSpace: 1.2,
      });
      y += 6;
      doc.setDrawColor(...NAVY);
      doc.setLineWidth(0.4);
      doc.line(PAGE_W / 2 - 30, y, PAGE_W / 2 + 30, y);
      y += 14;
    } else if (b.type === "list") {
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      for (const item of b.items) {
        y = ensureSpace(doc, y, 14);
        doc.text("◆", MARGIN + 4, y);
        const lines = doc.splitTextToSize(stripInline(item), maxW - 20);
        for (const ln of lines) {
          y = ensureSpace(doc, y, 14);
          doc.text(ln, MARGIN + 18, y);
          y += 14;
        }
        y += 2;
      }
      y += 6;
    } else {
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(stripInline(b.text), maxW);
      for (const ln of lines) {
        y = ensureSpace(doc, y, 14);
        doc.text(ln, MARGIN, y);
        y += 14;
      }
      y += 6;
    }
  }
}

// ─── TEMPLATE 3 — Creative (terracotta sidebar) ──────────────────────

function renderCreative(doc: jsPDF, input: PdfInput, photoCircle: string | null) {
  const DARK: Rgb = [10, 10, 10];
  const ACCENT: Rgb = [200, 89, 58];
  const TEXT: Rgb = [25, 25, 25];
  const MUTED_LIGHT: Rgb = [180, 180, 180];
  const SIDEBAR_W = 200;

  doc.setFillColor(...DARK);
  doc.rect(0, 0, SIDEBAR_W, PAGE_H, "F");

  let yLeft = 40;
  if (photoCircle) {
    const ps = 110;
    const px = (SIDEBAR_W - ps) / 2;
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(2);
    doc.circle(SIDEBAR_W / 2, yLeft + ps / 2, ps / 2 + 3);
    doc.addImage(photoCircle, "PNG", px, yLeft, ps, ps);
    yLeft += ps + 24;
  } else {
    yLeft = 70;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  const nameLines = doc.splitTextToSize(input.name || "", SIDEBAR_W - 40);
  for (const ln of nameLines) {
    doc.text(ln, 20, yLeft);
    yLeft += 24;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  yLeft += 4;
  const titleLines = doc.splitTextToSize(input.jobTitle || "", SIDEBAR_W - 40);
  for (const ln of titleLines) {
    doc.text(ln, 20, yLeft);
    yLeft += 14;
  }

  yLeft += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text("CONTACT", 20, yLeft);
  yLeft += 4;
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(20, yLeft, 70, yLeft);
  yLeft += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_LIGHT);
  if (input.email) {
    for (const ln of doc.splitTextToSize(input.email, SIDEBAR_W - 40)) {
      doc.text(ln, 20, yLeft);
      yLeft += 12;
    }
  }
  if (input.phone) {
    doc.text(input.phone, 20, yLeft);
    yLeft += 12;
  }

  if (input.skills) {
    yLeft += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.text("SKILLS", 20, yLeft);
    yLeft += 4;
    doc.line(20, yLeft, 60, yLeft);
    yLeft += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_LIGHT);
    const skills = input.skills.split(",").map((s) => s.trim()).filter(Boolean);
    for (const skill of skills) {
      for (const ln of doc.splitTextToSize(`• ${skill}`, SIDEBAR_W - 40)) {
        if (yLeft > PAGE_H - 60) break;
        doc.text(ln, 20, yLeft);
        yLeft += 12;
      }
    }
  }

  const contentX = SIDEBAR_W + 30;
  const contentW = PAGE_W - contentX - MARGIN;
  let yRight = 70;
  const blocks = stripDuplicateHeader(parseBlocks(input.resume), input.name);

  for (const b of blocks) {
    if (b.type === "heading") {
      if (yRight + 30 > PAGE_H - MARGIN) {
        doc.addPage();
        yRight = MARGIN + 10;
      }
      yRight += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...DARK);
      doc.text(stripInline(b.text).toUpperCase(), contentX, yRight);
      yRight += 4;
      doc.setDrawColor(...ACCENT);
      doc.setLineWidth(1.5);
      doc.line(contentX, yRight + 2, contentX + 30, yRight + 2);
      yRight += 16;
    } else if (b.type === "list") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT);
      for (const item of b.items) {
        if (yRight + 14 > PAGE_H - MARGIN) {
          doc.addPage();
          yRight = MARGIN + 10;
        }
        doc.setFillColor(...ACCENT);
        doc.rect(contentX, yRight - 6, 3, 8, "F");
        const lines = doc.splitTextToSize(stripInline(item), contentW - 14);
        for (const ln of lines) {
          if (yRight + 13 > PAGE_H - MARGIN) {
            doc.addPage();
            yRight = MARGIN + 10;
          }
          doc.text(ln, contentX + 12, yRight);
          yRight += 13;
        }
        yRight += 1;
      }
      yRight += 6;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...TEXT);
      const lines = doc.splitTextToSize(stripInline(b.text), contentW);
      for (const ln of lines) {
        if (yRight + 13 > PAGE_H - MARGIN) {
          doc.addPage();
          yRight = MARGIN + 10;
        }
        doc.text(ln, contentX, yRight);
        yRight += 13;
      }
      yRight += 4;
    }
  }
}

// ─── TEMPLATE 4 — Executive (navy sidebar + timeline + skill bars) ──

function renderExecutive(
  doc: jsPDF,
  input: PdfInput,
  photoCircle: string | null,
) {
  const NAVY: Rgb = [13, 59, 102];
  const NAVY_LIGHT: Rgb = [70, 130, 200];
  const TIMELINE: Rgb = [220, 220, 220];
  const TEXT: Rgb = [25, 25, 25];
  const SIDEBAR_W = 215;

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, SIDEBAR_W, PAGE_H, "F");

  let yLeft = 50;
  if (photoCircle) {
    const ps = 130;
    const px = (SIDEBAR_W - ps) / 2;
    doc.setDrawColor(...NAVY_LIGHT);
    doc.setLineWidth(3);
    doc.circle(SIDEBAR_W / 2, yLeft + ps / 2, ps / 2 + 4);
    doc.addImage(photoCircle, "PNG", px, yLeft, ps, ps);
    yLeft += ps + 30;
  } else {
    yLeft = 90;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  for (const ln of doc.splitTextToSize(
    (input.name || "").toUpperCase(),
    SIDEBAR_W - 30,
  )) {
    doc.text(ln, SIDEBAR_W / 2, yLeft, { align: "center", charSpace: 1 });
    yLeft += 24;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 200, 230);
  for (const ln of doc.splitTextToSize(
    (input.jobTitle || "").toUpperCase(),
    SIDEBAR_W - 40,
  )) {
    doc.text(ln, SIDEBAR_W / 2, yLeft, { align: "center", charSpace: 1.2 });
    yLeft += 14;
  }

  yLeft += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTACT", 25, yLeft);
  yLeft += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  if (input.phone) {
    doc.text(input.phone, 25, yLeft);
    yLeft += 14;
  }
  if (input.email) {
    for (const ln of doc.splitTextToSize(input.email, SIDEBAR_W - 50)) {
      doc.text(ln, 25, yLeft);
      yLeft += 12;
    }
    yLeft += 2;
  }

  if (input.education) {
    yLeft += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("EDUCATION", 25, yLeft);
    yLeft += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    for (const ln of doc.splitTextToSize(input.education, SIDEBAR_W - 40)) {
      if (yLeft > PAGE_H - 50) break;
      doc.text(ln, 25, yLeft);
      yLeft += 12;
    }
  }

  const timelineX = SIDEBAR_W + 38;
  const textX = SIDEBAR_W + 60;
  const contentW = PAGE_W - textX - 30;
  let yRight = 60;

  const allBlocks = stripDuplicateHeader(parseBlocks(input.resume), input.name);
  type Section = { title: string; blocks: Block[] };
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const b of allBlocks) {
    if (b.type === "heading") {
      if (current) sections.push(current);
      current = { title: b.text, blocks: [] };
    } else if (current) {
      current.blocks.push(b);
    } else {
      current = { title: "Profile", blocks: [b] };
    }
  }
  if (current) sections.push(current);

  const ensure = (needed: number) => {
    if (yRight + needed > PAGE_H - MARGIN) {
      doc.addPage();
      yRight = MARGIN + 10;
      return true;
    }
    return false;
  };

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    ensure(60);
    const sectionStartY = yRight;

    doc.setFillColor(...NAVY);
    doc.circle(timelineX, yRight + 6, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), timelineX, yRight + 9.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text(stripInline(sec.title).toUpperCase(), textX, yRight + 9.5, {
      charSpace: 0.5,
    });
    yRight += 28;

    const isSkills = /skill|compétence|مهار/i.test(sec.title);
    if (isSkills && input.skills) {
      const skills = input.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const labelMaxW = 110;
      const barX = textX + labelMaxW + 12;
      const barAreaW = PAGE_W - 30 - barX;
      for (let j = 0; j < skills.length; j++) {
        ensure(20);
        const proportion = Math.max(0.4, 1 - j * 0.07);
        const barLen = barAreaW * proportion;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT);
        doc.text(skills[j], textX + labelMaxW, yRight + 8, { align: "right" });
        doc.setFillColor(...NAVY);
        doc.rect(barX, yRight + 3, barLen, 8, "F");
        yRight += 18;
      }
      yRight += 8;
    } else {
      for (const b of sec.blocks) {
        if (b.type === "list") {
          for (const item of b.items) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...TEXT);
            const lines = doc.splitTextToSize(stripInline(item), contentW - 14);
            ensure(lines.length * 13 + 4);
            doc.setFillColor(...NAVY);
            doc.circle(textX + 4, yRight + 4, 1.6, "F");
            for (const ln of lines) {
              doc.text(ln, textX + 14, yRight + 7);
              yRight += 13;
            }
            yRight += 2;
          }
          yRight += 6;
        } else if (b.type === "heading") {
          ensure(20);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(...NAVY);
          doc.text(stripInline(b.text), textX, yRight + 8);
          yRight += 16;
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(...TEXT);
          const lines = doc.splitTextToSize(stripInline(b.text), contentW);
          for (const ln of lines) {
            ensure(13);
            doc.text(ln, textX, yRight + 7);
            yRight += 13;
          }
          yRight += 6;
        }
      }
      yRight += 4;
    }

    if (i < sections.length - 1) {
      doc.setDrawColor(...TIMELINE);
      doc.setLineWidth(1.5);
      doc.line(
        timelineX,
        sectionStartY + 18,
        timelineX,
        Math.max(sectionStartY + 30, yRight - 8),
      );
    }
  }
}

// ─── Dispatch ────────────────────────────────────────────────────────

const RENDERERS = {
  modern: renderModern,
  classic: renderClassic,
  creative: renderCreative,
  executive: renderExecutive,
} as const;

export async function generateResumePDF(input: PdfInput): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const photoCircle = await cropToCircle(input.photo);
  const fn = RENDERERS[input.template] ?? renderExecutive;
  fn(doc, input, photoCircle);
  doc.save(`${safeName(input.name)}_${input.template}.pdf`);
}

export function generateCoverLetterPDF(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
  template: Template;
  coverLetter: string;
}): void {
  if (!input.coverLetter) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const tpl = input.template;
  const palette =
    tpl === "classic"
      ? { accent: [26, 40, 69] as Rgb, font: "times" as const }
      : tpl === "creative"
        ? { accent: [200, 89, 58] as Rgb, font: "helvetica" as const }
        : tpl === "executive"
          ? { accent: [13, 59, 102] as Rgb, font: "helvetica" as const }
          : { accent: [0, 217, 111] as Rgb, font: "helvetica" as const };

  doc.setFont(palette.font, "bold");
  doc.setFontSize(22);
  doc.setTextColor(...palette.accent);
  doc.text("Cover Letter", MARGIN, 60);

  doc.setFont(palette.font, "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 110);
  const meta = [input.name, input.email, input.phone].filter(Boolean).join("  •  ");
  doc.text(meta, MARGIN, 80);

  doc.setDrawColor(...palette.accent);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 92, PAGE_W - MARGIN, 92);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(
    stripInline(input.coverLetter),
    PAGE_W - MARGIN * 2,
  );
  let y = 120;
  const lh = 15;
  for (const ln of lines) {
    y = ensureSpace(doc, y, lh);
    doc.text(ln, MARGIN, y);
    y += lh;
  }

  doc.save(`${safeName(input.name)}_CoverLetter.pdf`);
}
