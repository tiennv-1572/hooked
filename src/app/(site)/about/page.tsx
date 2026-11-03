import type { Metadata } from "next";

import { AboutIntro } from "@/components/about/about-intro";
import { LivePhotos, StagePhotos } from "@/components/about/about-photography";
import { EcosystemSection } from "@/components/about/ecosystem-section";
import { EditorialPage } from "@/components/about/editorial-page";
import { getAboutPage } from "@/server/content/queries";
import { toAboutMetadata, toAboutView } from "@/server/content/views/editorial";

export async function generateMetadata(): Promise<Metadata> {
  return toAboutMetadata(await getAboutPage());
}

/**
 * About — Figma "10 · About" (section 2644:7318; desktop 2553:3834, mobile 2553:3838).
 * Composition "About / Aino / New page composition" (2683:4689): 72px top, 112px between blocks on desktop;
 * 40px top / 56px gaps / 64px bottom on mobile. Content: CMS `aboutPage` (`photos.top` / `photos.bottom` fill the two photo sections).
 */
export default async function AboutPage() {
  const view = toAboutView(await getAboutPage());

  return (
    <EditorialPage className="flex flex-col gap-14 pt-10 pb-16 tablet:gap-20 tablet:pt-14 tablet:pb-24 desktop:gap-28 desktop:pt-18 desktop:pb-28">
      <AboutIntro {...view.intro} />
      <StagePhotos photos={view.stagePhotos} />
      <EcosystemSection {...view.ecosystem} />
      <LivePhotos photos={view.livePhotos} />
    </EditorialPage>
  );
}
