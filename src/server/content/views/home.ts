import type { Metadata } from "next";

import type { Photo } from "@/data/home";

import type { HomeDto, ImageDto, SiteDto } from "../dto";
import { toPhoto } from "./photo";

/*
 * Home (/): `getHomePage()` → the props of src/components/home/*. Pages stay thin: query, map here, render.
 */

/**
 * The Home logo marquee draws each logo at 73% of its intrinsic export (Figma Home / Logo marquee:
 * Sun Group 230 × 72 → 168 × 53), capped at the tallest Figma logo so large CMS uploads stay in the strip.
 */
const MARQUEE_SCALE = 0.73;
const MARQUEE_MAX_HEIGHT = 53;

function toMarqueeLogo(logo: ImageDto): Photo {
  const photo = toPhoto(logo, { width: 160, height: MARQUEE_MAX_HEIGHT });
  const scale = Math.min(MARQUEE_SCALE, MARQUEE_MAX_HEIGHT / photo.height);
  return { ...photo, width: Math.round(photo.width * scale), height: Math.round(photo.height * scale) };
}

export function toHomeView(home: HomeDto) {
  return {
    hero: {
      slides: home.hero.slides.map((slide) => ({
        id: slide.id,
        image: toPhoto(slide.image, { width: 1280, height: 720 }),
        youtubeId: slide.youtubeId ?? undefined,
      })),
    },
    intro: { titleLines: home.intro.titleLines, body: home.intro.body },
    highlights: home.highlights.map((item) => ({ ...item, image: toPhoto(item.image) })),
    services: home.services.map((service) => ({
      id: service.id,
      title: service.title,
      titleLines: service.titleLines ?? undefined,
      description: service.description,
      href: service.href,
      image: toPhoto(service.image),
    })),
    blog: {
      posts: home.blogCarousel.items.map((item) => ({
        slug: item.id,
        title: item.title,
        lines: item.lines,
        href: item.href,
        image: toPhoto(item.image),
      })),
      initialIndex: home.blogCarousel.initialIndex,
    },
    partners: {
      titleLines: home.partners.titleLines,
      body: home.partners.body,
      cta: home.partners.cta,
      partners: home.partners.logos.map((partner) => ({ name: partner.name, logo: toMarqueeLogo(partner.logo) })),
    },
  };
}

/** Home has no SEO block of its own: the site's default title and description (CMS `settings`). */
export function toHomeMetadata(site: SiteDto): Metadata {
  return { title: { absolute: site.seo.defaultTitle || site.name }, description: site.description };
}
