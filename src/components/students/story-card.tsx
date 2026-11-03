import type { MouseEvent } from "react";

import { Icon } from "@/components/ui/icon";
import { studentRoleLabel, studentStoryHref, type Student } from "@/data/students";
import { pad2 } from "@/lib/utils";

import { StudentPhoto } from "./student-photo";

type StoryCardProps = {
  student: Student;
  /** Zero-based grid position, shown as "01 / HOOKED" on desktop. */
  index: number;
  /** "Xem câu chuyện" (`studentsPage.readLabel`). */
  readLabel: string;
  /** Opens the reader in place. Without it the card is a plain deep link (`?story=<slug>`). */
  onOpen?: (slug: string) => void;
  /** Load the portrait eagerly (first row). */
  eager?: boolean;
};

const isModifiedClick = (event: MouseEvent) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

/**
 * Student story card.
 * - Desktop (`Stories / Card hover / Story / <NAME>` 2480:3772 … 2480:4732): 381×520 full-bleed portrait,
 *   bottom contrast gradient, "NN / HOOKED" + round ↗ indicator, name / role / "Xem câu chuyện →".
 *   Hover: portrait zooms ~4%, name turns light orange, ↗ nudges up-right.
 * - Mobile (`Stories / Portrait card / Mobile` 2815:4704, 165×286) and tablet (`… / Tablet` 2828:5098, 293×456):
 *   portrait with the copy stacked underneath and an accent "Xem câu chuyện".
 * It is a real link to `?story=<slug>` (new tab / share keep working); a plain click opens the reader in place.
 */
export function StoryCard({ student, index, readLabel, onOpen, eager = false }: StoryCardProps) {
  const roleLabel = studentRoleLabel(student);

  return (
    <a
      href={studentStoryHref(student.slug)}
      aria-haspopup="dialog"
      aria-label={`${readLabel} của ${student.name} — ${roleLabel}`}
      onClick={(event) => {
        if (!onOpen || event.defaultPrevented || isModifiedClick(event)) return;
        event.preventDefault();
        onOpen(student.slug);
      }}
      className="group relative flex flex-col gap-2 text-left desktop:block desktop:aspect-[381.333/520] desktop:overflow-hidden desktop:rounded-[15px] desktop:bg-surface"
    >
      <div className="relative aspect-[165/198] overflow-hidden rounded-[4px] bg-surface tablet:aspect-[293/352] desktop:absolute desktop:inset-0 desktop:aspect-auto desktop:rounded-none">
        <StudentPhoto
          portrait={student.portrait}
          sizes="(min-width: 1200px) 382px, (min-width: 768px) 31vw, (min-width: 348px) 46vw, 100vw"
          loading={eager ? "eager" : undefined}
          fetchPriority={index === 0 ? "high" : undefined}
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
        {/* Contrast / Bottom gradient (desktop overlay copy only) */}
        <span className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(5,2,1,0)_0%,rgba(5,2,1,0.08)_42%,rgba(5,2,1,0.66)_70%,#050201_100%)] desktop:block" />
      </div>

      {/* Card / Top chrome */}
      <div className="absolute inset-x-0 top-0 hidden items-start justify-between px-6 pt-6 desktop:flex">
        <span className="text-sm leading-[22px] text-white">{pad2(index + 1)} / HOOKED</span>
        <span className="flex size-9 items-center justify-center rounded-full border border-white/35 bg-black/32">
          <Icon
            name="students-arrow-up-right"
            size={18}
            className="transition-transform duration-150 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
          />
        </span>
      </div>

      {/* Card / Editorial copy */}
      <div className="flex flex-col gap-2 desktop:absolute desktop:inset-x-0 desktop:bottom-0 desktop:px-6 desktop:pb-6">
        <span className="text-lg leading-[27px] font-extrabold text-white transition-colors duration-150 group-hover:text-[#ffbf7d] tablet:text-2xl tablet:leading-[30px] desktop:text-[28px] desktop:leading-9">
          {student.name}
        </span>
        <span className="text-xs leading-[18px] text-muted tablet:text-sm tablet:leading-[21px] desktop:leading-[22px]">
          {roleLabel}
        </span>
        <span className="text-xs leading-[18px] font-semibold text-accent tablet:text-sm tablet:leading-[21px] desktop:text-base desktop:leading-6 desktop:text-white">
          {readLabel}
          <span className="hidden desktop:inline"> →</span>
        </span>
      </div>
    </a>
  );
}
