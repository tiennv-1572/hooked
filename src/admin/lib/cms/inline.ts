/**
 * Inline markdown subset used by CMS text fields (blog list items; paragraphs and intros were migrated to HTML):
 *   **bold**            → { text, bold: true }
 *   [label](/href)      → { text, href }
 * Kept deliberately tiny so editors only need two rules; mirrors the site's `Inline` type in src/data/blog.ts.
 */

export type InlinePart = string | { text: string; bold?: boolean; href?: string };

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseInline(source: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of source.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(source.slice(last, index));
    if (match[1] !== undefined) parts.push({ text: match[1], bold: true });
    else parts.push({ text: match[2], href: match[3] });
    last = index + match[0].length;
  }
  if (last < source.length) parts.push(source.slice(last));
  return parts;
}

export function serializeInline(parts: InlinePart[]): string {
  return parts
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.href) return `[${part.text}](${part.href})`;
      if (part.bold) return `**${part.text}**`;
      return part.text;
    })
    .join("");
}

/** Plain text (for previews, excerpts, search). */
export function stripInline(source: string): string {
  return source.replace(TOKEN, (_, bold: string | undefined, label: string | undefined) => bold ?? label ?? "");
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Inline runs → HTML (`<strong>`, `<a href>`), the markup of the rich-text editor. */
export function inlineToHtml(parts: InlinePart[]): string {
  return parts
    .map((part) => {
      if (typeof part === "string") return escapeHtml(part);
      if (part.href) return `<a href="${escapeHtml(part.href)}">${escapeHtml(part.text)}</a>`;
      return part.bold ? `<strong>${escapeHtml(part.text)}</strong>` : escapeHtml(part.text);
    })
    .join("");
}

/** Inline-markdown text → HTML paragraphs: a blank line starts a new `<p>`, a single line break becomes `<br>`. */
export function inlineMarkdownToHtml(source: string): string {
  return source
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p>${paragraph
          .split("\n")
          .map((line) => inlineToHtml(parseInline(line)))
          .join("<br>")}</p>`,
    )
    .join("");
}
