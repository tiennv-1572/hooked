import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO = { src: "/images/brand/hooked-logo.png", width: 1307, height: 361 };

type HookedLogoProps = {
  className?: string;
  /** Mark the logo as the LCP candidate (header / hero). */
  eager?: boolean;
};

/**
 * Original Hooked logo (white "H K D" + orange double-O). Size it with width classes;
 * the 1307:361 ratio is kept by the image. Figma sizes: 100×28 (nav, headings), 260×73 (mobile hero).
 */
export function HookedLogo({ className, eager }: HookedLogoProps) {
  return (
    <Image
      src={LOGO.src}
      width={LOGO.width}
      height={LOGO.height}
      alt="Hooked"
      sizes="260px"
      loading={eager ? "eager" : undefined}
      className={cn("h-auto w-[100px] select-none", className)}
      draggable={false}
    />
  );
}

/** Double-ring brand mark used as a separator in the hero marquee (29.7×18). */
export function HookedMark({ className }: { className?: string }) {
  return (
    <Image
      src="/images/brand/hooked-mark.svg"
      width={30}
      height={18}
      alt=""
      aria-hidden
      className={cn("h-[18px] w-[29.7px] shrink-0", className)}
    />
  );
}

/** White single-colour "HOOKED" vector used inside the desktop highlight cards (180×49.72). */
export function HookedVector({ className }: { className?: string }) {
  return (
    <Image
      src="/images/brand/hooked-vector.svg"
      width={180}
      height={50}
      alt=""
      aria-hidden
      className={cn("h-[49.72px] w-[180px]", className)}
    />
  );
}
