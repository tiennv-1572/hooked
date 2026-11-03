import { cn } from "@/lib/utils";

/**
 * CMS rich text (student stories, project descriptions): HTML already sanitized on the server (`sanitizeRichText`)
 * — paragraphs, bold / italic / underline, links, lists and quotes. Type size and paragraph spacing come from
 * `className` (a flex column with `gap-*`).
 */
export function RichHtml({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col",
        "[&_b]:font-bold [&_em]:italic [&_i]:italic [&_strong]:font-bold [&_u]:underline [&_u]:underline-offset-4",
        "[&_a]:underline [&_a]:decoration-brand [&_a]:decoration-1 [&_a]:underline-offset-[5px] [&_a]:transition-colors [&_a:hover]:text-accent [&_a:hover]:decoration-accent",
        "[&_li+li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
