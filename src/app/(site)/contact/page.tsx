import type { Metadata } from "next";

import { EditorialPage } from "@/components/about/editorial-page";
import { ContactDetails } from "@/components/contact/contact-details";
import { ContactHero } from "@/components/contact/contact-hero";
import { getContactPage } from "@/server/content/queries";
import { toContactMetadata, toContactView } from "@/server/content/views/editorial";

export async function generateMetadata(): Promise<Metadata> {
  return toContactMetadata(await getContactPage());
}

/**
 * Contact — Figma "14 · Contact" (section 2744:4687; desktop 2744:4688, mobile 2744:4738).
 * Information only — the design has no contact form (plan/06 #11). Copy from CMS `contactPage`; email, phone,
 * address and socials from `settings` (the footer shows the same values).
 * Spacing ("Contact / Content" 2744:4700): 72px top, 80px between blocks, 112px bottom; mobile 40 / 48 / 64.
 */
export default async function ContactPage() {
  const view = toContactView(await getContactPage());

  return (
    <EditorialPage className="flex flex-col gap-12 pt-10 pb-16 tablet:gap-16 tablet:pt-14 tablet:pb-24 desktop:gap-20 desktop:pt-18 desktop:pb-28">
      <ContactHero {...view.hero} />
      <ContactDetails {...view.details} />
    </EditorialPage>
  );
}
