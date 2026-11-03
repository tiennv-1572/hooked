import Link from "next/link";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type ArticleCtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * Orange CMS link with ↗ (Figma "CMS / Tìm hiểu các khóa học tại Hooked →" 2712:4712, mobile 2713:4710).
 * Mobile: full-width row, label left and arrow pinned right (16/26). Tablet+: hugs its label (18/28).
 * External links (YouTube recaps) open in a new tab. Hover: accent + underline, arrow nudges up-right.
 */
export function ArticleCta({ href, children, className }: ArticleCtaProps) {
  const external = /^https?:/.test(href);
  const classes = cn(
    "group flex w-full items-center justify-between gap-3 p-2 text-left text-base leading-[26px] font-bold text-brand transition-colors duration-150 hover:text-accent tablet:w-fit tablet:justify-start tablet:text-lg tablet:leading-7",
    className,
  );
  const content = (
    <>
      <span className="decoration-1 underline-offset-4 group-hover:underline">{children}</span>
      <Icon
        name="blog-arrow-up-right"
        size={20}
        className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {external ? <span className="sr-only">(mở trong tab mới)</span> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
