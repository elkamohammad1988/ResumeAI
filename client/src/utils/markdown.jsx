import React from "react";

const INLINE_RE = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*/g;

const renderInline = (text, keyPrefix) => {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  let counter = 0;
  let m;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }
    if (m[1] !== undefined) {
      parts.push(
        <strong
          key={`${keyPrefix}-b${counter++}`}
          className="font-semibold text-[#0a0a0a] dark:text-white"
        >
          {m[1]}
        </strong>,
      );
    } else {
      parts.push(
        <em
          key={`${keyPrefix}-i${counter++}`}
          className="italic text-zinc-700 dark:text-zinc-300"
        >
          {m[2]}
        </em>,
      );
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const isWholeLineBold = (line) => /^\*\*([^*]+)\*\*\s*$/.test(line.trim());
const stripWholeBold = (line) =>
  line.trim().replace(/^\*\*([^*]+)\*\*\s*$/, "$1");

const isBullet = (line) => {
  const t = line.trimStart();
  return t.startsWith("- ") || t.startsWith("* ") || /^\d+\.\s/.test(t);
};

const stripBullet = (line) => {
  const t = line.trimStart();
  if (t.startsWith("- ") || t.startsWith("* ")) return t.slice(2);
  return t.replace(/^\d+\.\s+/, "");
};

const headingLevel = (line) => {
  const m = /^(#{1,4})\s+(.*)$/.exec(line.trim());
  return m ? { level: m[1].length, text: m[2] } : null;
};

// Detect if a substantial portion of the text is Arabic
const ARABIC_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const isArabicHeavy = (text) => {
  if (!text) return false;
  const arabicChars = (text.match(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) || []).length;
  const letterChars = (text.match(/[a-zA-Z؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g) || []).length;
  return letterChars > 0 && arabicChars / letterChars > 0.3;
};

export default function MarkdownText({ text, className = "" }) {
  if (!text) return null;
  const rtl = isArabicHeavy(text);
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      blocks.push({ type: "blank", key: `bl-${i}` });
      i++;
      continue;
    }

    const heading = headingLevel(line);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading.level,
        text: heading.text,
        key: `h-${i}`,
      });
      i++;
      continue;
    }

    if (isWholeLineBold(line)) {
      blocks.push({
        type: "heading",
        level: 3,
        text: stripWholeBold(line),
        key: `wb-${i}`,
        accent: true,
      });
      i++;
      continue;
    }

    if (isBullet(line)) {
      const items = [];
      const startIdx = i;
      while (i < lines.length && isBullet(lines[i])) {
        items.push(stripBullet(lines[i]));
        i++;
      }
      blocks.push({ type: "list", items, key: `l-${startIdx}` });
      continue;
    }

    blocks.push({ type: "paragraph", text: line, key: `p-${i}` });
    i++;
  }

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : undefined}
      className={`text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3 ${
        rtl ? "font-[system-ui] [text-align:start]" : ""
      } ${className}`}
      style={
        rtl
          ? {
              fontFamily:
                "'Noto Naskh Arabic','Amiri','Segoe UI',Tahoma,sans-serif",
            }
          : undefined
      }
    >
      {blocks.map((b) => {
        if (b.type === "blank") {
          return <div key={b.key} className="h-1" aria-hidden="true" />;
        }
        if (b.type === "heading") {
          if (b.level === 1) {
            return (
              <h2
                key={b.key}
                className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-white"
              >
                {b.text}
              </h2>
            );
          }
          if (b.level === 2) {
            return (
              <h3
                key={b.key}
                className="mt-4 text-lg font-bold tracking-tight text-[#0a0a0a] dark:text-white pb-1.5 border-b border-zinc-200 dark:border-zinc-800"
              >
                {b.text}
              </h3>
            );
          }
          return (
            <h4
              key={b.key}
              className={`mt-3 text-sm font-bold uppercase tracking-wider ${
                b.accent ? "text-[#00a350] dark:text-[#00d96f]" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {b.text}
            </h4>
          );
        }
        if (b.type === "list") {
          return (
            <ul
              key={b.key}
              className={`space-y-1.5 ${rtl ? "pr-1" : "pl-1"}`}
            >
              {b.items.map((item, idx) => (
                <li
                  key={`${b.key}-${idx}`}
                  className="flex gap-2.5 text-[15px] leading-relaxed"
                >
                  <span
                    className="mt-2 inline-block h-1 w-1 rounded-full bg-[#00d96f] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{renderInline(item, `${b.key}-${idx}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={b.key} className="leading-relaxed">
            {renderInline(b.text, b.key)}
          </p>
        );
      })}
    </div>
  );
}
