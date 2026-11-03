import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Editorial page shell shared by About, Contact and Partners (plan/02 "Container": content 1344px, 48px margins).
 *
 * - Background = Figma "00 · Page background / Full-bleed footer gradient + grain" (About 2669:4691,
 *   Contact 2750:4691, Partners 2750:5926): ink, then the last 360px above the footer (220px on mobile)
 *   fade into the footer's first gradient stop so the page and `SiteFooter` read as one surface.
 * - Inner column: 24px gutters on mobile, 48px from tablet, capped at 1440 − 2 × 48 = 1344px.
 *
 * Kept local (instead of changing the shared `Container`, which is the 1192px column).
 * Pass spacing for the page's vertical rhythm through `className`.
 */
export function EditorialPage({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div className="grain bg-[linear-gradient(180deg,var(--color-ink)_calc(100%_-_220px),#120603_100%)] desktop:bg-[linear-gradient(180deg,var(--color-ink)_calc(100%_-_360px),#240a05_100%)]">
      <div className={cn("mx-auto w-full max-w-[1440px] px-6 tablet:px-12", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

/**
 * Desktop 4-column editorial grid (Figma "Offset columns · 4-column grid", 2684:4691): 4 × 324px, 16px gaps.
 * Column 1 is the "intentional empty cell"; reading content starts at column 2.
 */
export const editorialGrid = "desktop:grid desktop:grid-cols-4 desktop:gap-x-4";

/** Reading column spanning columns 2–4 (1004px at 1440). */
export const editorialReadingColumn = "desktop:col-span-3 desktop:col-start-2";
