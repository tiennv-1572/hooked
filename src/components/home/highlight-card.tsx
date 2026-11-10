"use client";

import Image from "next/image";
import Link from "next/link";

import { HookedVector } from "@/components/brand/hooked-logo";
import { Icon } from "@/components/ui/icon";
import type { Highlight } from "@/data/home";
import { useCircleReveal } from "@/hooks/use-circle-reveal";
import { cn } from "@/lib/utils";

/** CMS highlights carry free-form ids. */
export type HighlightItem = Omit<Highlight, "id"> & { id: string };

const SIZES = "(min-width: 1200px) 584px, (min-width: 768px) 50vw, 100vw";
/** Both photo layers zoom in gently on hover / keyboard focus, in step with the colour reveal. */
const PHOTO =
  "object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none";

/**
 * Highlight card. The CMS photo is in colour; where the card can be hovered it shows in black & white and the
 * colour spreads in a circle from where the pointer enters (from the centre on keyboard focus), shrinking back to
 * where it leaves (useCircleReveal). Two layers of the same image (one download): a grayscale base and a colour copy.
 * Hover also zooms the photo in slightly and turns the title orange. Touch screens keep the colour; reduced
 * motion swaps instantly.
 */
export function HighlightCard({ item }: { item: HighlightItem }) {
  const end = item.align === "end";
  const { layer: colour, area: media, reveal, fromPointer } = useCircleReveal<HTMLDivElement>();

  return (
    <Link
      href={item.href}
      onPointerEnter={(event) => fromPointer(event, true)}
      onPointerLeave={(event) => fromPointer(event, false)}
      onFocus={(event) => event.currentTarget.matches(":focus-visible") && reveal(true)}
      onBlur={() => reveal(false)}
      className="group flex flex-col gap-3 desktop:relative desktop:h-[379px] desktop:overflow-hidden desktop:bg-card"
    >
      <div
        ref={media}
        className="relative aspect-[342/222] overflow-hidden rounded-[4px] desktop:absolute desktop:inset-0 desktop:aspect-auto desktop:rounded-none"
      >
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes={SIZES}
          className={cn(PHOTO, "[@media(hover:hover)]:grayscale")}
        />
        {/* Closed where the card can be hovered; the animation opens it. */}
        <div
          ref={colour}
          aria-hidden
          className="absolute inset-0 [@media(hover:hover)]:[clip-path:circle(0%_at_50%_50%)]"
        >
          <Image src={item.image.src} alt="" fill sizes={SIZES} className={PHOTO} />
        </div>
        {/* Desktop: the title sits on the photo — darken the lower part so it reads on any (bright) CMS photo. */}
        <span className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(0deg,rgba(5,1,1,0.75)_0%,rgba(5,1,1,0.4)_35%,rgba(5,1,1,0)_62%)] desktop:block" />
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
        <span className="text-2xl leading-9 font-extrabold text-white transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent desktop:mt-1.5 desktop:text-[52px] desktop:leading-[1.1]">
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
