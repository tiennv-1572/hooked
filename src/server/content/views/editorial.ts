import type { Metadata } from "next";

import type { AboutPage } from "@/admin/lib/cms/types/pages";
import type { LivePhotoSet, StagePhotoSet } from "@/components/about/about-photography";

import { contactCopy } from "@/data/contact";
import { partnersIntro } from "@/data/partners-page";
import { htmlToText } from "@/lib/html-text";

import type { getContactPage, getPartnersPage } from "../queries";
import { toPhoto } from "./photo";

/*
 * Editorial pages: About (/about), Contact (/contact) and Partners (/partners). CMS page singletons (+ settings,
 * partners, collaborations) → the props of src/components/{about,contact,partners}/*. Pages stay thin.
 * None of these singletons has an SEO block: titles are the route names, descriptions come from the copy.
 */

type ContactPageData = Awaited<ReturnType<typeof getContactPage>>;
type PartnersPageData = Awaited<ReturnType<typeof getPartnersPage>>;

// ---------------------------------------------------------------------------------------------------------
// About

/** Slots of the two photo blocks, in the order of `aboutPage.photos.top` / `.bottom`; an empty slot is skipped. */
const STAGE_SLOTS = ["fullStage", "artists", "localDj", "frequencyDj"] as const;
const LIVE_SLOTS = ["djPerformance", "firePerformance", "performance", "audience"] as const;

function toSlots<Slot extends string>(slots: readonly Slot[], photos: AboutPage["photos"]["top"] = []) {
  const set: Partial<Record<Slot, ReturnType<typeof toPhoto>>> = {};
  slots.forEach((slot, index) => {
    const image = photos[index];
    if (image?.url) set[slot] = toPhoto(image);
  });
  return set;
}

export function toAboutView(page: AboutPage) {
  return {
    intro: { ...page.intro, aside: page.intro.aside || undefined },
    stagePhotos: toSlots(STAGE_SLOTS, page.photos?.top) satisfies StagePhotoSet,
    ecosystem: {
      ...page.ecosystem,
      capabilities: page.ecosystem.capabilities.map((item) => ({ ...item, href: item.href || undefined })),
      portfolio: page.portfolio?.label && page.portfolio.href ? page.portfolio : null,
    },
    livePhotos: toSlots(LIVE_SLOTS, page.photos?.bottom) satisfies LivePhotoSet,
  };
}

export function toAboutMetadata(page: AboutPage): Metadata {
  return { title: "About", description: page.intro.lead };
}

// ---------------------------------------------------------------------------------------------------------
// Contact

/** Copy from `contactPage` (column labels fixed); email, phone, address and socials from `settings` (shared with the footer). */
export function toContactView(page: ContactPageData) {
  const { contact } = page;
  return {
    hero: { eyebrow: page.eyebrow, title: page.title, email: contact.email },
    details: {
      labels: contactCopy.labels,
      phone: contact.phone,
      companyName: contact.legalName,
      address: contact.address,
      socials: contact.socials,
    },
  };
}

export function toContactMetadata({ contact }: ContactPageData): Metadata {
  return {
    title: "Contact",
    description: `Liên hệ Hooked Entertainment: ${contact.email} · ${contact.phone.display}.`,
  };
}

// ---------------------------------------------------------------------------------------------------------
// Partners

/** Partners logo marquee: logos at their export size (Figma slots are 72px tall), large CMS uploads capped to fit. */
const LOGO_MAX_HEIGHT = 72;

function toPartnerLogo(logo: Parameters<typeof toPhoto>[0]) {
  const photo = toPhoto(logo, { width: 220, height: LOGO_MAX_HEIGHT });
  const scale = Math.min(1, LOGO_MAX_HEIGHT / photo.height);
  return { ...photo, width: Math.round(photo.width * scale), height: Math.round(photo.height * scale) };
}

export function toPartnersView(page: PartnersPageData) {
  return {
    intro: { eyebrow: partnersIntro.eyebrow, title: page.title, body: page.body },
    logos: page.logos.map((partner) => ({ name: partner.name, logo: toPartnerLogo(partner.logo) })),
    collaborations: page.collaborations.map((item) => ({
      id: item.id,
      title: item.title,
      partnerLabel: item.partnerLabel,
      href: item.href,
      image: toPhoto(item.image),
    })),
  };
}

export function toPartnersMetadata(page: PartnersPageData): Metadata {
  return { title: "Partners", description: htmlToText(page.body) };
}
