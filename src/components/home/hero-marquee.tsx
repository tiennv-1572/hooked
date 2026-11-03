import { HookedLogo, HookedMark } from "@/components/brand/hooked-logo";
import { Marquee } from "@/components/ui/marquee";

/** Fixed by the design (not editable in the CMS). */
export const HERO_TAGLINE = "SUPPORT LOCAL ARTISTS";

/**
 * "SUPPORT LOCAL ARTISTS ∞ HOOKED ENTERTAINMENT ∞" strip at the bottom of the desktop hero
 * (Figma Home / Independent text marquee, 2485:3981). Items sit 38px apart; the outlined
 * tagline uses the brand stroke on a transparent fill.
 */
export function HeroMarquee({ className }: { className?: string }) {
  return (
    <Marquee duration={24} gap={38} className={className} label={`${HERO_TAGLINE} — Hooked Entertainment`}>
      <span className="text-4xl leading-[49px] font-bold whitespace-nowrap text-transparent uppercase [-webkit-text-stroke:1px_var(--color-brand)]">
        {HERO_TAGLINE}
      </span>
      <HookedMark />
      <span className="flex items-center gap-[9px]">
        <HookedLogo />
        <span className="text-4xl leading-[49px] font-bold whitespace-nowrap text-white uppercase">Entertainment</span>
      </span>
      <HookedMark />
    </Marquee>
  );
}
