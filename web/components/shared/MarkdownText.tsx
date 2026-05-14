import React from "react";
import { cn } from "@/lib/utils";

const INLINE_RE = /\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*/g;

// >30% Arabic chars → render RTL
const ARABIC_GLYPHS = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const ARABIC_OR_LATIN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿a-zA-Z]/g;

function isArabicHeavy(text: string): boolean {
  if (!text) return false;
  const arabic = (text.match(ARABIC_GLYPHS) || []).length;
  const letters = (text.match(ARABIC_OR_LATIN) || []).length;
  return letters > 0 && arabic / letters > 0.3;
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let counter = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    if (m[1] !== undefined) {
      parts.push(
        <strong
          key={`${keyPrefix}-b${counter++}`}
          className="font-semibold text-zinc-900 dark:text-white"
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
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

type Block =
  | { type: "blank"; key: string }
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string; accent?: boolean; key: string }
  | { type: "list"; items: string[]; key: string }
  | { type: "paragraph"; text: string; key: string };

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      blocks.push({ type: "blank", key: `bl-${i}` });
      i++;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2],
        key: `h-${i}`,
      });
      i++;
      continue;
    }
    const wholeBold = /^\*\*([^*]+)\*\*\s*$/.exec(trimmed);
    if (wholeBold) {
      blocks.push({
        type: "heading",
        level: 3,
        text: wholeBold[1],
        accent: true,
        key: `wb-${i}`,
      });
      i++;
      continue;
    }
    if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      const start = i;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^[-*]\s/.test(t)) items.push(t.slice(2));
        else if (/^\d+\.\s/.test(t)) items.push(t.replace(/^\d+\.\s+/, ""));
        else break;
        i++;
      }
      blocks.push({ type: "list", items, key: `l-${start}` });
      continue;
    }
    blocks.push({ type: "paragraph", text: line, key: `p-${i}` });
    i++;
  }
  return blocks;
}

export default function MarkdownText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;
  const rtl = isArabicHeavy(text);
  const blocks = parseBlocks(text);

  return (
    <div
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : undefined}
      className={cn(
        "text-[15px] text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3",
        rtl && "[text-align:start]",
        className,
      )}
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
        if (b.type === "blank")
          return <div key={b.key} className="h-1" aria-hidden="true" />;
        if (b.type === "heading") {
          if (b.level === 1) {
            return (
              <h2
                key={b.key}
                className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white"
              >
                {b.text}
              </h2>
            );
          }
          if (b.level === 2) {
            return (
              <h3
                key={b.key}
                className="mt-4 text-lg font-bold tracking-tight text-zinc-900 dark:text-white pb-1.5 border-b border-zinc-200 dark:border-zinc-800"
              >
                {b.text}
              </h3>
            );
          }
          return (
            <h4
              key={b.key}
              className={cn(
                "mt-3 text-sm font-bold uppercase tracking-wider",
                b.accent
                  ? "text-accent-deep dark:text-accent"
                  : "text-zinc-700 dark:text-zinc-300",
              )}
            >
              {b.text}
            </h4>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={b.key} className={cn("space-y-1.5", rtl ? "pr-1" : "pl-1")}>
              {b.items.map((item, idx) => (
                <li
                  key={`${b.key}-${idx}`}
                  className="flex gap-2.5 text-[15px] leading-relaxed"
                >
                  <span
                    className="mt-2 inline-block h-1 w-1 rounded-full bg-accent shrink-0"
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
