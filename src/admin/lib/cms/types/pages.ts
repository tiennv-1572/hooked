import type { Entity, ID, ImageRef, LinkRef, NavItem } from "./shared";

/** Site-wide settings, navigation, Home and the editorial pages (About, Contact, Partners). */

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  company: {
    legalName: string;
    address: string;
    email: string;
    phoneDisplay: string;
    /** tel: link ("tel:+84966609807"). */
    phoneHref: string;
  };
  socials: { id: ID; label: string; href: string }[];
  seo: { titleTemplate: string; defaultTitle: string; ogImage?: ImageRef };
};

export type Navigation = {
  /** Desktop header (≥1200px). */
  desktop: NavItem[];
  /** Mobile overlay menu. */
  mobile: NavItem[];
  /** Footer "Company" column. */
  footer: NavItem[];
};

/**
 * Hero slide: a photo, or a YouTube video (`youtubeId`) that plays muted on a loop over `image` (its poster).
 * The marquee text and timing are fixed by the design (5 s per photo, 15 s per video).
 */
export type HomeSlide = { id: ID; image: ImageRef; youtubeId?: string };
export type HomeHighlight = { id: ID; title: string; href: string; align: "start" | "end"; image: ImageRef };
export type HomeService = {
  id: ID;
  title: string;
  /** Desktop line breaks ("ARTISTS MANAGEMENT" / "& BOOKING"). */
  titleLines?: string[];
  description: string;
  href: string;
  image: ImageRef;
};
export type HomeBlogItem = { id: ID; title: string; lines: [string, string]; href: string; image: ImageRef };

export type HomePage = {
  hero: { slides: HomeSlide[] };
  intro: { titleLines: string[]; body: string };
  highlights: HomeHighlight[];
  services: HomeService[];
  blogCarousel: { initialIndex: number; items: HomeBlogItem[] };
  partners: { titleLines: string[]; body: string; cta: LinkRef };
};

export type AboutCapability = { id: ID; lead: string; rest: string; href?: string };

export type AboutPage = {
  intro: {
    title: string;
    eyebrow: string;
    lead: string;
    headlineLines: [string, string];
    body: string;
    /** Muted paragraph beside the narrative ("Bất cứ nơi nào có âm nhạc chất lượng…"). */
    aside?: string;
  };
  ecosystem: { titleLines: string[]; statement: string; body: string; capabilities: AboutCapability[] };
  portfolio: LinkRef;
  /** The two photo blocks, 4 photos each in slot order: `top` after the intro, `bottom` after the ecosystem. */
  photos: { top: ImageRef[]; bottom: ImageRef[] };
};

/** Contact page copy; the column labels are fixed on the site (`contactCopy.labels`). */
export type ContactPage = {
  eyebrow: string;
  title: string;
};

/** A collaboration card of /partners ("Dự án hợp tác"), managed on the Partners page itself. */
export type PartnerCollaboration = {
  id: ID;
  title: string;
  /** "Golden Sky Media · Sun Group". */
  partnerLabel: string;
  href: string;
  image: ImageRef;
};

/** Partners page; the "PARTNERS" label is fixed on the site (`partnersIntro.eyebrow`). */
export type PartnersPage = {
  title: string;
  /** Introduction, rich-text HTML (sanitized again on the server). */
  body: string;
  collaborations: PartnerCollaboration[];
};

export type Partner = Entity & {
  name: string;
  logo: ImageRef;
  website?: string;
  /** Home logo marquee. */
  showOnHome: boolean;
  /** /partners logo wall. */
  showOnPartnersPage: boolean;
  order: number;
};
