"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type KeyboardEvent } from "react";

import { registrationSources, type AcademyCourse } from "@/components/academy/academy-content";
import { useAcademyOverlays } from "@/components/academy/academy-overlays";
import { InfoLines } from "@/components/academy/info-lines";
import { RegisterButton } from "@/components/academy/register-button";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn, pad2, wrapIndex } from "@/lib/utils";

/**
 * Course carousel — one slide per CMS course (7 in the design), loop, drag/swipe (Figma 90.2 · RUNTIME / Academy 2494:3833).
 * - ≥ 1200px (`Academy / Course carousel` 2082:375, Slide=1..7): 1080×560 featured card over the course photo,
 *   previous/next previews (title + thumbnail + arrow) on both sides and one pagination dot per course.
 * - < 1200px (`Academy / Course carousel / Mobile` 2821:5016): photo, `01 / 07` counter with round arrows,
 *   course facts and two CTAs — "Đăng ký ngay" (Registration) and "Nội dung khóa học" (Course program).
 */
export function CourseCarousel({ courses }: { courses: AcademyCourse[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 28 });
  const [selected, setSelected] = useState(0);
  const total = courses.length;

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
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index, reducedMotion), [emblaApi, reducedMotion]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") scrollPrev();
    if (event.key === "ArrowRight") scrollNext();
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Các khóa học của Hooked Academy"
      onKeyDown={onKeyDown}
      className="desktop:flex desktop:flex-col desktop:items-center desktop:gap-6"
    >
      <div className="desktop:flex desktop:w-full desktop:max-w-[1392px] desktop:items-center desktop:gap-6">
        <CoursePreview course={courses[wrapIndex(selected - 1, total)]} direction="prev" onClick={scrollPrev} />

        <div className="min-w-0 desktop:max-w-[1080px] desktop:flex-1">
          {/* `relative` keeps embla measurements in one offsetParent; negative margins leave room for the card shadow. */}
          <div ref={emblaRef} className="relative overflow-hidden desktop:-mx-3 desktop:-my-8">
            <div className="flex touch-pan-y">
              {courses.map((course, index) => (
                <CourseSlide
                  key={course.id}
                  course={course}
                  index={index}
                  total={total}
                  active={index === selected}
                  onPrev={scrollPrev}
                  onNext={scrollNext}
                />
              ))}
            </div>
          </div>
        </div>

        <CoursePreview course={courses[wrapIndex(selected + 1, total)]} direction="next" onClick={scrollNext} />
      </div>

      <div className="hidden h-6 items-center justify-center desktop:flex">
        {courses.map((course, index) => {
          const active = index === selected;
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`Khóa ${index + 1}: ${course.title}`}
              aria-current={active || undefined}
              className="group flex h-6 w-8 items-center justify-center"
            >
              <span
                className={cn(
                  "h-2 rounded-[4px] transition-[width,background-color] duration-300 ease-carousel",
                  active ? "w-6 bg-accent" : "w-2 bg-[#5c5754] group-hover:bg-muted",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

type CourseSlideProps = {
  course: AcademyCourse;
  index: number;
  total: number;
  active: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function CourseSlide({ course, index, total, active, onPrev, onNext }: CourseSlideProps) {
  const overlays = useAcademyOverlays();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${pad2(index + 1)} / ${pad2(total)}: ${course.title}`}
      inert={!active}
      className="min-w-0 flex-[0_0_100%] px-6 pt-2 pb-6 tablet:px-12 desktop:px-3 desktop:py-8"
    >
      <article className="flex flex-col gap-4 desktop:relative desktop:h-[560px] desktop:justify-between desktop:gap-0 desktop:overflow-hidden desktop:rounded-2xl desktop:border desktop:border-[rgba(255,156,80,0.28)] desktop:p-10 desktop:shadow-[0_0_32px_-8px_rgba(229,86,36,0.13),0_20px_40px_-12px_rgba(0,0,0,0.45)]">
        {/* Photo: 342×192 block on mobile, full-bleed background with readability gradient on desktop. */}
        <div className="relative h-48 shrink-0 overflow-hidden tablet:h-[360px] desktop:absolute desktop:inset-0 desktop:h-auto">
          <CoursePhoto
            course={course}
            sizes="(min-width: 1200px) 1080px, (min-width: 768px) 672px, 100vw"
            priority={index === 0}
          />
          <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(5,1,1,0.97)_0%,rgba(5,1,1,0.86)_40%,rgba(5,1,1,0.86)_67%,rgba(5,1,1,0.12)_100%)] desktop:block" />
        </div>

        <div className="flex items-center justify-between gap-3 desktop:hidden">
          <p className="text-xs leading-[18px] font-semibold text-accent">
            {pad2(index + 1)} / {pad2(total)}
          </p>
          <div className="flex gap-3">
            <RoundArrow direction="prev" onClick={onPrev} />
            <RoundArrow direction="next" onClick={onNext} />
          </div>
        </div>

        <div className="relative flex flex-col gap-4 desktop:w-[580px] desktop:max-w-full desktop:gap-3">
          <h2 className="text-[28px] leading-[31px] font-extrabold text-white uppercase desktop:bg-[linear-gradient(90deg,var(--color-ivory),var(--color-white))] desktop:bg-clip-text desktop:text-[40px] desktop:leading-[48px] desktop:tracking-[-1.2px] desktop:text-transparent">
            {course.title}
          </h2>
          <p className="text-sm leading-[21px] text-muted desktop:text-base desktop:leading-6">{course.description}</p>
          <div className="grid gap-4 text-sm leading-[22px] text-muted desktop:grid-cols-2 desktop:gap-x-6 desktop:gap-y-3 desktop:text-base desktop:leading-6">
            <div>
              <InfoLines lines={course.instructors} />
            </div>
            <div>
              <p className="font-bold">Lộ trình</p>
              <p>{course.duration}</p>
            </div>
            <div className="desktop:col-span-2">
              <p className="font-bold">Giờ học</p>
              <InfoLines lines={course.schedule} />
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 tablet:grid tablet:grid-cols-2 desktop:flex">
          <RegisterButton
            courseId={course.id}
            source={registrationSources.carousel}
            variant="accent"
            className="w-full desktop:hidden"
          >
            Đăng ký ngay
            <Icon name="arrow-up-right-dark-20" />
          </RegisterButton>
          <Button
            variant="coal"
            aria-haspopup="dialog"
            onClick={() => overlays?.openProgram(course.id, registrationSources.carousel)}
            className="w-full desktop:hidden"
          >
            Nội dung khóa học
            <Icon name="arrow-up-right-accent-20" />
          </Button>

          {/* Desktop ivory pill with orange disc (Figma "Registration" 2082:256). */}
          <RegisterButton
            courseId={course.id}
            source={registrationSources.carousel}
            variant="plain"
            className="group relative hidden h-14 w-[248px] items-center rounded-[28px] bg-ivory pl-6 text-[15px] font-bold text-[#160c05] transition-colors duration-150 hover:bg-white desktop:flex"
          >
            Đăng ký ngay
            <span className="absolute top-2 right-2 size-10 transition-transform duration-150 group-hover:scale-105">
              <Icon name="academy-orange-disc" size={40} />
              <Icon
                name="academy-arrow-up-right-ink"
                size={[13.7, 13.7]}
                className="absolute top-[13.15px] left-[13.15px]"
              />
            </span>
          </RegisterButton>
        </div>
      </article>
    </div>
  );
}

/**
 * Course photo. Producer/Flip artwork carries a "HOOKED ACADEMY" lockup: desktop crops to its top-left
 * (Figma 156.25% fill), mobile shows the full artwork.
 */
function CoursePhoto({ course, sizes, priority }: { course: AcademyCourse; sizes: string; priority?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0",
        course.zoomTopLeft && "desktop:right-auto desktop:bottom-auto desktop:size-[156.25%]",
      )}
    >
      <Image
        src={course.image.src}
        alt={course.image.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        draggable={false}
        className={cn("object-cover select-none", course.zoomTopLeft && "desktop:object-left-top")}
      />
    </div>
  );
}

function RoundArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Khóa học trước" : "Khóa học tiếp theo"}
      className="flex h-11 w-12 items-center justify-center rounded-[22px] bg-coal transition-colors duration-150 hover:bg-[#2a1f19]"
    >
      <Icon name={direction === "prev" ? "academy-arrow-left" : "academy-arrow-right"} size={24} />
    </button>
  );
}

/** Desktop side preview (Figma `Preview / left|right`, hover wrappers 2437:3259 / 2437:3307). */
function CoursePreview({
  course,
  direction,
  onClick,
}: {
  course: AcademyCourse;
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === "prev" ? "Khóa học trước" : "Khóa học tiếp theo"}: ${course.title}`}
      className="group hidden w-[132px] shrink-0 flex-col items-start gap-2 text-left desktop:flex"
    >
      <span className="text-base leading-[22px] font-semibold text-muted transition-colors duration-150 group-hover:text-ivory">
        {course.title}
      </span>
      <span className="relative size-[132px] overflow-hidden rounded-lg border border-[rgba(255,156,80,0.2)] transition-colors duration-150 group-hover:border-accent">
        <CoursePhoto course={course} sizes="132px" />
      </span>
      <span className="flex h-11 w-full items-center justify-center rounded-lg border border-[rgba(255,156,80,0.22)] bg-[linear-gradient(156deg,#241910_14.286%,#17110d_57.143%,var(--color-coal)_85.714%)] transition-colors duration-150 group-hover:border-accent">
        <Icon name={direction === "prev" ? "academy-arrow-left" : "academy-arrow-right"} size={24} />
      </span>
    </button>
  );
}
