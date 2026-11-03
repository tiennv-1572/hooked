import type { ReactNode } from "react";

import { HookedLogo } from "@/components/brand/hooked-logo";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  children: ReactNode;
  id?: string;
  className?: string;
  /** Desktop headings carry the Hooked logo on the right ("HIGHLIGHT", "OUR SERVICE"). */
  withLogo?: boolean;
};

/**
 * Home section heading. Mobile/tablet: Manrope ExtraBold 28/31. Desktop: Inter Bold 36 (as in the
 * canonical desktop frame) with the logo pinned right.
 */
export function SectionHeading({ children, id, className, withLogo = true }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h2
        id={id}
        className="text-[28px] leading-[31px] font-extrabold uppercase desktop:font-inter desktop:text-4xl desktop:leading-[44px] desktop:font-bold"
      >
        {children}
      </h2>
      {withLogo ? <HookedLogo className="hidden desktop:block" /> : null}
    </div>
  );
}
