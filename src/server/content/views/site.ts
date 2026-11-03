import type { Metadata } from "next";

import type { SiteFooterProps } from "@/components/layout/site-footer";
import type { SiteHeaderProps } from "@/components/layout/site-header";

import type { SiteDto } from "../dto";
import { toPhoto } from "./photo";

/*
 * Site chrome (header, footer) and root metadata: `getSite()` → the props of src/components/layout/* and the
 * site layout's `generateMetadata`. Navigation arrives already filtered to visible items.
 */

/** Absolute site origin (metadataBase, sitemap, robots). Set NEXT_PUBLIC_SITE_URL in production. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function toSiteChrome(site: SiteDto): { header: SiteHeaderProps; footer: SiteFooterProps } {
  return {
    header: { desktop: site.navigation.desktop, mobile: site.navigation.mobile },
    footer: { company: site.company, socials: site.socials, links: site.navigation.footer },
  };
}

/** Root metadata from `settings.seo`. A template without `%s` would drop page titles, so it falls back to "%s · name". */
export function toSiteMetadata(site: SiteDto): Metadata {
  const { titleTemplate, defaultTitle, ogImage } = site.seo;
  const image = ogImage ? toPhoto(ogImage, { width: 1200, height: 630 }) : null;
  return {
    // Absolute base for Open Graph images and canonical URLs.
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle || site.name,
      template: titleTemplate.includes("%s") ? titleTemplate : `%s · ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: site.name,
      ...(image
        ? { images: [{ url: image.src, width: image.width, height: image.height, alt: image.alt || site.name }] }
        : {}),
    },
  };
}
