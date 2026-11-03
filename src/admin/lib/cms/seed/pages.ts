import { aboutEcosystem, aboutIntro, livePhotos, stagePhotos } from "@/data/about";
import { contactCopy } from "@/data/contact";
import {
  blogInitialIndex,
  blogPreviews,
  heroSlides,
  highlights,
  intro,
  partners as homePartners,
  partnersIntro as homePartnersIntro,
  services,
} from "@/data/home";
import { collaborations as siteCollaborations, partnerLogos, partnersIntro } from "@/data/partners-page";
import { paragraphsToHtml } from "@/lib/html-text";
import { desktopNav, footerCompanyLinks, mobileNav, siteConfig } from "@/lib/site";

import type { AboutPage, ContactPage, HomePage, Navigation, Partner, PartnersPage, SiteSettings } from "../types/pages";
import type { NavItem } from "../types/shared";
import { img, stamp } from "./helpers";

const navItems = (prefix: string, items: { label: string; href: string }[]): NavItem[] =>
  items.map((item, index) => ({ id: `${prefix}-${index + 1}`, label: item.label, href: item.href, visible: true }));

export const settingsSeed: SiteSettings = {
  siteName: siteConfig.name,
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  company: {
    legalName: siteConfig.company.legalName,
    address: siteConfig.company.address,
    email: siteConfig.company.email,
    phoneDisplay: siteConfig.company.phone.display,
    phoneHref: siteConfig.company.phone.href,
  },
  socials: siteConfig.socials.map((social) => ({
    id: social.label.toLowerCase(),
    label: social.label,
    href: social.href,
  })),
  seo: { titleTemplate: `%s · ${siteConfig.name}`, defaultTitle: `${siteConfig.name} — ${siteConfig.tagline}` },
};

export const navigationSeed: Navigation = {
  desktop: navItems("desktop", desktopNav),
  mobile: navItems("mobile", mobileNav),
  footer: navItems("footer", footerCompanyLinks),
};

export const homeSeed: HomePage = {
  hero: { slides: heroSlides.map((slide) => ({ id: slide.id, image: img(slide.image) })) },
  intro: { titleLines: [...intro.titleLines], body: intro.body },
  highlights: highlights.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.href,
    align: item.align,
    image: img(item.image),
  })),
  services: services.map((service) => ({
    id: service.id,
    title: service.title,
    titleLines: service.titleLines ? [...service.titleLines] : undefined,
    description: service.description,
    href: service.id === "academy" ? "/academy" : `/projects?service=${service.id}`,
    image: img(service.image),
  })),
  blogCarousel: {
    initialIndex: blogInitialIndex,
    items: blogPreviews.map((item) => ({
      id: item.slug,
      title: item.title,
      lines: [...item.lines] as [string, string],
      href: item.href,
      image: img(item.image),
    })),
  },
  partners: {
    titleLines: [...homePartnersIntro.titleLines],
    body: homePartnersIntro.body,
    cta: { ...homePartnersIntro.cta },
  },
};

export const aboutPageSeed: AboutPage = {
  intro: {
    title: aboutIntro.title,
    eyebrow: aboutIntro.eyebrow,
    lead: aboutIntro.lead,
    headlineLines: [...aboutIntro.headlineLines] as [string, string],
    body: aboutIntro.body,
    aside: aboutIntro.aside,
  },
  ecosystem: {
    titleLines: [...aboutEcosystem.titleLines],
    statement: aboutEcosystem.statement,
    body: aboutEcosystem.body,
    capabilities: aboutEcosystem.capabilities.map((item, index) => ({
      id: `capability-${index + 1}`,
      lead: item.lead,
      rest: item.rest,
      href: item.href,
    })),
  },
  portfolio: { label: aboutEcosystem.portfolio.label, href: aboutEcosystem.portfolio.href },
  photos: {
    top: Object.values(stagePhotos).map((photo) => img(photo)),
    bottom: Object.values(livePhotos).map((photo) => img(photo)),
  },
};

export const contactPageSeed: ContactPage = {
  eyebrow: contactCopy.eyebrow,
  title: contactCopy.title,
};

export const partnersPageSeed: PartnersPage = {
  title: partnersIntro.title,
  body: paragraphsToHtml([partnersIntro.body]),
  collaborations: siteCollaborations.map((item) => ({
    id: item.id,
    title: item.title,
    partnerLabel: item.partnerLabel,
    href: item.href,
    image: img(item.image),
  })),
};

export const partnerSeed: Partner[] = partnerLogos.map((partner, index) => {
  const id = partner.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return {
    ...stamp(id, 300 - index * 30, 60 - index * 5),
    name: partner.name,
    logo: img(partner.logo),
    showOnHome: homePartners.some((item) => item.name === partner.name),
    showOnPartnersPage: true,
    order: index,
  };
});
