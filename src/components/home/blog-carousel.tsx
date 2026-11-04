"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import type { BlogPreview } from "@/data/home";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { coverSizes, type CoverFrame } from "@/lib/image-sizes";
import { wrapIndex } from "@/lib/utils";

type Direction = 1 | -1;

type BlogCarouselProps = {
  posts: BlogPreview[];
  initialIndex?: number;
};

/**
 * BLOGPOST — coherent five-item cyclic carousel (Figma Blogpost / BlogpostSection 2142:1077).
 *
 * Frames never move: the upright center card, the curved preview silhouettes and the caption stay put.
 * Only the artwork inside each frame slides (380ms), all slots together, along an endless strip (see ArtworkStrip);
 * the caption and link follow once the slide lands.
 *
 * Desktop/tablet: inner-left preview · center card · inner-right preview. Mobile: center card only.
 */
export function BlogCarousel({ posts, initialIndex = 0 }: BlogCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  // Unbounded slide positions (wrapped when read): `target` moves on click, `landed` once the slide has finished.
  const [target, setTarget] = useState(initialIndex);
  const [landed, setLanded] = useState(initialIndex);
  const moving = target !== landed;

  const settle = useCallback(() => setLanded(target), [target]);

  const go = useCallback(
    (direction: Direction) => {
      if (moving) return;
      setTarget(target + direction);
      if (reducedMotion) setLanded(target + direction);
    },
    [moving, target, reducedMotion],
  );

  // Safety net: settle even if `transitionend` never fires (background tab, interrupted transition).
  useEffect(() => {
    if (!moving) return;
    const timer = window.setTimeout(settle, 600);
    return () => window.clearTimeout(timer);
  }, [moving, settle]);

  const swipe = useSwipe(go);
  const post = posts[wrapIndex(landed, posts.length)];
  const animate = !reducedMotion;
  // Off-frame artworks are clipped, so lazy loading would only fetch the one sliding in after the click. Load them
  // once the carousel is near; the previews only where they are shown (≥ 768px).
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNearViewport(sectionRef);
  const previewsShown = useMediaQuery("(min-width: 768px)");

  return (
    // Mobile (Home / Blog carousel / Mobile, 2826:5093): the 607px frame ends 19px under the card caption.
    <section
      ref={sectionRef}
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
        <PreviewSlot
          side="left"
          posts={posts}
          index={target - 1}
          animate={animate}
          preload={near && previewsShown}
          onSelect={() => go(-1)}
        />

        <Link
          href={post.href}
          className="group flex w-[280px] shrink-0 flex-col gap-4 pt-10 tablet:w-[184px] tablet:pt-7 desktop:w-[260px] desktop:pt-10"
        >
          <div className="relative h-[366px] overflow-hidden rounded-lg bg-blog-frame tablet:h-[241px] desktop:h-[340px]">
            <ArtworkStrip
              posts={posts}
              index={target}
              animate={animate}
              preload={near}
              onSettled={settle}
              frames={CENTER_FRAMES}
              zoom={1.18}
            />
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

        <PreviewSlot
          side="right"
          posts={posts}
          index={target + 1}
          animate={animate}
          preload={near && previewsShown}
          onSelect={() => go(1)}
        />
      </div>
    </section>
  );
}

type StripProps = {
  posts: BlogPreview[];
  /** Unbounded position of the artwork this frame shows. */
  index: number;
  animate: boolean;
  /** Load all three artworks now instead of lazily. */
  preload: boolean;
  /** Frame size per breakpoint, for `sizes`. */
  frames: CoverFrame[];
  zoom: number;
  onSettled?: () => void;
};

/** Frames an artwork covers (CSS px), for `sizes`. */
const CENTER_FRAMES: CoverFrame[] = [
  { media: "(min-width: 1200px)", width: 260, height: 340 },
  { media: "(min-width: 768px)", width: 184, height: 241 },
  { width: 280, height: 366 },
];
const PREVIEW_FRAMES: CoverFrame[] = [
  { media: "(min-width: 1200px)", width: 260, height: 374 },
  { width: 184, height: 265 }, // hidden below 768px
];

/** Each artwork shows 2px of itself beyond its frame-sized cell (see ArtworkStrip). */
const BLEED = 2;

/**
 * Endless strip: the artwork for position `k` sits at `k` cell-steps along the strip, and the strip slides so the
 * current position fills the frame. Only the strip's transform changes, so the last frame of a slide is exactly the
 * resting state (nothing is re-centred or re-clipped when it lands), and wrap-around is seamless (positions keep
 * counting, artworks repeat). Cells are 2px further apart than the frame and each shows 2px of its own (zoomed)
 * artwork beyond its edges: wherever the frame's edge rounds to (half-pixel frames at odd viewport widths, 110–175%
 * zoom), it falls on the current artwork, never on the next one.
 */
function ArtworkStrip({ posts, index, animate, preload, frames, zoom, onSettled }: StripProps) {
  const step = `(100% + ${2 * BLEED}px)`;
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `translate3d(calc(${-index} * ${step}), 0, 0)`,
        transition: animate ? "transform 380ms var(--ease-carousel)" : "none",
      }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget) onSettled?.();
      }}
    >
      {/* Previous, current and next positions; a cell keeps its node (and loaded image) while it stays in range. */}
      {[index - 1, index, index + 1].map((position) => {
        const cell = posts[wrapIndex(position, posts.length)];
        return (
          <div
            key={position}
            className="absolute inset-y-0 w-full"
            style={{ left: `calc(${position} * ${step})`, clipPath: `inset(0 -${BLEED}px)` }}
          >
            <Image
              src={cell.image.src}
              alt={position === index ? cell.image.alt : ""}
              fill
              sizes={coverSizes(cell.image, frames, zoom)}
              loading={preload ? "eager" : "lazy"}
              className="object-cover select-none"
              style={{ scale: zoom }}
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}

type PreviewSlotProps = {
  side: "left" | "right";
  posts: BlogPreview[];
  index: number;
  animate: boolean;
  preload: boolean;
  onSelect: () => void;
};

/** Curved preview silhouette (Blogpost / CurvedPreviewSlot) — the frame is an alpha mask exported from Figma. */
function PreviewSlot({ side, posts, index, animate, preload, onSelect }: PreviewSlotProps) {
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
        <ArtworkStrip
          posts={posts}
          index={index}
          animate={animate}
          preload={preload}
          frames={PREVIEW_FRAMES}
          zoom={1.3}
        />
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

/** `true` once the element comes within a screen of the viewport (it then stays `true`). */
function useNearViewport(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (near || !element) return;
    const observer = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), {
      rootMargin: "100% 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, near]);
  return near;
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
