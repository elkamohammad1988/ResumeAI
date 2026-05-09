import { jsPDF } from "jspdf";

// A4 dimensions in points
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 40;

// ────────────────────────────────────────────────────────────────────────────
// Image helpers — circular crop
// ────────────────────────────────────────────────────────────────────────────

const cropToCircle = (dataUrl, size = 360) =>
  new Promise((resolve, reject) => {
    if (!dataUrl) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const side = Math.min(w, h);
      const sx = (w - side) / 2;
      const sy = (h - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });

// ────────────────────────────────────────────────────────────────────────────
// Markdown-ish parser (shared across templates)
// ────────────────────────────────────────────────────────────────────────────

const stripInline = (s) =>
  (s || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<![*\w])\*(?!\s)([^*]+?)\*(?![*\w])/g, "$1");

const parseBlocks = (text) => {
  const lines = (text || "").split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    const wholeBold = /^\*\*([^*]+)\*\*\s*$/.exec(trimmed);
    if (wholeBold) {
      blocks.push({ type: "heading", level: 2, text: wholeBold[1] });
      i++;
      continue;
    }

    if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^[-*]\s/.test(t)) items.push(t.slice(2));
        else if (/^\d+\.\s/.test(t)) items.push(t.replace(/^\d+\.\s+/, ""));
        else break;
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
    i++;
  }

  return blocks;
};

// Strip the first 1-2 blocks if they duplicate the header (name + contact)
const stripDuplicateHeader = (blocks, name) => {
  let idx = 0;
  if (blocks[idx]?.type === "heading" && name) {
    const blockName = stripInline(blocks[idx].text).toLowerCase();
    const targetName = name.toLowerCase();
    if (
      blockName.includes(targetName) ||
      targetName.includes(blockName) ||
      blockName === targetName
    ) {
      idx++;
    }
  }
  if (
    blocks[idx]?.type === "paragraph" &&
    /[@•·|]|\+\d|\d{3,}/.test(blocks[idx].text)
  ) {
    idx++;
  }
  return blocks.slice(idx);
};

// ────────────────────────────────────────────────────────────────────────────
// Common helpers
// ────────────────────────────────────────────────────────────────────────────

const ensureSpace = (doc, y, needed, marginBottom = MARGIN) => {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - marginBottom) {
    doc.addPage();
    return MARGIN + 10;
  }
  return y;
};

const writeWrapped = (doc, text, x, y, maxWidth, lineHeight) => {
  if (!text) return y;
  const lines = doc.splitTextToSize(stripInline(text), maxWidth);
  for (const ln of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(ln, x, y);
    y += lineHeight;
  }
  return y;
};

const writeWrappedAlign = (doc, text, x, y, maxWidth, lineHeight, align) => {
  if (!text) return y;
  const lines = doc.splitTextToSize(stripInline(text), maxWidth);
  for (const ln of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(ln, x, y, { align });
    y += lineHeight;
  }
  return y;
};

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — Modern (green band header, clean single column)
// ────────────────────────────────────────────────────────────────────────────

const renderModern = (form, resume, photoCircle) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ACCENT = [0, 217, 111];
  const TEXT = [20, 20, 20];
  const MUTED = [110, 110, 110];

  const hasPhoto = !!photoCircle;
  const bandH = hasPhoto ? 170 : 100;

  // Green header band
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, bandH, "F");

  // Photo (top-center), white ring around it
  if (hasPhoto) {
    const photoSize = 84;
    const px = (PAGE_W - photoSize) / 2;
    const py = 24;
    // White ring backdrop
    doc.setFillColor(255, 255, 255);
    doc.circle(PAGE_W / 2, py + photoSize / 2, photoSize / 2 + 4, "F");
    doc.addImage(photoCircle, "PNG", px, py, photoSize, photoSize);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(10, 10, 10);
  doc.text(form.name || "", PAGE_W / 2, hasPhoto ? 130 : 52, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0, 75, 35);
  doc.text(form.jobTitle || "", PAGE_W / 2, hasPhoto ? 152 : 76, {
    align: "center",
  });

  // Contact line below the band
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const contact = [form.email, form.phone].filter(Boolean).join("   •   ");
  const contactY = bandH + 24;
  if (contact) doc.text(contact, PAGE_W / 2, contactY, { align: "center" });

  // Body
  let y = contact ? contactY + 36 : bandH + 30;
  const blocks = stripDuplicateHeader(parseBlocks(resume), form.name);
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
        for (let i = 0; i < lines.length; i++) {
          y = ensureSpace(doc, y, 13);
          doc.text(lines[i], MARGIN + 14, y);
          y += 13;
        }
        y += 1;
      }
      y += 6;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(...TEXT);
      y = writeWrapped(doc, b.text, MARGIN, y, maxW, 13);
      y += 4;
    }
  }

  doc.save(`${(form.name || "resume").replace(/\s+/g, "_")}_Modern.pdf`);
};

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — Classic (centered serif, navy, traditional)
// ────────────────────────────────────────────────────────────────────────────

