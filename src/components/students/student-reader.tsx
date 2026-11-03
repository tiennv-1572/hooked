"use client";

import { useRef, useState, type ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { RichHtml } from "@/components/ui/rich-html";
import { studentRoleLabel, type Student } from "@/data/students";
import { cn } from "@/lib/utils";

import { StudentPhoto } from "./student-photo";

/** Reader copy (`studentsPage` in src/data/students.ts). */
export type StudentReaderLabels = {
  /** Page title, part of the dialog's accessible name ("KIMMY — Học viên tiêu biểu"). */
  title: string;
  /** Mobile close bar label ("HỌC VIÊN TIÊU BIỂU"). */
  readerLabel: string;
};

type StudentReaderDialogProps = {
  /** Student to show; `undefined` closes the reader. */
  student: Student | undefined;
  labels: StudentReaderLabels;
  onClose: () => void;
};

/**
 * Student reader overlay (Figma 72 · OVERLAYS / Student readers 2815:4693; runtime 90.3 2494:3834).
 * - Desktop ≥1200 (`Story popup / Article` 2071:209): 1120×482 dialog, 400px portrait left, reading column
 *   with gradient name, outline "Đóng ×", role and story.
 * - Mobile (`Stories / Reader / Mobile` 2815:4714): full screen, fixed 64px close bar and an independently
 *   scrolling article. Tablet uses the same 390px reader centered (04 · RESPONSIVE "STORY READER").
 * Controlled: pass the student to open it. Esc / backdrop / "Đóng ×" call `onClose`.
 */
export function StudentReaderDialog({ student, labels, onClose }: StudentReaderDialogProps) {
  // Keep the last student rendered while the dialog fades out after `student` became undefined.
  const [shown, setShown] = useState(student);
  if (student && student !== shown) setShown(student);

  // The reader is opened programmatically (no Radix Trigger), so we restore focus to the opener ourselves.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  return (
    <Dialog
      open={Boolean(student)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {shown ? (
        <StudentReaderContent
          student={shown}
          labels={labels}
          onOpenAutoFocus={(event) => {
            const opener = document.activeElement;
            returnFocusRef.current = opener instanceof HTMLElement && opener !== document.body ? opener : null;
            // Focus the dialog itself: screen readers announce the title, no focus ring lands on "Đóng ×".
            event.preventDefault();
            if (event.currentTarget instanceof HTMLElement) event.currentTarget.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
            returnFocusRef.current = null;
          }}
        />
      ) : null}
    </Dialog>
  );
}

type StudentReaderContentProps = Pick<ComponentProps<typeof DialogContent>, "onOpenAutoFocus" | "onCloseAutoFocus"> & {
  student: Student;
  labels: StudentReaderLabels;
};

function StudentReaderContent({ student, labels, ...focusHandlers }: StudentReaderContentProps) {
  return (
    <DialogContent
      {...focusHandlers}
      layout="sheet"
      title={`${student.name} — ${labels.title}`}
      overlayClassName="bg-black/72"
      className={cn(
        "bg-ink",
        // Tablet: the 390px mobile reader, centered.
        "tablet:inset-auto tablet:top-1/2 tablet:left-1/2 tablet:h-[min(844px,calc(100dvh-48px))] tablet:w-[390px] tablet:-translate-1/2 tablet:rounded-2xl tablet:border tablet:border-white/10",
        // Desktop: Story popup / Article — warm surface, copper hairline, Card depth shadow.
        "desktop:h-auto desktop:w-[min(1120px,calc(100vw-48px))] desktop:rounded-[15px] desktop:border-copper/40 desktop:bg-[linear-gradient(150deg,#241910_14.286%,#17110d_57.143%,var(--color-coal)_85.714%)] desktop:shadow-[0_0_32px_-8px_rgba(229,86,36,0.13),0_20px_40px_-12px_rgba(0,0,0,0.45)]",
      )}
    >
      {/* Reader / Fixed header (mobile + tablet) */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 desktop:hidden">
        <p className="text-xs leading-[18px] font-semibold text-muted">{labels.readerLabel}</p>
        <ReaderCloseButton className="w-[100px] px-3" />
      </div>

      {/* Reader / Scroll viewport */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain desktop:flex desktop:overflow-hidden">
        <article className="flex flex-col gap-6 px-6 pt-4 pb-10 desktop:min-h-[min(480px,calc(100dvh-50px))] desktop:flex-1 desktop:flex-row desktop:gap-0 desktop:p-0">
          {/* Story popup / Student photo — Reader / Portrait */}
          <div className="relative aspect-[342/410] shrink-0 overflow-hidden rounded-[4px] bg-surface desktop:aspect-auto desktop:w-[400px] desktop:rounded-none">
            <StudentPhoto
              portrait={student.portrait}
              sizes="(min-width: 1200px) 400px, (min-width: 768px) 342px, calc(100vw - 48px)"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          {/* Story popup / Reading column */}
          <div className="flex flex-col gap-6 desktop:min-w-0 desktop:flex-1 desktop:overflow-y-auto desktop:overscroll-contain desktop:p-10">
            <div className="desktop:flex desktop:items-center desktop:justify-between desktop:gap-6">
              <p className="text-[32px] leading-9 font-extrabold text-white desktop:bg-linear-to-r desktop:from-ivory desktop:to-white desktop:bg-clip-text desktop:text-4xl desktop:leading-12 desktop:tracking-[-0.03em] desktop:text-transparent">
                {student.name}
              </p>
              <ReaderCloseButton className="hidden w-[116px] desktop:inline-flex" />
            </div>
            <p className="text-sm leading-[21px] font-semibold text-accent desktop:text-base desktop:leading-6 desktop:font-normal desktop:text-muted">
              {studentRoleLabel(student)}
            </p>
            <RichHtml
              html={student.story}
              className="gap-[26px] text-base leading-[26px] text-white desktop:gap-7 desktop:text-lg desktop:leading-7 desktop:text-muted"
            />
          </div>
        </article>
      </div>
    </DialogContent>
  );
}

/** `Academy / Button / Secondary` (189:10) used as the reader "Đóng ×". */
function ReaderCloseButton({ className }: { className?: string }) {
  return (
    <DialogClose asChild>
      <Button variant="outline" size="md" className={cn("h-11 rounded-[15px] border-line px-6 text-white", className)}>
        Đóng <span aria-hidden>×</span>
      </Button>
    </DialogClose>
  );
}
