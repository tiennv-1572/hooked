"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import type { BlogPreview } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn, wrapIndex } from "@/lib/utils";

type Direction = 1 | -1;

type BlogCarouselProps = {
  posts: BlogPreview[];
  initialIndex?: number;
};

/**
 * BLOGPOST — coherent five-item cyclic carousel (Figma Blogpost / BlogpostSection 2142:1077).
 *
 * Frames never move: the upright center card, the curved preview silhouettes and the caption stay put.
 * Only the artwork inside each frame slides (380ms), all slots together. Wrap-around is seamless because
 * every slot renders a 3-cell strip [previous, current, next] that is re-centred after each move.
 *
 * Desktop/tablet: inner-left preview · center card · inner-right preview. Mobile: center card only.
 */
export function BlogCarousel({ posts, initialIndex = 0 }: BlogCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [active, setActive] = useState(initialIndex);
  const [moving, setMoving] = useState<Direction | null>(null);
  const movingRef = useRef<Direction | null>(null);
  const count = posts.length;

  const settle = useCallback(() => {
    const direction = movingRef.current;
    if (!direction) return;
    movingRef.current = null;
    setActive((index) => wrapIndex(index + direction, count));
    setMoving(null);
  }, [count]);

  const go = useCallback(
    (direction: Direction) => {
      if (movingRef.current) return;
      if (reducedMotion) {
        setActive((index) => wrapIndex(index + direction, count));
        return;
      }
      movingRef.current = direction;
      setMoving(direction);
    },
    [count, reducedMotion],
  );

  // Safety net: settle even if `transitionend` never fires (background tab, interrupted transition).
  useEffect(() => {
    if (!moving) return;
    const timer = window.setTimeout(settle, 600);
    return () => window.clearTimeout(timer);
  }, [moving, settle]);

  const swipe = useSwipe(go);
  const post = posts[active];

  return (
    // Mobile (Home / Blog carousel / Mobile, 2826:5093): the 607px frame ends 19px under the card caption.
    <section
      aria-labelledby="blog-title"
      aria-roledescription="carousel"
      className="grain bg-[linear-gradient(180deg,#872b06_0%,#ed5c0e_50%,#ffb259_100%)] pt-6 pb-[19px] tablet:pt-8 tablet:pb-8 desktop:bg-none desktop:pt-10 desktop:pb-[29px] desktop:[&::after]:hidden"
    >
      <Container className="desktop:max-w-none desktop:px-[50px]">
        <div className="flex h-14 items-center justify-between tablet:h-[72px] desktop:h-[88px]">
          <h2
            id="blog-title"
            className="font-inter text-[28px] leading-[34px] font-bold text-white uppercase tablet:text-[32px] tablet:leading-10 desktop:text-[40px] desktop:leading-[48px]"
          >
            Blogpost
          </h2>
          <NextArticleButton onClick={() => go(1)} />
        </div>
      </Container>

      <div
        className="mt-4 flex touch-pan-y items-start justify-center gap-4 overflow-hidden desktop:mt-3 desktop:h-[525px]"
        {...swipe}
      >
        <PreviewSlot side="left" posts={posts} index={active - 1} moving={moving} onSelect={() => go(-1)} />

        <Link
          href={post.href}
          className="group flex w-[280px] shrink-0 flex-col gap-4 pt-10 tablet:w-[184px] tablet:pt-7 desktop:w-[260px] desktop:pt-10"
        >
          <div className="relative h-[366px] overflow-hidden rounded-lg bg-blog-frame tablet:h-[241px] desktop:h-[340px]">
            <ArtworkStrip posts={posts} index={active} moving={moving} onSettled={settle} zoom={1.18} />
          </div>
          <div aria-live="polite" className="flex flex-col items-center gap-2 text-center font-inter text-white">
            <h3 className="text-lg leading-6 font-semibold underline-offset-4 group-hover:underline">{post.title}</h3>
            <p className="text-[13px] leading-[19px]">
              {post.lines[0]}
              <br />
              {post.lines[1]}
            </p>
          </div>
        </Link>

        <PreviewSlot side="right" posts={posts} index={active + 1} moving={moving} onSelect={() => go(1)} />
      </div>
    </section>
  );
}

type StripProps = {
  posts: BlogPreview[];
  index: number;
  moving: Direction | null;
  zoom: number;
  onSettled?: () => void;
};