const renderClassic = (form, resume, photoCircle) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const NAVY = [26, 40, 69];
  const TEXT = [30, 30, 30];
  const MUTED = [110, 110, 110];

  const hasPhoto = !!photoCircle;
  let topOffset = 0;

  // Photo top-center
  if (hasPhoto) {
    const photoSize = 78;
    const px = (PAGE_W - photoSize) / 2;
    const py = 40;
    // Navy ring
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(1.5);
    doc.circle(PAGE_W / 2, py + photoSize / 2, photoSize / 2 + 2);
    doc.addImage(photoCircle, "PNG", px, py, photoSize, photoSize);
    topOffset = photoSize + 30;
  }

  // Centered name
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...NAVY);
  doc.text((form.name || "").toUpperCase(), PAGE_W / 2, 70 + topOffset, {
    align: "center",
    charSpace: 1.5,
  });

  // Job title
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.setTextColor(...MUTED);
  doc.text(form.jobTitle || "", PAGE_W / 2, 92 + topOffset, {
    align: "center",
  });

  // Decorative double line
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.8);
  doc.line(MARGIN + 60, 110 + topOffset, PAGE_W - MARGIN - 60, 110 + topOffset);
  doc.setLineWidth(0.3);
  doc.line(MARGIN + 60, 113 + topOffset, PAGE_W - MARGIN - 60, 113 + topOffset);

  // Contact
  const contact = [form.email, form.phone].filter(Boolean).join("   |   ");
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  if (contact)
    doc.text(contact, PAGE_W / 2, 130 + topOffset, { align: "center" });

  // Body
  let y = (contact ? 165 : 145) + topOffset;
  const blocks = stripDuplicateHeader(parseBlocks(resume), form.name);
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
        for (let i = 0; i < lines.length; i++) {
          y = ensureSpace(doc, y, 14);
          doc.text(lines[i], MARGIN + 18, y);
          y += 14;
        }
        y += 2;
      }
      y += 6;
    } else {
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...TEXT);
      y = writeWrapped(doc, b.text, MARGIN, y, maxW, 14);
      y += 6;
    }
  }

  doc.save(`${(form.name || "resume").replace(/\s+/g, "_")}_Classic.pdf`);
};

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — Creative (two-column with dark sidebar)
// ────────────────────────────────────────────────────────────────────────────

