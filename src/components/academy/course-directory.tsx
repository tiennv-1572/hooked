"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { registrationSources, type AcademyCourse } from "@/components/academy/academy-content";
import { useAcademyOverlays } from "@/components/academy/academy-overlays";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { cn, pad2 } from "@/lib/utils";

/** First filter chip: no category filter. */
const ALL = "Tất cả";

type CourseDirectoryProps = {
  courses: AcademyCourse[];
  /** Category chip labels in CMS order ("Danh mục khóa học"), only those with a published course. */
  categories: string[];
  /** Mobile/tablet heading ("Tất cả khóa học"). */
  heading: string;
  /** Desktop column header ("KHÓA HỌC"). */
  columnLabel: string;
};

/**
 * All courses + category filter (plan/03 §8.2). Every row opens the Course program modal.
 * The chips are "Tất cả" + the CMS course categories that have a course, in their CMS order (DJ, MC, Producer, Flip).
 * - ≥ 1200px (`Academy / All seven courses · Editorial index` 2467:3671): chips, column headers and
 *   80px editorial rows (`Academy / Directory row / 0..6`, hover = ivory row, content nudged right).
 * - < 1200px (`Academy / Directory / Mobile` 2822:5002, Category=Tất cả/DJ/MC/Producer/Flip):
 *   "Tất cả khóa học", 44px chips and thumbnail rows (`Academy / Course row / Mobile` 2818:4724);
 *   two columns from 768px.
 */
export function CourseDirectory({ courses, categories, heading, columnLabel }: CourseDirectoryProps) {
  const filters = useMemo(() => [ALL, ...categories], [categories]);
  const [selected, setFilter] = useState(ALL);
  // A category that disappeared from the CMS falls back to "Tất cả".
  const filter = filters.includes(selected) ? selected : ALL;
  const visible = filter === ALL ? courses : courses.filter((course) => course.category === filter);

  return (
    <section aria-labelledby="course-directory-title" className="py-6 desktop:py-10">
      <Container data-reveal="stagger">
        <div className="hidden h-px bg-[#49382d] desktop:block" />
        <h2 id="course-directory-title" className="text-2xl leading-9 font-extrabold text-white desktop:sr-only">
          {heading}
        </h2>

        <div
          role="group"
          aria-label="Lọc khóa học theo nhóm"
          className="-mx-6 mt-4 scrollbar-none flex gap-2 overflow-x-auto px-6 tablet:mx-0 tablet:px-0 desktop:mt-0 desktop:h-[88px] desktop:items-center desktop:gap-3"
        >
          {filters.map((option) => {
            const active = option === filter;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(option)}
                className={cn(
                  "flex h-11 min-w-11 shrink-0 items-center justify-center rounded-[22px] px-4 text-xs leading-[18px] font-bold transition-colors duration-150",
                  "desktop:h-10 desktop:min-w-[72px] desktop:rounded-[20px] desktop:px-7 desktop:text-[13px] desktop:font-semibold",
                  active
                    ? "bg-accent text-ink desktop:bg-[#ff750a] desktop:text-[#160c05]"
                    : "bg-coal text-white hover:bg-[#261b13] desktop:bg-[#261b13] desktop:text-ivory desktop:hover:bg-[#3a2a1f]",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div
          aria-hidden
          className="hidden h-11 grid-cols-[48px_minmax(0,1fr)_190px_15px] items-center pr-[35px] pl-6 text-[11px] font-semibold text-[#bcae9f] desktop:grid"
        >
          <span className="col-span-2">{columnLabel}</span>
          <span>LỘ TRÌNH</span>
        </div>

        <ul
          data-reveal="stagger"
          aria-live="polite"
          className="mt-4 grid gap-2 tablet:grid-cols-2 tablet:gap-x-6 desktop:mt-0 desktop:grid-cols-1 desktop:gap-0 desktop:border-b desktop:border-[#49382d]"
        >
          {visible.map((course) => (
            <li key={course.id}>
              <DirectoryRow course={course} number={courses.indexOf(course) + 1} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function DirectoryRow({ course, number }: { course: AcademyCourse; number: number }) {
  const overlays = useAcademyOverlays();
  const nudge = "desktop:transition-transform desktop:duration-200 desktop:group-hover:translate-x-2";
  const darkOnHover = "desktop:transition-colors desktop:duration-200 desktop:group-hover:text-[#160c05]";

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`${course.title} — ${course.duration}. Xem nội dung khóa học`}
      onClick={() => overlays?.openProgram(course.id, registrationSources.directory)}
      className={cn(
        "group flex min-h-[116px] w-full items-center gap-4 py-3 text-left",
        "desktop:grid desktop:h-20 desktop:min-h-0 desktop:grid-cols-[48px_minmax(0,1fr)_190px_15px] desktop:gap-0 desktop:border-t desktop:border-[#49382d] desktop:py-0 desktop:pr-[35px] desktop:pl-6",
        "desktop:transition-colors desktop:duration-200 desktop:hover:border-ivory desktop:hover:bg-ivory",
      )}
    >
      <span className="relative size-20 shrink-0 overflow-hidden desktop:hidden">
        <Image src={course.image.src} alt="" fill sizes="80px" className="object-cover" />
      </span>

      <span className={cn("hidden text-[11px] leading-[1.4] font-medium text-[#ff750a] desktop:block", darkOnHover)}>
        {pad2(number)}
      </span>

      <span className={cn("flex min-w-0 flex-col gap-2 desktop:gap-1", nudge)}>
        <span className="text-base leading-6 font-bold text-white uppercase desktop:hidden">{course.title}</span>
        <span
          className={cn(
            "hidden truncate text-[21px] leading-[1.4] font-semibold text-ivory desktop:block",
            darkOnHover,
          )}
        >
          {course.title}
        </span>
        <span
          className={cn(
            "hidden text-[10px] leading-[1.4] font-medium text-[#bcae9f] uppercase desktop:block",
            darkOnHover,
          )}
        >
          {course.category}
        </span>
        <span className="text-sm leading-[21px] text-muted desktop:hidden">{course.duration}</span>
      </span>

      <span className={cn("hidden text-[13px] leading-[1.4] font-medium text-[#bcae9f] desktop:block", darkOnHover)}>
        {course.duration}
      </span>

      <span className="relative hidden h-[13px] w-[15px] transition-transform duration-200 group-hover:translate-x-1.5 desktop:block">
        <Icon name="academy-row-arrow" size={[15, 13]} className="absolute inset-0 group-hover:opacity-0" />
        <Icon
          name="academy-row-arrow-dark"
          size={[15, 13]}
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
        />
      </span>
    </button>
  );
}
