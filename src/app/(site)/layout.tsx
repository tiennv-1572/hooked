import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

/** Header navigation, footer links, company details and socials: CMS `settings` + `navigation` (`getSite()`). */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const chrome = toSiteChrome(await getSite());

  return (
    <html lang="vi" className={siteFontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader {...chrome.header} />
        <main className="flex-1">{children}</main>
        <SiteFooter {...chrome.footer} />
      </body>
    </html>
  );
}
