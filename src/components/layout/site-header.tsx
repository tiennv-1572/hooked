import { Suspense } from "react";

import { DesktopNav, DesktopNavFallback } from "@/components/layout/desktop-nav";
import { MobileHeader, MobileHeaderFallback } from "@/components/layout/mobile-header";
import type { NavItem } from "@/lib/site";

export type SiteHeaderProps = {
  /** Visible CMS menu items, desktop bar order. */
  desktop: NavItem[];
  /** Visible CMS menu items, mobile overlay order. */
  mobile: NavItem[];
};

/**
 * Shared site header.
 * - ≥ 1200px: desktop bar — 80px on every page; inner pages highlight the active section (see DesktopNav).
 * - < 1200px: 72px bar with current page label + hamburger (Figma Website / Navigation / Mobile, 2815:4703).
 */
export function SiteHeader({ desktop, mobile }: SiteHeaderProps) {
  return (
    <header className="relative z-40">
      <div className="hidden desktop:block">
        <Suspense fallback={<DesktopNavFallback items={desktop} />}>
          <DesktopNav items={desktop} />
        </Suspense>
      </div>
      <div className="desktop:hidden">
        <Suspense fallback={<MobileHeaderFallback />}>
          <MobileHeader items={mobile} />
        </Suspense>
      </div>
    </header>
  );
}