const renderCreative = (form, resume, photoCircle) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const DARK = [10, 10, 10];
  const ACCENT = [200, 89, 58]; // terracotta
  const TEXT = [25, 25, 25];
  const MUTED_LIGHT = [180, 180, 180];

  const SIDEBAR_W = 200;
  const hasPhoto = !!photoCircle;

  // Sidebar background — full height of first page
  doc.setFillColor(...DARK);
  doc.rect(0, 0, SIDEBAR_W, PAGE_H, "F");

  let yLeft = 40;

  // Photo top of sidebar
  if (hasPhoto) {
    const photoSize = 110;
    const px = (SIDEBAR_W - photoSize) / 2;
    // Terracotta ring
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(2);
    doc.circle(SIDEBAR_W / 2, yLeft + photoSize / 2, photoSize / 2 + 3);
    doc.addImage(photoCircle, "PNG", px, yLeft, photoSize, photoSize);
    yLeft += photoSize + 24;
  } else {
    yLeft = 70;
  }

  // Sidebar: name + role
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  const nameLines = doc.splitTextToSize(form.name || "", SIDEBAR_W - 40);
  for (const ln of nameLines) {
    doc.text(ln, 20, yLeft);
    yLeft += 24;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...ACCENT);
  yLeft += 4;
  const titleLines = doc.splitTextToSize(form.jobTitle || "", SIDEBAR_W - 40);
  for (const ln of titleLines) {
    doc.text(ln, 20, yLeft);
    yLeft += 14;
  }

  // Sidebar: contact section
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
  if (form.email) {
    const emailLines = doc.splitTextToSize(form.email, SIDEBAR_W - 40);
    for (const ln of emailLines) {
      doc.text(ln, 20, yLeft);
      yLeft += 12;
    }
  }
  if (form.phone) {
    doc.text(form.phone, 20, yLeft);
    yLeft += 12;
  }

  // Sidebar: skills (if available, derived from form)
  if (form.skills) {
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
    const skills = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const skill of skills) {
      const lines = doc.splitTextToSize(`• ${skill}`, SIDEBAR_W - 40);
      for (const ln of lines) {
        if (yLeft > PAGE_H - 60) break;
        doc.text(ln, 20, yLeft);
        yLeft += 12;
      }
    }
  }

  // Right column: body
  const contentX = SIDEBAR_W + 30;
  const contentW = PAGE_W - contentX - MARGIN;
  let yRight = 70;

  const blocks = stripDuplicateHeader(parseBlocks(resume), form.name);

  for (const b of blocks) {
    // For creative, on new pages we restart at top — but sidebar is only on page 1
    if (b.type === "heading") {
      const needed = 30;
      const pageH = doc.internal.pageSize.getHeight();
      if (yRight + needed > pageH - MARGIN) {
        doc.addPage();
        yRight = 60;
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
        const pageH = doc.internal.pageSize.getHeight();
        if (yRight + 14 > pageH - MARGIN) {
          doc.addPage();
          yRight = 60;
        }
        doc.setFillColor(...ACCENT);
        doc.rect(contentX, yRight - 6, 3, 8, "F");
        const lines = doc.splitTextToSize(stripInline(item), contentW - 14);
        for (let i = 0; i < lines.length; i++) {
          if (yRight + 13 > pageH - MARGIN) {
            doc.addPage();
            yRight = 60;
          }
          doc.text(lines[i], contentX + 12, yRight);
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
      const pageH = doc.internal.pageSize.getHeight();
      for (const ln of lines) {
        if (yRight + 13 > pageH - MARGIN) {
          doc.addPage();
          yRight = 60;
        }
        doc.text(ln, contentX, yRight);
        yRight += 13;
      }
      yRight += 4;
    }
  }

  doc.save(`${(form.name || "resume").replace(/\s+/g, "_")}_Creative.pdf`);
};

// ────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — Executive (deep navy sidebar + timeline + skill bars)
// ────────────────────────────────────────────────────────────────────────────

const renderExecutive = (form, resume, photoCircle) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const NAVY = [13, 59, 102];
  const NAVY_LIGHT = [70, 130, 200];
  const TIMELINE = [220, 220, 220];
  const TEXT = [25, 25, 25];
  const TEXT_MUTED = [100, 100, 100];

  const SIDEBAR_W = 215;
  const hasPhoto = !!photoCircle;

  // ───── SIDEBAR ─────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, SIDEBAR_W, PAGE_H, "F");

  let yLeft = 50;

  // Photo (large, with light blue ring)
  if (hasPhoto) {
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

  // Name (centered, white, uppercase)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  const nameUpper = (form.name || "").toUpperCase();
  const nameLines = doc.splitTextToSize(nameUpper, SIDEBAR_W - 30);
  for (const ln of nameLines) {
    doc.text(ln, SIDEBAR_W / 2, yLeft, { align: "center", charSpace: 1 });
    yLeft += 24;
  }

  // Job title (centered, light blue, uppercase)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 200, 230);
  const titleUpper = (form.jobTitle || "").toUpperCase();
  const titleLines = doc.splitTextToSize(titleUpper, SIDEBAR_W - 40);
  for (const ln of titleLines) {
    doc.text(ln, SIDEBAR_W / 2, yLeft, { align: "center", charSpace: 1.2 });
    yLeft += 14;
  }

  // CONTACT
  yLeft += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("CONTACT", 25, yLeft);
  yLeft += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 220);
  if (form.phone) {
    doc.text(form.phone, 25, yLeft);
    yLeft += 14;
  }
  if (form.email) {
    const emailLines = doc.splitTextToSize(form.email, SIDEBAR_W - 50);
    for (const ln of emailLines) {
      doc.text(ln, 25, yLeft);
      yLeft += 12;
    }
    yLeft += 2;
  }

  // Education on sidebar (compact) — pulled from form.education
  if (form.education) {
    yLeft += 18;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("EDUCATION", 25, yLeft);
    yLeft += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 220);
    const eduLines = doc.splitTextToSize(form.education, SIDEBAR_W - 40);
    for (const ln of eduLines) {
      if (yLeft > PAGE_H - 50) break;
      doc.text(ln, 25, yLeft);
      yLeft += 12;
    }
  }

  // ───── RIGHT COLUMN with timeline ─────
  const timelineX = SIDEBAR_W + 38;
  const textX = SIDEBAR_W + 60;
  const contentW = PAGE_W - textX - 30;

  let yRight = 60;

  // Group AI-generated content into sections
  const blocks = stripDuplicateHeader(parseBlocks(resume), form.name);
  const sections = [];
  let current = null;
  for (const b of blocks) {
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

  // Helper: page break aware content drawing
  const ensure = (needed) => {
    if (yRight + needed > PAGE_H - MARGIN) {
      doc.addPage();
      // No sidebar on continuation pages — just margin
      yRight = MARGIN + 10;
      return true;
    }
    return false;
  };

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    ensure(60);
    const sectionStartY = yRight;

    // Filled circle marker on timeline
    doc.setFillColor(...NAVY);
    doc.circle(timelineX, yRight + 6, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), timelineX, yRight + 9.5, { align: "center" });

    // Section heading (uppercase, navy)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    doc.text(stripInline(sec.title).toUpperCase(), textX, yRight + 9.5, {
      charSpace: 0.5,
    });
    yRight += 28;

    // Skills section: bar visualization based on form.skills
    const isSkills = /skill|compétence|مهار/i.test(sec.title);
    if (isSkills && form.skills) {
      const skills = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const labelMaxW = 110;
      const barX = textX + labelMaxW + 12;
      const barAreaW = PAGE_W - 30 - barX;

      for (let j = 0; j < skills.length; j++) {
        ensure(20);
        const skill = skills[j];
        const proportion = Math.max(0.4, 1 - j * 0.07);
        const barLen = barAreaW * proportion;

        // Skill name (right-aligned, dark text)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT);
        doc.text(skill, textX + labelMaxW, yRight + 8, { align: "right" });

        // Bar (navy filled rect)
        doc.setFillColor(...NAVY);
        doc.rect(barX, yRight + 3, barLen, 8, "F");

        yRight += 18;
      }
      yRight += 8;
    } else {
      // Render normal section content
      for (const b of sec.blocks) {
        if (b.type === "list") {
          for (const item of b.items) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(...TEXT);
            const lines = doc.splitTextToSize(
              stripInline(item),
              contentW - 14,
            );
            ensure(lines.length * 13 + 4);
            // Bullet dot
            doc.setFillColor(...NAVY);
            doc.circle(textX + 4, yRight + 4, 1.6, "F");
            for (let k = 0; k < lines.length; k++) {
              doc.text(lines[k], textX + 14, yRight + 7);
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

    // Vertical timeline connecting to next section
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

  doc.save(`${(form.name || "resume").replace(/\s+/g, "_")}_Executive.pdf`);
};

// ────────────────────────────────────────────────────────────────────────────
// Dispatch
// ────────────────────────────────────────────────────────────────────────────

const RENDERERS = {
  modern: renderModern,
  classic: renderClassic,
  creative: renderCreative,
  executive: renderExecutive,
};

export const generateResumePDF = async ({ form, resume }) => {
  const tpl = form?.template || "modern";
  const fn = RENDERERS[tpl] || renderModern;
  const photoCircle = form?.photo ? await cropToCircle(form.photo) : null;
  fn(form, resume, photoCircle);
};

// ────────────────────────────────────────────────────────────────────────────
// Cover letter — keeps a consistent style across templates
// ────────────────────────────────────────────────────────────────────────────

export const generateCoverLetterPDF = ({ form, coverLetter }) => {
  if (!coverLetter) return;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const tpl = form?.template || "modern";

  const palette =
    tpl === "classic"
      ? { accent: [26, 40, 69], font: "times" }
      : tpl === "creative"
        ? { accent: [200, 89, 58], font: "helvetica" }
        : { accent: [0, 217, 111], font: "helvetica" };

  doc.setFont(palette.font, "bold");
  doc.setFontSize(22);
  doc.setTextColor(...palette.accent);
  doc.text("Cover Letter", MARGIN, 60);

  doc.setFont(palette.font, "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 110);
  const meta = [form.name, form.email, form.phone].filter(Boolean).join("  •  ");
  doc.text(meta, MARGIN, 80);

  doc.setDrawColor(...palette.accent);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, 92, PAGE_W - MARGIN, 92);

  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(
    stripInline(coverLetter),
    PAGE_W - MARGIN * 2,
  );
  let y = 120;
  const lineHeight = 15;
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, MARGIN, y);
    y += lineHeight;
  }

  doc.save(
    `${(form.name || "cover_letter").replace(/\s+/g, "_")}_CoverLetter.pdf`,
  );
};
