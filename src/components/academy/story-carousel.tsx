"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";

import type { FeaturedStory } from "@/components/academy/academy-content";
import { Icon } from "@/components/ui/icon";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

/**
 * Featured student stories carousel (Figma 03 · BEHAVIOR `Academy / Student stories` 2082:376,
 * instance 2083:115; Slide=1..3 — the CMS students marked `featured`). Loop + drag.
 * Copper panel (name, role, headline, "Xem câu chuyện →", round ←/→, quote mark) over the portrait.
 * Used from 768px; the mobile page shows a single static featured student instead (plan/03 §7.3).
 */
export function StoryCarousel({ students, className }: { students: FeaturedStory[]; className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28 });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(reducedMotion), [emblaApi, reducedMotion]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(reducedMotion), [emblaApi, reducedMotion]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") scrollPrev();
    if (event.key === "ArrowRight") scrollNext();
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Câu chuyện học viên tiêu biểu"
      onKeyDown={onKeyDown}
      className={className}
    >
      {/* `relative` keeps embla measurements in one offsetParent; negative margins leave room for the card shadow. */}
      <div ref={emblaRef} className="relative -mx-8 -my-10 overflow-hidden">
        <div className="flex touch-pan-y">
          {students.map((student, index) => (
            <StorySlide
              key={student.slug}
              student={student}
              index={index}
              total={students.length}
              active={index === selected}
              onPrev={scrollPrev}
              onNext={scrollNext}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type StorySlideProps = {
  student: FeaturedStory;
  index: number;
  total: number;
  active: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function StorySlide({ student, index, total, active, onPrev, onNext }: StorySlideProps) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total}: ${student.name}`}
      inert={!active}
      className="min-w-0 flex-[0_0_100%] px-8 py-10"
    >
      <article className="relative flex min-h-[400px] overflow-hidden rounded-2xl bg-[#d9d9d9] shadow-[0_0_32px_0_rgba(229,86,36,0.13),0_20px_40px_0_rgba(0,0,0,0.45)]">
        <div className="absolute inset-y-0 right-0 w-[43.6%]">
          <Image
            src={student.portrait.src}
            alt={student.portrait.alt}
            fill
            sizes="(min-width: 1200px) 520px, 44vw"
            draggable={false}
            className="object-cover object-[50%_5%] select-none"
          />
        </div>

        <div className="relative flex w-[62.4%] flex-col justify-between gap-8 rounded-tl-[4px] rounded-tr-[44px] rounded-br-[44px] rounded-bl-[4px] bg-[linear-gradient(144deg,var(--color-copper)_14.286%,#f47737_52.857%,var(--color-brand)_85.714%)] p-8 text-ink desktop:p-10">
          <div className="flex flex-col gap-3">
            <h3 className="text-4xl leading-[44px] font-extrabold tracking-[-1.08px] desktop:text-5xl desktop:leading-[58px] desktop:tracking-[-1.44px]">
              {student.name}
            </h3>
            <p className="text-base leading-6">{student.role}</p>
            <p className="text-xl leading-7 font-medium text-black/88 desktop:text-2xl desktop:leading-8">
              {student.headline}
            </p>
            <Link
              href={student.href}
              className="w-fit text-base leading-8 font-semibold underline-offset-4 transition-colors duration-150 hover:text-ivory hover:underline focus-visible:outline-ink"
            >
              Xem câu chuyện →
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <StoryArrow direction="prev" onClick={onPrev} />
              <StoryArrow direction="next" onClick={onNext} />
            </div>
            <Icon name="academy-quote" size={48} />
          </div>
        </div>
      </article>
    </div>
  );
}

function StoryArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Câu chuyện trước" : "Câu chuyện tiếp theo"}
      className={cn(
        "flex size-12 items-center justify-center rounded-full border border-[rgba(16,12,10,0.75)] transition-colors duration-150",
        "hover:bg-ink/10 focus-visible:outline-ink",
      )}
    >
      <Icon name={direction === "prev" ? "academy-arrow-left-ink" : "academy-arrow-right-ink"} size={24} />
    </button>
  );
}
