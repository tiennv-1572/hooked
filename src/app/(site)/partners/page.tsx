import type { Metadata } from "next";

import { EditorialPage } from "@/components/about/editorial-page";
import { Collaborations } from "@/components/partners/collaborations";
import { LogoWall } from "@/components/partners/logo-wall";
import { PartnersIntro } from "@/components/partners/partners-intro";
import { getPartnersPage } from "@/server/content/queries";
import { toPartnersMetadata, toPartnersView } from "@/server/content/views/editorial";

export async function generateMetadata(): Promise<Metadata> {
  return toPartnersMetadata(await getPartnersPage());
}

/**
 * Partners — Figma "15 · Partners" (section 2744:4785; desktop 2744:4786, mobile 2744:4836).
 * Content: CMS `partnersPage` copy, partners shown on this page (logo wall) and collaborations.
 * Spacing ("Partners / Content" 2744:4798): 72px top, 80px between blocks, 112px bottom; mobile 40 / 48 / 64.
 */
export default async function PartnersPage() {
  const view = toPartnersView(await getPartnersPage());

  return (
    <EditorialPage className="flex flex-col gap-12 pt-10 pb-16 tablet:gap-16 tablet:pt-14 tablet:pb-24 desktop:gap-20 desktop:pt-18 desktop:pb-28">
      <PartnersIntro {...view.intro} />
      <LogoWall logos={view.logos} />
      <Collaborations items={view.collaborations} />
    </EditorialPage>
  );
}
