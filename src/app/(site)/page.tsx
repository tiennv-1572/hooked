import type { Metadata } from "next";

import { BlogCarousel } from "@/components/home/blog-carousel";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HighlightsSection } from "@/components/home/highlights-section";
import { IntroSection } from "@/components/home/intro-section";
import { PartnersSection } from "@/components/home/partners-section";
import { ServicesSection } from "@/components/home/services-section";
import { getHomePage, getSite } from "@/server/content/queries";
import { toHomeMetadata, toHomeView } from "@/server/content/views/home";

export async function generateMetadata(): Promise<Metadata> {
  return toHomeMetadata(await getSite());
}

/** Home — Figma "01 · Home" (desktop 141:2, mobile 2818:4694). Content: CMS `home` + partners shown on Home. */
export default async function HomePage() {
  const view = toHomeView(await getHomePage());

  return (
    <>
      <HeroCarousel {...view.hero} />
      <IntroSection {...view.intro} />
      <HighlightsSection items={view.highlights} />

      {/* Desktop: services + blog share one ink → ember → peach atmosphere (Figma 05 · Services "Frame 2"). */}
      <div className="desktop:grain desktop:bg-[linear-gradient(180deg,var(--color-ink)_0%,#98370a_69.231%,var(--color-peach)_100%)]">
        <ServicesSection items={view.services} />
        {view.blog.posts.length > 0 && <BlogCarousel {...view.blog} />}
      </div>

      <PartnersSection {...view.partners} />
    </>
  );
}
