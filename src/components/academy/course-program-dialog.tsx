"use client";

import type { ReactNode, RefObject } from "react";

import type { AcademyCourse } from "@/components/academy/academy-content";
import { academyOverlayBackdrop, flowButtonVariants } from "@/components/academy/flow-button";
import { InfoLines } from "@/components/academy/info-lines";
import { restoreFocus } from "@/components/academy/restore-focus";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn, pad2 } from "@/lib/utils";

type CourseProgramDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: AcademyCourse;
  /** "Đăng ký tư vấn" — the parent swaps this modal for Registration with the same course. */
  onRegister: (courseId: string) => void;
  /** Element focused again when the dialog closes (the opener). */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

const gutters = "px-6 tablet:px-[max(48px,calc((100%-672px)/2))] desktop:px-10";

/**
 * Course program & benefits (Figma 71 · OVERLAYS / Course programs, 2494:3835; one per course).
 * - ≥ 1200px (`Program & benefits / Dialog` 2452:4227, 1120×792): numbered modules + ✓ benefits in an
 *   internal scroll area, `Course / Summary` panel on the right (tuition, instructors, schedule, CTA).
 * - < 1200px (2452:4297): full-screen sheet, plain text sections and a sticky tuition + CTA bar.
 */
export function CourseProgramDialog({
  open,
  onOpenChange,
  course,
  onRegister,
  returnFocusRef,
}: CourseProgramDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={course.title}
        layout="sheet"
        overlayClassName={academyOverlayBackdrop}
        onCloseAutoFocus={(event) => restoreFocus(event, returnFocusRef)}
        className="bg-[#100d0b] desktop:h-[792px] desktop:w-[1120px] desktop:max-w-[calc(100vw-48px)] desktop:rounded-[20px] desktop:border-[#49382d] desktop:bg-[#19130f]"
      >
        <header
          className={cn(
            gutters,
            "relative shrink-0 pt-6 pr-[84px] tablet:pr-[calc(max(48px,calc((100%-672px)/2))+60px)] desktop:pt-7 desktop:pr-[180px]",
          )}
        >
          <p className="text-[11px] leading-[1.45] font-semibold text-[#ff750a] desktop:text-xs">
            HOOKED ACADEMY<span className="hidden desktop:inline"> / KHÓA HỌC</span>
          </p>
          <p
            aria-hidden
            className="mt-2.5 text-[26px] leading-[1.45] font-bold text-ivory uppercase desktop:mt-[7px] desktop:text-4xl desktop:leading-[1.25]"
          >
            {course.title}
          </p>
          <DialogClose
            aria-label="Đóng"
            className={cn(
              flowButtonVariants({ tone: "secondary" }),
              "absolute top-5 right-6 w-11 px-0 tablet:right-[max(48px,calc((100%-672px)/2))] desktop:top-7 desktop:right-10 desktop:w-[116px]",
            )}
          >
            <span aria-hidden className="desktop:hidden">
              ×
            </span>
            <span aria-hidden className="hidden desktop:inline">
              Đóng ×
            </span>
          </DialogClose>
        </header>

        <div className="flex min-h-0 flex-1 flex-col desktop:mt-[33px] desktop:grid desktop:grid-cols-[minmax(0,1fr)_336px] desktop:gap-8 desktop:px-10 desktop:pb-10">
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              role="region"
              aria-label="Chương trình học và quyền lợi"
              tabIndex={0}
              className={cn(
                gutters,
                "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-[30px] pb-8 focus-visible:outline-offset-[-2px] desktop:pt-0 desktop:pr-6 desktop:pb-0 desktop:pl-0",
              )}
            >
              <ProgramContent course={course} />
            </div>
            <p className="mt-[34px] mb-[17px] hidden text-xs leading-[1.45] text-[#bcae9f] desktop:block">
              Cuộn để xem đầy đủ chương trình và quyền lợi
            </p>
          </div>

          {/* Desktop summary */}
          <aside
            aria-label="Thông tin khóa học"
            className="hidden flex-col rounded-xl bg-[#231b16] px-6 pt-6 pb-[27px] desktop:flex"
          >
            <p className="text-[13px] leading-[1.45] font-medium text-[#bcae9f]">Học phí</p>
            <p className="mt-[5px] text-[26px] leading-[1.45] font-bold text-ivory">{course.tuition}</p>
            <p className="mt-1 text-xs leading-[1.45] text-[#bcae9f]">Chi phí chưa bao gồm 8% VAT</p>
            <div className="mt-[21px] h-px shrink-0 bg-[#49382d]" />
            <dl className="mt-[23px] flex flex-col gap-[18px]">
              <SummaryItem term="Giảng viên">
                <InfoLines lines={course.instructors} boldLabels={false} />
              </SummaryItem>
              <SummaryItem term="Lộ trình">{course.duration}</SummaryItem>
              <SummaryItem term="Giờ học">
                <InfoLines lines={course.schedule} />
              </SummaryItem>
            </dl>
            <button
              type="button"
              onClick={() => onRegister(course.id)}
              className={cn(flowButtonVariants({ tone: "primary" }), "mt-auto w-full shrink-0")}
            >
              Đăng ký tư vấn
            </button>
            <p className="mt-3 text-xs leading-[1.45] text-[#bcae9f]">Đăng ký tư vấn, chưa cần thanh toán.</p>
          </aside>
        </div>

        {/* Mobile / tablet sticky action bar */}
        <div
          className={cn(
            gutters,
            "flex shrink-0 items-center justify-between gap-4 border-t border-[#49382d] pt-[18px] pb-[max(24px,env(safe-area-inset-bottom))] desktop:hidden",
          )}
        >
          <div className="min-w-0">
            <p className="text-lg leading-[1.45] font-bold text-ivory">{course.tuition}</p>
            <p className="mt-[5px] text-[11px] leading-[1.45] text-[#bcae9f]">Chưa gồm 8% VAT</p>
          </div>
          <button
            type="button"
            onClick={() => onRegister(course.id)}
            className={cn(flowButtonVariants({ tone: "primary" }), "w-[162px] shrink-0 px-4 text-sm")}
          >
            Đăng ký tư vấn
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <dt className="text-xs leading-[1.45] font-bold text-[#bcae9f]">{term}</dt>
      <dd className="text-sm leading-[1.45] font-medium text-ivory">{children}</dd>
    </div>
  );
}

