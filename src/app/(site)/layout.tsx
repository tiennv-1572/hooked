import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/layout/scroll-reveal";
import { SiteHeader } from "@/components/layout/site-header";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { siteFontVariables } from "@/lib/fonts";
import { getSite } from "@/server/content/queries";
import { toSiteChrome, toSiteMetadata } from "@/server/content/views/site";

import "../globals.css";

/** Title template, default title, description and Open Graph image come from the CMS `settings.seo`. */
export async function generateMetadata(): Promise<Metadata> {
  return toSiteMetadata(await getSite());
}

export const viewport: Viewport = {
  themeColor: "#050101",
};

/**
 * Runs while the HTML is parsed, before the first paint: lets globals.css hide what the reveals will animate
 * (ScrollReveal removes the class); a 4s fallback shows everything if the app never starts.
 */
const REVEAL_PENDING = `(function(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var r=document.documentElement;r.classList.add("reveal-pending");setTimeout(function(){r.classList.remove("reveal-pending")},4000)})()`;

/** Header navigation, footer links, company details and socials: CMS `settings` + `navigation` (`getSite()`). */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const chrome = toSiteChrome(await getSite());

  return (
    // The REVEAL_PENDING script adds a class to <html> before hydration (and Lenis adds its own later): only <html>'s
    // own attributes are exempt from the hydration check, not its children.
    <html lang="vi" className={siteFontVariables} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <script dangerouslySetInnerHTML={{ __html: REVEAL_PENDING }} />
        <SiteHeader {...chrome.header} />
        <main className="flex-1">{children}</main>
        <SiteFooter {...chrome.footer} />
        <SmoothScroll />
        {/* usePathname suspends on routes with dynamic params (cacheComponents). */}
        <Suspense fallback={null}>
          <ScrollReveal />
        </Suspense>
      </body>
    </html>
  );
}
