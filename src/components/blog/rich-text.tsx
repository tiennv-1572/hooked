import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import type { Inline } from "@/data/blog";

const isExternal = (href: string) => /^https?:/.test(href);

/** Inline mention link inside article copy: white text, thin brand underline, accent on hover. */
function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  const className =
    "underline decoration-brand decoration-1 underline-offset-[5px] transition-colors duration-150 hover:text-accent hover:decoration-accent";
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/**
 * Renders a run of article text: plain strings, bold lead-ins ("**Điểm chạm Nghệ thuật:** …",
 * Figma 2714:4710) and inline links to projects / academy / partners.
 */
export function RichText({ content }: { content: Inline[] }) {
  return content.map((run, index) => {
    if (typeof run === "string") return <Fragment key={index}>{run}</Fragment>;
    let node: ReactNode = run.text;
    if (run.href) node = <InlineLink href={run.href}>{node}</InlineLink>;
    if (run.bold) node = <strong className="font-bold">{node}</strong>;
    return <Fragment key={index}>{node}</Fragment>;
  });
}
