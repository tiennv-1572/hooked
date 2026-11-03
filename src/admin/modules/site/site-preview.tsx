"use client";

import { ExternalLink, Eye } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { cn } from "@/lib/utils";

/*
 * Mini previews that echo the public website: ink background, Manrope ExtraBold uppercase, orange accents.
 * Colours are the site's design tokens (src/app/globals.css) written as literals because the admin theme
 * has its own token names.
 */

export const SITE = {
  ink: "#050101",
  surface: "#1a1a1a",
  warm: "#2a1f19",
  brand: "#e55624",
  accent: "#ff6b00",
  muted: "#cccccc",
  ivory: "#fff4e9",
  coal: "#100c0a",
  copper: "#ff9c50",
  peach: "#fb9a41",
  ember: "#983a0f",
} as const;

/** Card wrapping a preview: "Xem trước" header, optional link to the public page and toolbar. */
export function PreviewCard({
  title = "Xem trước",
  description,
  href,
  toolbar,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  /** Public page ("/", "/about#ecosystem"). */
  href?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-3 overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="text-muted-foreground size-4" />
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {href ? (
          <CardAction>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs font-medium transition-colors"
            >
              Trên website <ExternalLink className="size-3" />
            </a>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {toolbar}
        {children}
      </CardContent>
    </Card>
  );
}

/** Dark website surface. */
export function SiteCanvas({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "font-brand overflow-hidden rounded-lg bg-[#050101] [overflow-wrap:anywhere] text-white antialiased",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/** Hooked logo (white H K D + orange rings). */
export function SiteLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/brand/hooked-logo.png"
      alt="Hooked"
      className={cn("h-auto w-14 select-none", className)}
      draggable={false}
    />
  );
}

/** Home section heading ("HIGHLIGHT" + logo). */
export function SiteHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <p className="text-sm leading-tight font-extrabold uppercase">{children}</p>
      <SiteLogo className="w-12" />
    </div>
  );
}

/** Placeholder text inside a preview. */
export function PreviewEmpty({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("py-6 text-center text-xs text-white/45", className)}>{children}</p>;
}

/** Tiny orange up-right arrow used across the site. */
export function SiteArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-4 shrink-0 text-[#ff6b00]", className)}>
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
