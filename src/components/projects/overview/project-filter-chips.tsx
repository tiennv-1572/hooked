"use client";

import { useEffect, useRef } from "react";

import type { ProjectFilterOption } from "@/components/projects/project-content";
import { cn } from "@/lib/utils";

type ProjectFilterChipsProps = {
  filters: ProjectFilterOption[];
  /** Id of the active chip (`ALL_PROJECTS` or a category slug). */
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Service filters (FilteredGallery "Service filters", 2221:2628 desktop / 2221:2842 mobile) built from
 * Projects / FilterChip (2218:484): 44px pill, Default = surface + muted text, Hover = accent + ivory text,
 * Active = accent + ink text, ActiveHover = Active at 86% opacity.
 *
 * Single-select toggle buttons (`aria-pressed`). The row scrolls horizontally when the chips are wider than
 * the column (mobile / tablet) and bleeds into the page gutter; the active chip is scrolled into view.
 */
export function ProjectFilterChips({ filters, value, onChange, className }: ProjectFilterChipsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const chip = scroller?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!scroller || !chip) return;
    const style = getComputedStyle(scroller);
    const start = chip.offsetLeft - parseFloat(style.paddingLeft);
    const end = chip.offsetLeft + chip.offsetWidth + parseFloat(style.paddingRight) - scroller.clientWidth;
    if (scroller.scrollLeft > start) scroller.scrollTo({ left: start });
    else if (scroller.scrollLeft < end) scroller.scrollTo({ left: end });
  }, [value]);

  return (
    <div
      ref={scrollerRef}
      role="group"
      aria-label="Lọc dự án theo dịch vụ"
      className={cn(
        // Extra 5px block padding keeps the focus ring (2px + 3px offset) visible inside the scroller.
        "relative -mx-6 -my-1.25 scrollbar-none flex scroll-px-6 gap-2.5 overflow-x-auto overscroll-x-contain px-6 py-1.25 tablet:-mx-12 tablet:scroll-px-12 tablet:px-12 desktop:mx-0 desktop:scroll-px-0 desktop:px-0",
        className,
      )}
    >
      {filters.map((filter) => {
        const active = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "h-11 shrink-0 rounded-[23px] border px-4.25 text-sm leading-4.5 font-semibold whitespace-nowrap",
              "transition-[background-color,border-color,color,opacity] duration-150",
              active
                ? "border-transparent bg-accent text-ink hover:border-accent hover:opacity-86"
                : "border-transparent bg-surface text-muted hover:border-accent hover:bg-accent hover:text-ivory",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
