import Image from "next/image";
import Link from "next/link";

import { HookedVector } from "@/components/brand/hooked-logo";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Highlight } from "@/data/home";
import { cn } from "@/lib/utils";

/** CMS highlights carry free-form ids. */
type HighlightItem = Omit<Highlight, "id"> & { id: string };

/**
 * HIGHLIGHT — entry cards to Academy and Projects.
 * Desktop (04 · Highlight, 147:84): two 379px photo cards with Hooked vector, 52px title and turn-arrow tile.
 * Mobile (Home / Highlight branches, 2824:5042): stacked photo + label rows; two columns from tablet.
 */
export function HighlightsSection({ items }: { items: HighlightItem[] }) {
  return (
    <section aria-labelledby="highlight-title" className="bg-ink pb-10 desktop:pb-[51px]">
      <Container className="flex flex-col gap-6 desktop:gap-10">
        <SectionHeading id="highlight-title">HIGHLIGHT</SectionHeading>
        <div className="grid gap-6 tablet:grid-cols-2">
          {items.map((item) => (
            <HighlightCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function HighlightCard({ item }: { item: HighlightItem }) {
  const end = item.align === "end";
  return (
    <Link
      href={item.href}
      className="group flex flex-col gap-3 desktop:relative desktop:h-[379px] desktop:overflow-hidden desktop:bg-card"
    >
      <div className="relative aspect-[342/222] overflow-hidden rounded-[4px] desktop:absolute desktop:inset-0 desktop:aspect-auto desktop:rounded-none">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 1200px) 584px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        {/* Media hover: 1px accent frame (QA 90 · Project media hover) */}
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-150 group-hover:border-accent" />
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-4",
          "desktop:absolute desktop:inset-0 desktop:flex-col desktop:justify-end desktop:gap-0 desktop:p-6",
          end ? "desktop:items-end desktop:text-right" : "desktop:items-start",
        )}
      >
        <HookedVector className="hidden desktop:block" />
        <span className="text-2xl leading-9 font-extrabold text-white transition-colors duration-150 group-hover:text-accent desktop:mt-1.5 desktop:text-[52px] desktop:leading-[1.1] desktop:group-hover:text-white">
          {item.title}
        </span>
        <Icon name="arrow-up-right-accent-24" className="desktop:hidden" />
        <Icon
          name={end ? "turn-left-tile" : "turn-right-tile"}
          className="hidden transition-transform duration-150 group-hover:scale-110 desktop:mt-2.5 desktop:block"
        />
      </div>
    </Link>
  );
}
