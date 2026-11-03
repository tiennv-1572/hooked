"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { Dialog, DialogCloseButton, DialogContent } from "@/components/ui/dialog";
import type { ProjectPhoto } from "@/data/project-details";
import { cn, wrapIndex } from "@/lib/utils";

type PhotoLightboxProps = {
  /** Project name shown in the title bar, upper-cased with CSS ("Devoid Music Festival"). */
  title: string;
  photos: ProjectPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close (controlled dialogs have no Radix Trigger to return to). */
  onCloseAutoFocus?: (event: Event) => void;
};

/** Minimum horizontal swipe distance (px) that changes photo on touch screens. */
const SWIPE_THRESHOLD = 40;

/**
 * Photo lightbox — Figma 74 · OVERLAYS / Photo lightboxes (2384:1765; `Photo viewer / Dialog` 2384:1768 desktop,
 * 2384:1788 mobile). Title bar + close, the full photo, then ‹ counter › navigation.
 * - Desktop: photo area 630px tall, the dialog width follows the photo ratio (945 for 3:2, 1120 for 16:9,
 *   min 440 for portraits); everything shrinks to fit shorter/narrower viewports.
 * - Mobile: 358px wide, photo height follows its ratio.
 * - Prev/next loop around; ←/→ keys and horizontal swipes also navigate. Esc / backdrop / × close (Radix).
 */
export function PhotoLightbox({
  title,
  photos,
  index,
  onIndexChange,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: PhotoLightboxProps) {
  const total = photos.length;
  const current = total ? photos[wrapIndex(index, total)] : undefined;
  const swipeStart = useRef<number | null>(null);

  if (!current) return null;

  const go = (step: number) => onIndexChange(wrapIndex(index + step, total));

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  };

  const ratio = current.width / current.height;
  // --photo-h: tallest photo area that keeps the whole dialog on screen (title 68/76 + nav 68 + margins).
  const style = { "--photo-ratio": ratio } as CSSProperties;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={`${title} — ảnh ${wrapIndex(index, total) + 1} / ${total}`}
        overlayClassName="bg-black/84"
        onKeyDown={onKeyDown}
        onCloseAutoFocus={onCloseAutoFocus}
        style={style}
        className={cn(
          "border-0 bg-coal [--photo-h:calc(100dvh-168px)]",
          "w-[min(358px,calc(100vw-32px))]",
          "tablet:max-h-[calc(100dvh-48px)] tablet:w-[min(calc(100vw-48px),max(440px,calc(var(--photo-h)*var(--photo-ratio))))] tablet:rounded-[20px] tablet:[--photo-h:min(630px,calc(100dvh-192px))]",
        )}
      >
        <div className="flex items-center gap-4 py-3 pr-3 pl-4 tablet:py-4 tablet:pr-4 tablet:pl-6">
          <p
            aria-hidden
            className="min-w-0 flex-1 text-sm leading-[22px] font-extrabold text-white uppercase tablet:text-lg tablet:leading-7"
          >
            {title}
          </p>
          <DialogCloseButton label="Đóng ảnh" />
        </div>

        <div
          className="relative aspect-(--photo-ratio) max-h-(--photo-h) w-full shrink-0 touch-pan-y bg-black select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
        >
          <Image
            key={current.id}
            src={current.src}
            alt={current.alt}
            fill
            sizes="(min-width: 768px) 1120px, 358px"
            className="animate-fade-in object-contain"
            draggable={false}
          />
        </div>

        <div className="flex h-17 shrink-0 items-center justify-between px-4 py-3 tablet:px-6">
          <NavButton direction="prev" onClick={() => go(-1)} />
          <p aria-live="polite" className="w-25 text-center text-[13px] leading-5 text-[#d3c6b8]">
            {wrapIndex(index, total) + 1} / {total}
          </p>
          <NavButton direction="next" onClick={() => go(1)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 44px ivory round control (`Previous photo` / `Next photo`, 2384:1780 · 2384:1782); accent on hover like ×. */
function NavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Ảnh trước" : "Ảnh tiếp theo"}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ivory transition-colors duration-150 hover:bg-accent"
    >
      <Icon name={direction === "prev" ? "project-chevron-left" : "project-chevron-right"} size={44} />
    </button>
  );
}
