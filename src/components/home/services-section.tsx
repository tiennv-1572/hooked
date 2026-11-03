"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Service } from "@/data/home";
import { cn } from "@/lib/utils";

/** `href`: where the card leads (CMS; Academy → /academy, the others → /projects?service=…). */
export type ServiceItem = Service & { href: string };

/**
 * OUR SERVICE — horizontally draggable strip with a visible next-card edge.
 * Desktop (Our Service / Drag horizontally, 2485:4072): 364×467 panels, first panel in brand orange,
 * the hovered panel takes the orange while the strip is hovered.
 * Mobile (Home / Services, 2826:5038): 304px cards, photo 196px, Manrope copy.
 */
export function ServicesSection({ items }: { items: ServiceItem[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" });

  return (
    <section aria-labelledby="service-title" className="py-10 desktop:py-15">
      <Container>
        <SectionHeading id="service-title">OUR SERVICE</SectionHeading>
      </Container>
      <div className="mt-6 pl-6 tablet:pl-12 desktop:mt-10 desktop:pl-[max(24px,calc((100%-1192px)/2))]">
        {/* Mobile frame keeps a 430px scroll viewport (Services / Horizontal scroll viewport). */}
        <div ref={emblaRef} className="relative overflow-hidden max-tablet:min-h-[430px]">
          <ul className="group/track flex touch-pan-y gap-4 desktop:gap-6">
            {items.map((service, index) => (
              <li key={service.id} className="min-w-0 shrink-0">
                <ServiceCard service={service} featured={index === 0} />
              </li>
            ))}
            <li aria-hidden className="w-2 shrink-0 tablet:w-8 desktop:w-[100px]" />
          </ul>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, featured }: { service: ServiceItem; featured: boolean }) {
  return (
    <Link
      href={service.href}
      draggable={false}
      className={cn(
        "flex w-[304px] flex-col gap-4 tablet:w-[340px]",
        "desktop:h-[467px] desktop:w-[364px] desktop:gap-0 desktop:overflow-hidden desktop:rounded-[15px] desktop:p-2.5",
        "desktop:transition-colors desktop:duration-200 desktop:hover:bg-brand! desktop:hover:text-white!",
        featured
          ? "desktop:bg-brand desktop:text-white desktop:group-hover/track:bg-warm desktop:group-hover/track:text-brand"
          : "desktop:bg-warm desktop:text-brand",
      )}
    >
      <div className="relative h-[196px] shrink-0 overflow-hidden tablet:h-[220px] desktop:h-80 desktop:rounded-[11px]">
        <Image
          src={service.image.src}
          alt={service.image.alt}
          fill
          sizes="(min-width: 1200px) 344px, 340px"
          className="object-cover select-none"
          draggable={false}
        />
      </div>
      <div className="flex flex-col gap-4 desktop:items-center desktop:gap-2 desktop:px-[22px] desktop:py-2.5 desktop:text-center">
        <h3 className="text-2xl leading-9 font-extrabold text-white desktop:font-inter desktop:text-xl desktop:leading-[normal] desktop:font-bold desktop:text-inherit desktop:uppercase">
          {service.titleLines
            ? service.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            : service.title}
        </h3>
        <p className="text-sm leading-[21px] text-muted desktop:font-inter desktop:text-xs desktop:leading-[normal] desktop:text-inherit">
          {service.description}
        </p>
      </div>
    </Link>
  );
}