/**
 * Three artwork cells; the strip translates by one cell and is re-centred on transition end.
 *
 * At rest only the frame clips the current artwork: the strip sits on a margin (no transform, so no compositing
 * layer of its own), the neighbours are hidden and the current cell does not clip its zoomed artwork. On a half-pixel
 * frame (odd viewport width, 125% zoom…) the cell, layer and frame clips round differently, which left a 1px column
 * of the neighbouring artwork (or of the frame background) at the frame edge. While sliding, each cell clips its own.
 */
function ArtworkStrip({ posts, index, moving, zoom, onSettled }: StripProps) {
  const cells = [-1, 0, 1].map((offset) => posts[wrapIndex(index + offset, posts.length)]);

  return (
    <div
      className="-ml-[100%] flex h-full w-[300%]"
      style={{
        transform: moving ? `translate3d(${(moving * -100) / 3}%, 0, 0)` : "none",
        transition: moving ? "transform 380ms var(--ease-carousel)" : "none",
      }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget) onSettled?.();
      }}
    >
      {cells.map((cell, position) => (
        // Keyed by slug so React moves the loaded <img> nodes instead of reloading them after each step
        // (with fewer than three items the strip repeats a slug, so fall back to the position).
        <div
          key={posts.length >= 3 ? cell.slug : position}
          className={cn("relative h-full w-1/3", moving ? "overflow-hidden" : position !== 1 && "invisible")}
        >
          <Image
            src={cell.image.src}
            alt={position === 1 ? cell.image.alt : ""}
            fill
            sizes="(min-width: 1200px) 260px, 280px"
            className="object-cover select-none"
            style={{ scale: zoom }}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

type PreviewSlotProps = {
  side: "left" | "right";
  posts: BlogPreview[];
  index: number;
  moving: Direction | null;
  onSelect: () => void;
};

/** Curved preview silhouette (Blogpost / CurvedPreviewSlot) — the frame is an alpha mask exported from Figma. */
function PreviewSlot({ side, posts, index, moving, onSelect }: PreviewSlotProps) {
  const post = posts[wrapIndex(index, posts.length)];
  const maskUrl = `url(/images/blog/preview-mask-${side}.png)`;
  const mask: CSSProperties = {
    maskImage: maskUrl,
    WebkitMaskImage: maskUrl,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${side === "left" ? "Bài trước" : "Bài tiếp theo"}: ${post.title}`}
      className="hidden w-[184px] shrink-0 pt-[37px] transition-opacity duration-150 hover:opacity-90 tablet:block desktop:w-[260px] desktop:pt-[52px]"
    >
      <div className="relative h-[265px] overflow-hidden desktop:h-[374px]" style={mask}>
        <ArtworkStrip posts={posts} index={index} moving={moving} zoom={1.3} />
      </div>
    </button>
  );
}

/**
 * Next article button (Blogpost / NextButton 2141:217): arrow inside a ring of six "HOOKED" labels.
 * 56px mobile, 72px tablet, 88px desktop. Hover dims (120ms), focus draws a ring.
 */
function NextArticleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Bài viết tiếp theo"
      className="group relative size-14 shrink-0 rounded-full outline-none tablet:size-[72px] desktop:size-[88px]"
    >
      <span className="absolute top-1/2 left-1/2 size-[88px] -translate-1/2 scale-[0.6364] tablet:scale-[0.8182] desktop:scale-100">
        <span className="absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-[120ms] group-focus-visible:border-white" />
        <span className="absolute inset-0 transition-opacity duration-[120ms] group-hover:opacity-75">
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <span
              key={angle}
              className="absolute top-1/2 left-1/2 font-inter text-[7px] leading-[9px] whitespace-nowrap text-white"
              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-35px)` }}
            >
              HOOKED
            </span>
          ))}
          <Icon
            name="arrow-right-long"
            className="absolute top-1/2 left-1/2 h-[33.42px] w-[49.38px] -translate-1/2 transition-transform duration-[120ms] group-hover:translate-x-[calc(-50%+3px)]"
          />
        </span>
      </span>
    </button>
  );
}

/** Horizontal swipe → previous / next (mobile shows a single card). */
function useSwipe(onSwipe: (direction: Direction) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      start.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event: PointerEvent) => {
      const origin = start.current;
      start.current = null;
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}
