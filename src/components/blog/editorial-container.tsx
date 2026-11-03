import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Editorial grid used by the Blog (and About / Contact / Partners) frames: 1344px content with 48px
 * margins at 1440 (Figma "Article / …" 2711:4702 sits at x=48, w=1344). 24px gutter on mobile.
 * Kept local to the blog feature; the shared `Container` is the 1192px Academy/Projects column.
 */
export function EditorialContainer({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-6 tablet:px-12", className)} {...props} />;
}
