"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import type { AcademyCourse } from "@/components/academy/academy-content";
import { flowButtonVariants } from "@/components/academy/flow-button";
import { cn, wrapIndex } from "@/lib/utils";

type CourseSelectProps = {
  /** The options, in CMS order. */
  courses: AcademyCourse[];
  value: string;
  onChange: (value: string) => void;
  /** id of the visible "Khóa học quan tâm" label. */
  labelId: string;
  disabled?: boolean;
  onBlur?: () => void;
  /** id of the error message shown under the selector (described by it, peach border). */
  errorId?: string;
};

/**
 * "Khóa học quan tâm" selector (Figma `Course / Selector` 2455:5412 + `Course / Seven options` 2455:5515).
 * Collapsed: warm field with the selected course and an orange chevron. Open: the course choices
 * styled as secondary flow buttons (hover = warm fill, orange border/label).
 * Keyboard: ↑/↓/Home/End move, Enter/Space pick, Esc/Tab close (Esc does not close the dialog).
 */
export function CourseSelect({ courses, value, onChange, labelId, disabled, onBlur, errorId }: CourseSelectProps) {
  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(
    0,
    courses.findIndex((course) => course.id === value),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };

  const pick = (index: number) => {
    onChange(courses[index].id);
    close();
  };

  // Move focus into the list when it opens; close on outside pointer down.
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    // Capture on window runs before Radix's document-level Escape handler, so Esc only closes the list.
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape, { capture: true });
    };
  }, [open]);

  // Keep the active option visible while navigating with the keyboard.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listId]);

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList();
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => wrapIndex(index + 1, courses.length));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => wrapIndex(index - 1, courses.length));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(courses.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        pick(activeIndex);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={labelId}
        aria-describedby={errorId}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onButtonKeyDown}
        onBlur={onBlur}
        className={cn(
          "flex min-h-14 w-full items-center gap-4 rounded-lg border bg-[#231b16] py-2 pr-4 pl-4 text-left transition-colors duration-150",
          errorId ? "border-[#ff9e8b]" : "border-[#49382d]",
          "hover:border-[#6b5442] focus-visible:border-[#ff750a] focus-visible:shadow-[inset_0_0_0_1px_#ff750a] focus-visible:outline-none",
          open && "border-[#ff750a]",
        )}
      >
        <span className="min-w-0 flex-1 text-[13px] leading-[1.45] font-semibold text-ivory uppercase desktop:text-[15px]">
          {courses[selectedIndex]?.title}
        </span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden
          className={cn("shrink-0 text-[#ff750a] transition-transform duration-150", open && "rotate-180")}
        >
          <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={optionId(activeIndex)}
          onKeyDown={onListKeyDown}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-20 flex max-h-[min(372px,60dvh)] flex-col gap-0.5 overflow-y-auto rounded-xl border border-[#49382d] bg-[#100d0b] p-2 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] outline-none"
        >
          {courses.map((course, index) => {
            const selected = index === selectedIndex;
            const active = index === activeIndex;
            return (
              <li
                key={course.id}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                onClick={() => pick(index)}
                onPointerMove={() => setActiveIndex(index)}
                className={cn(
                  flowButtonVariants({ tone: "secondary" }),
                  "h-auto min-h-12 shrink-0 cursor-pointer px-4 py-2 text-center uppercase",
                  (active || selected) && "border-[#ff750a] bg-[#302116] text-[#ff750a]",
                )}
              >
                {course.title}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
