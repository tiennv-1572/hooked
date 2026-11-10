import Image from "next/image";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { Marquee } from "@/components/ui/marquee";
import type { Partner } from "@/data/home";

type PartnersSectionProps = {
  titleLines: string[];
  body: string;
  cta: { label: string; href: string };
  partners: Partner[];
};

/**
 * Brand partners statement + logo marquee.
 * Desktop (06 · Partners, 142:110): title | copy on one row, full-bleed logo marquee with edge fade.
 * Mobile (Home / Partners, 2826:5125): stacked copy, contained marquee, "Đối tác của Hooked" pill.
 */
export function PartnersSection({ titleLines, body, cta, partners }: PartnersSectionProps) {
  return (
    <section
      data-reveal="stagger"
      aria-labelledby="partners-title"
      className="bg-[linear-gradient(180deg,var(--color-ink)_0%,var(--color-ink)_55.7%,#0d0402_93.25%,#120603_100%)] py-10 tablet:py-15 desktop:bg-[linear-gradient(180deg,var(--color-surface)_0%,var(--color-surface)_36.3%,#0d0402_72.4%,#240a05_100%)] desktop:pt-[162px] desktop:pb-[51px]"
    >
      <Container
        data-reveal="stagger"
        className="grid gap-6 tablet:grid-cols-2 tablet:items-center tablet:gap-12 desktop:grid-cols-[610px_368px] desktop:justify-between"
      >
        <h2
          id="partners-title"
          className="text-[28px] leading-[31px] font-extrabold text-white uppercase desktop:text-5xl desktop:leading-[66px]"
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        <p className="text-sm leading-[21px] text-muted desktop:leading-[19px] desktop:text-white">{body}</p>
      </Container>

      <Container className="mt-6 tablet:mt-10 desktop:mt-[105px] desktop:max-w-none desktop:px-0">
        <Marquee fade duration={15} gap={58} label="Đối tác của Hooked">
          {partners.map((partner) => (
            <Image
              key={partner.name}
              src={partner.logo.src}
              alt={partner.logo.alt}
              width={partner.logo.width}
              height={partner.logo.height}
              style={{ width: partner.logo.width, height: partner.logo.height }}
              className="shrink-0 object-contain select-none"
              draggable={false}
            />
          ))}
        </Marquee>
      </Container>

      <Container className="mt-6 desktop:hidden">
        <ButtonLink href={cta.href} variant="coal" className="w-full tablet:w-[342px]">
          {cta.label}
          <Icon name="arrow-up-right-accent-20" />
        </ButtonLink>
      </Container>
    </section>
  );
}
