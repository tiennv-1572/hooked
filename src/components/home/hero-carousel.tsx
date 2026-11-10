"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { HookedLogo } from "@/components/brand/hooked-logo";
import { HERO_TAGLINE, HeroMarquee } from "@/components/home/hero-marquee";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { HeroSlide, Photo } from "@/data/home";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { routes } from "@/lib/site";
import { cn, pad2 } from "@/lib/utils";

/** Seconds on screen: photos follow Figma (5 s); a video slide gets long enough to be seen moving. */
const PHOTO_SECONDS = 5;
const VIDEO_SECONDS = 15;

/**
 * Width a slide is drawn at: the photo covers a 100vw-wide box that is 520px (mobile), 640px (tablet) or
 * clamp(600px, 58.4vw, 841px) (desktop) tall, so a landscape photo is wider than the screen on mobile. `sizes`
 * says so, or the browser would fetch a screen-wide (blurry) variant. Rounded up where the box width varies.
 */
function coverSizes({ width, height }: Photo) {
  const ratio = width / height;
  const mobile = Math.max(767, Math.ceil(520 * ratio));
  const tablet = Math.max(1199, Math.ceil(640 * ratio));
  const desktop = Math.max(100, Math.ceil(58.4 * ratio));
  return `(max-width: 767px) ${mobile}px, (max-width: 1199px) ${tablet}px, ${desktop}vw`;
}

/**
 * Home hero (Figma 02 · Hero 142:13 / Home / Hero carousel / Mobile 2820:4923).
 * Full-bleed photos or muted looping YouTube videos (CMS), autoplay (5 s per photo, 15 s per video), drag/swipe, loop.
 * - ≥ 1200px: prev/next chevrons + independent text marquee at the bottom.
 * - < 1200px: readability gradient + brand lockup, branch actions and slide counter.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const plugins = useMemo(
    () =>
      reducedMotion
        ? []
        : [
            Autoplay({
              // One snap per slide (each slide is 100% wide).
              delay: (snaps) => snaps.map((_, i) => (slides[i]?.youtubeId ? VIDEO_SECONDS : PHOTO_SECONDS) * 1000),
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ],
    [reducedMotion, slides],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, plugins);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Hooked Entertainment"
      className="relative h-[520px] overflow-hidden bg-ink tablet:h-[640px] desktop:h-[clamp(600px,58.4vw,841px)]"
    >
      <div ref={emblaRef} className="absolute inset-0 overflow-hidden">
        <div className="flex h-full touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${slides.length}`}
              className="[container-type:size] relative h-full min-w-0 flex-[0_0_100%]"
            >
              <Image
                src={slide.image.src}
                alt={slide.image.alt}
                fill
                sizes={coverSizes(slide.image)}
                loading={index === 0 ? "eager" : undefined}
                fetchPriority={index === 0 ? "high" : undefined}
                className="object-cover select-none"
                draggable={false}
              />
              {/* Mounted only while selected: leaving the slide unmounts (stops) the video. */}
              {slide.youtubeId && !reducedMotion && index === selected ? (
                <HeroVideo youtubeId={slide.youtubeId} title={slide.image.alt} />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* < 1200px — readability gradient + lockup */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.1)_55%,rgba(5,1,1,0.98)_100%)] desktop:hidden" />
      {/* Lockup and controls fade in on load (ScrollReveal); the photo itself does not, so it paints at once. */}
      <div
        data-reveal="stagger"
        className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 px-6 pb-3 tablet:px-12 tablet:pb-10 desktop:hidden"
      >
        <HookedLogo className="w-[260px]" eager />
        <p className="text-xs leading-[18px] font-semibold text-white">ENTERTAINMENT</p>
        <div className="flex gap-3">
          <ButtonLink href={routes.academy} variant="accent" className="w-[149px]">
            Academy
            <Icon name="arrow-up-right-dark-20" />
          </ButtonLink>
          <ButtonLink href={routes.projects} variant="coal" className="w-[149px]">
            Projects
            <Icon name="arrow-up-right-accent-20" />
          </ButtonLink>
        </div>
        <p aria-live="polite" className="text-[11px] leading-[17px] font-medium whitespace-pre text-muted">
          {`${pad2(selected + 1)} / ${pad2(slides.length)}  ·  ${HERO_TAGLINE}`}
        </p>
      </div>

      {/* ≥ 1200px — chevrons + marquee */}
      <div
        data-reveal="stagger"
        className="pointer-events-none absolute inset-0 hidden items-center justify-between px-6 desktop:flex"
      >
        <HeroArrow direction="prev" onClick={scrollPrev} />
        <HeroArrow direction="next" onClick={scrollNext} />
      </div>
      <HeroMarquee className="absolute inset-x-0 bottom-3 hidden desktop:flex" />
    </section>
  );
}

/**
 * Background YouTube video over the poster image (muted, looped, no controls, not focusable), scaled to cover
 * the slide like `object-cover` and faded in once YouTube has painted a frame. Pointer events stay on the
 * carousel so drag/swipe keeps working.
 */
function HeroVideo({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [visible, setVisible] = useState(false);
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: youtubeId,
    controls: "0",
    playsinline: "1",
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    disablekb: "1",
    // YouTube switches captions on for muted autoplay: ask for none, then unload the module once ready.
    cc_load_policy: "0",
    enablejsapi: "1",
  });
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`}
      title={title || "Video Hooked Entertainment"}
      allow="autoplay; encrypted-media; picture-in-picture"
      tabIndex={-1}
      aria-hidden
      // YouTube shows a black frame + spinner first: wait a moment after load before revealing the video.
      onLoad={(event) => {
        const player = event.currentTarget.contentWindow;
        const hideCaptions = () =>
          player?.postMessage(JSON.stringify({ event: "command", func: "unloadModule", args: ["captions"] }), "*");
        hideCaptions();
        window.setTimeout(() => {
          hideCaptions();
          setVisible(true);
        }, 900);
        window.setTimeout(hideCaptions, 3000);
      }}
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 h-[max(100cqh,56.25cqw)] w-[max(100cqw,177.78cqh)] -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-700",
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

function HeroArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Ảnh trước" : "Ảnh tiếp theo"}
      className="pointer-events-auto flex size-10 items-center justify-center rounded-[20px] transition-colors duration-150 hover:bg-black/30"
    >
      <Icon name={direction === "prev" ? "chevron-left" : "chevron-right"} />
    </button>
  );
}
