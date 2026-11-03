import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Page gutter: 24px mobile, 48px tablet, centered 1192px column on desktop
 * (1440 − 2 × 124 = 1192, matching every desktop Figma frame).
 */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-6 tablet:px-12 desktop:px-6", className)} {...props} />;
}
