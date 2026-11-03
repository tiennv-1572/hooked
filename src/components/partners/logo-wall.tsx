import Image from "next/image";

import type { PartnerLogo } from "@/data/partners-page";

/**
 * "Partners / Logo wall · Mother Design reference".
 * Desktop (2747:4691): one row of four 220 × 72px logo slots, 40px side padding, spread edge to edge (128px gaps).
 * Mobile (2747:5930): 2 × 2 grid of 155 × 64px slots, 32px gaps. Tablet: one row of four.
 * Logos are static (no hover state or outbound link in Figma — plan/02 §15).
 */
export function LogoWall({ logos }: { logos: PartnerLogo[] }) {
  if (logos.length === 0) return null;
  return (
    <ul
      aria-label="Các thương hiệu đồng hành cùng Hooked"
      className="grid grid-cols-2 gap-8 tablet:grid-cols-4 tablet:gap-x-12 tablet:px-4 desktop:gap-x-32 desktop:px-10"
    >
      {logos.map((partner) => (
        <li key={partner.name} className="relative h-16 desktop:h-[72px]">
          <Image
            src={partner.logo.src}
            alt={partner.logo.alt}
            fill
            sizes="(min-width: 1200px) 220px, (min-width: 768px) 25vw, 50vw"
            className="object-contain select-none"
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
}
