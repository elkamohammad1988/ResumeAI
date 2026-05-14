/**
 * Markdown-ish parser used by all PDF templates.
 * Identical structure to the v1 client parser — kept here in TS so the
 * Next.js bundle doesn't pull from /client.
 */

export type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

export function stripInline(s: string): string {
  return (s || "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<![*\w])\*(?!\s)([^*]+?)\*(?![*\w])/g, "$1");
}

export function parseBlocks(text: string): Block[] {
  const lines = (text || "").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2],
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
      const items: string[] = [];
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
}

/**
 * Skip duplicate header blocks if the AI emitted name+contact at the top
 * (templates already render their own header).
 */
export function stripDuplicateHeader(blocks: Block[], name: string): Block[] {
  let idx = 0;
  if (blocks[idx]?.type === "heading" && name) {
    const blockName = stripInline((blocks[idx] as { text: string }).text).toLowerCase();
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
    /[@•·|]|\+\d|\d{3,}/.test((blocks[idx] as { text: string }).text)
  ) {
    idx++;
  }
  return blocks.slice(idx);
}
