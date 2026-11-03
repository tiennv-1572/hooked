import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import type { Collaboration } from "@/data/partners-page";

/**
 * "Partners / Collaborations".
 * Desktop (2749:4691): two 656px cards, 32px apart. Mobile (2749:4692): stacked, 40px apart.
 * Tablet: two columns (320px each at 768).
 */
export function Collaborations({ items }: { items: Collaboration[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="collaborations-title">
      <h2 id="collaborations-title" className="sr-only">
        Dự án hợp tác cùng đối tác
      </h2>
      <ul className="grid gap-10 tablet:grid-cols-2 tablet:gap-8">
        {items.map((item) => (
          <li key={item.id}>
            <CollaborationCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Collaboration card (desktop 2749:4693 / 2749:5937, mobile 2749:5948 / 2749:5959): 3:2 project photo,
 * title + orange ↗, partner line. The whole card links to the project detail page.
 * Hover/focus (QA 90 media hover): 1px accent frame + slow zoom on the photo, accent title, arrow nudge.
 */
export function CollaborationCard({ item }: { item: Collaboration }) {
  return (
    <Link href={item.href} className="group flex flex-col gap-4">
      <div className="relative aspect-[3/2] overflow-hidden bg-surface">
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 1440px) 656px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-150 group-hover:border-accent group-focus-visible:border-accent" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl leading-[30px] font-bold text-white transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent desktop:text-2xl desktop:leading-[34px]">
          {item.title}
        </h3>
        <Icon
          name="about-arrow-up-right-brand-24"
          size={24}
          className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
      <p className="text-sm leading-[22px] text-muted">{item.partnerLabel}</p>
    </Link>
  );
}