const sectionHeading = "text-xl leading-[1.45] font-bold text-ivory desktop:text-2xl";
const mobileBody = "mt-[9px] text-sm leading-[1.45] text-[#bcae9f]";

/** Scrollable program body shared by both layouts. */
function ProgramContent({ course }: { course: AcademyCourse }) {
  return (
    <div className="flex flex-col gap-7 desktop:max-w-[628px] desktop:gap-0">
      <section>
        <h3 className={cn(sectionHeading, "desktop:sr-only")}>Tổng quan</h3>
        <p className={cn(mobileBody, "desktop:mt-0 desktop:text-[15px]")}>{course.description}</p>
      </section>

      <section className="desktop:mt-7">
        <h3 className={sectionHeading}>Chương trình học</h3>
        <ol className={cn(mobileBody, "desktop:mt-[11px] desktop:flex desktop:flex-col desktop:gap-[11px]")}>
          {course.modules.map((module, index) => (
            <li key={module} className="desktop:flex desktop:gap-4">
              <span className="hidden w-8 shrink-0 pt-0.5 text-[13px] leading-[1.45] font-semibold text-[#ff750a] desktop:block">
                {pad2(index + 1)}
              </span>
              <span className="desktop:flex-1 desktop:border-b desktop:border-[#49382d] desktop:pb-2.5 desktop:text-[15px] desktop:text-ivory">
                {module}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="desktop:mt-[37px]">
        <h3 className={sectionHeading}>Quyền lợi học viên</h3>
        <ul className={cn(mobileBody, "desktop:mt-[13px] desktop:flex desktop:flex-col desktop:gap-[18px]")}>
          {course.benefits.map((benefit) => (
            <li key={benefit} className="desktop:flex desktop:gap-3">
              <span
                aria-hidden
                className="hidden w-6 shrink-0 text-base leading-[1.45] font-semibold text-[#ff750a] desktop:block"
              >
                ✓
              </span>
              <span className="desktop:text-[15px] desktop:text-ivory">{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Mobile lists the summary facts inside the scroll area (desktop shows them in the side panel). */}
      <section className="desktop:hidden">
        <h3 className={sectionHeading}>Giảng viên</h3>
        <div className={mobileBody}>
          <InfoLines lines={course.instructors} boldLabels={false} />
        </div>
      </section>
      <section className="desktop:hidden">
        <h3 className={sectionHeading}>Lộ trình</h3>
        <p className={mobileBody}>{course.duration}</p>
      </section>
      <section className="desktop:hidden">
        <h3 className={sectionHeading}>Giờ học</h3>
        <div className={mobileBody}>
          <InfoLines lines={course.schedule} />
        </div>
      </section>
    </div>
  );
}
