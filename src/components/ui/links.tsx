import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type LinkProps = Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode };

function isExternal(href: LinkProps["href"]) {
  return typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href);
}

/** Accent text link with a ↗ arrow (Figma "CMS / Tìm hiểu…", "Xem full portfolio ↗"). */
export function ArrowLink({ className, children, href, ...props }: LinkProps) {
  const external = isExternal(href) && typeof href === "string" && href.startsWith("http");
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "group inline-flex items-center gap-2 font-semibold text-accent transition-colors duration-150 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden
        className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        <path d="M1.5 12.5l11-11M12.5 12.5v-11h-11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </Link>
  );
}

/** "← Tất cả dự án" / "← Blogpost" (QA 91: muted default, accent on hover). */
export function BackLink({ className, children, ...props }: LinkProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-2.5 text-base leading-[21px] font-semibold text-muted transition-colors duration-150 hover:text-accent",
        className,
      )}
      {...props}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className="transition-transform duration-150 group-hover:-translate-x-0.5"
      >
        <path
          d="M16.25 10H3.75M8.75 5l-5 5 5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}

/** Small uppercase section label ("ABOUT HOOKED", "CONTACT HOOKED", "PARTNERS"…). */
export function Eyebrow({
  className,
  tone = "accent",
  ...props
}: ComponentProps<"p"> & { tone?: "accent" | "peach" | "muted" | "white" }) {
  return (
    <p
      className={cn(
        "text-sm leading-5 font-bold tracking-[0.04em] uppercase",
        tone === "accent" && "text-accent",
        tone === "peach" && "text-peach",
        tone === "muted" && "text-muted",
        tone === "white" && "text-white",
        className,
      )}
      {...props}
    />
  );
}

export type Crumb = { label: string; href?: string };

/** Breadcrumbs ("Academy / Student Stories"). The last item is the current page. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-2 text-sm leading-5 text-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-white" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden>/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
