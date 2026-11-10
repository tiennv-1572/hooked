import Image from "next/image";

import { Marquee } from "@/components/ui/marquee";
import type { PartnerLogo } from "@/data/partners-page";

/**
 * "Partners / Logo wall" (Figma desktop 2747:4691, mobile 2747:5930), running like the Home logo marquee: the same
 * left → right strip with faded edges, paused on hover, still under `prefers-reduced-motion`.
 * Logos keep the page's size on desktop (their export size, up to 72px tall) and the Home marquee's 73% below it;
 * the gap and the duration scale with them (`--logo-scale`), so the strip moves at the same speed everywhere.
 * The strip runs to the edges of the page column (24 / 48px gutters).
 */
export function LogoWall({ logos }: { logos: PartnerLogo[] }) {
  if (logos.length === 0) return null;
  return (
    <div className="-mx-6 [--logo-scale:0.73] tablet:-mx-12 desktop:[--logo-scale:1]">
      <Marquee
        fade
        reveal
        duration="calc(20s * var(--logo-scale))"
        gap="calc(80px * var(--logo-scale))"
        label="Các thương hiệu đồng hành cùng Hooked"
      >
        {logos.map((partner) => (
          <Image
            key={partner.name}
            src={partner.logo.src}
            alt={partner.logo.alt}
            width={partner.logo.width}
            height={partner.logo.height}
            style={{
              width: `calc(${partner.logo.width}px * var(--logo-scale))`,
              height: `calc(${partner.logo.height}px * var(--logo-scale))`,
            }}
            className="shrink-0 object-contain select-none"
            draggable={false}
          />
        ))}
      </Marquee>
    </div>
  );
}
