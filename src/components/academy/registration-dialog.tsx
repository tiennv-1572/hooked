"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type RefObject,
} from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  findCourse,
  registrationSources,
  type AcademyCourse,
  type RegistrationCopy,
} from "@/components/academy/academy-content";
import { CourseSelect } from "@/components/academy/course-select";
import { academyOverlayBackdrop, flowButtonVariants } from "@/components/academy/flow-button";
import { SUBMIT_ERROR, submitRegistration } from "@/components/academy/registration-api";
import { createRegistrationSchema, type RegistrationValues } from "@/components/academy/registration-schema";
import { restoreFocus } from "@/components/academy/restore-focus";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export type RegistrationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Courses offered in the selector (CMS order). */
  courses: AcademyCourse[];
  /** Dialog copy from the CMS (title, description, privacy note, success state). */
  copy: RegistrationCopy;
  /** Course pre-selected by the trigger (carousel slide, program modal…). Defaults to the first course. */
  courseId?: string;
  /** Where the dialog was opened, stored on the lead ("Academy · carousel"…). */
  source?: string;
  /** Element focused again when the dialog closes (the opener). */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * "Đăng ký tư vấn" overlay (Figma 70 · OVERLAYS / Registration states, 2341:1603).
 * State machine (plan/03 §1): Default → Focus → Error → Ready → Loading → Success.
 * - ≥ 1200px: 1040×744 dialog with the `Course / Context` panel on the left (Default 2039:249);
 *   Success collapses to a 760×592 dialog without the left panel and without "×" (2455:5383).
 * - < 1200px: full-screen sheet without the left panel (2455:5374 / Success 2455:5384).
 * The form content mounts with the dialog, so every opening starts from a fresh Default state.
 */
export function RegistrationDialog({
  open,
  onOpenChange,
  courses,
  copy,
  courseId,
  source = registrationSources.fallback,
  returnFocusRef,
}: RegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={copy.title}
        layout="sheet"
        overlayClassName={academyOverlayBackdrop}
        onCloseAutoFocus={(event) => restoreFocus(event, returnFocusRef)}
        className="bg-[#19130f] desktop:w-[1040px] desktop:max-w-[calc(100vw-48px)] desktop:rounded-[20px] desktop:border-[#49382d] desktop:has-[[data-success]]:w-[760px]"
      >
        <RegistrationFlow
          courses={courses}
          copy={copy}
          initialCourseId={findCourse(courses, courseId)?.id ?? ""}
          source={source}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

type RegistrationFlowProps = {
  courses: AcademyCourse[];
  copy: RegistrationCopy;
  initialCourseId: string;
  source: string;
  onClose: () => void;
};

function RegistrationFlow({ courses, copy, initialCourseId, source, onClose }: RegistrationFlowProps) {
  const [submittedCourse, setSubmittedCourse] = useState<string | null>(null);

  if (submittedCourse) {
    return <RegistrationSuccess course={findCourse(courses, submittedCourse)} copy={copy} onClose={onClose} />;
  }
  return (
    <RegistrationForm
      courses={courses}
      copy={copy}
      initialCourseId={initialCourseId}
      source={source}
      onSuccess={setSubmittedCourse}
    />
  );
}

function RegistrationForm({
  courses,
  copy,
  initialCourseId,
  source,
  onSuccess,
}: Omit<RegistrationFlowProps, "onClose"> & { onSuccess: (courseId: string) => void }) {
  const ids = useId();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const schema = useMemo(() => createRegistrationSchema(courses.map((course) => course.id)), [courses]);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(schema),
    defaultValues: { courseId: initialCourseId, name: "", phone: "", email: "", website: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Selected-course behavior: the left panel follows the selector.
  const selectedCourse = findCourse(courses, useWatch({ control, name: "courseId" }));

  const onSubmit = handleSubmit((values) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await submitRegistration({ ...values, source });
        if (result.ok) {
          onSuccess(result.courseId);
          return;
        }
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as keyof RegistrationValues, { message }, { shouldFocus: true });
        }
        setSubmitError(result.fieldErrors ? null : result.message);
      } catch {
        setSubmitError(SUBMIT_ERROR);
      }
    });
  });

  return (
    <div className="flex min-h-0 flex-1 desktop:h-[min(742px,calc(100dvh-50px))] desktop:flex-none">
      <CourseContext course={selectedCourse} />

      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <DialogClose
          aria-label="Đóng"
          className={cn(
            flowButtonVariants({ tone: "secondary" }),
            "absolute top-[18px] right-6 z-10 w-11 px-0 tablet:right-12 desktop:top-6 desktop:right-8",
          )}
        >
          <span aria-hidden>×</span>
        </DialogClose>

        <form
          noValidate
          onSubmit={onSubmit}
          aria-busy={isPending}
          className="mx-auto flex max-w-[656px] flex-col px-6 pt-6 pb-10 tablet:px-12 tablet:pt-6 desktop:mx-10 desktop:max-w-[608px] desktop:px-0 desktop:pt-8 desktop:pb-8"
        >
          <p className="pr-14 text-[28px] leading-[1.45] font-bold text-ivory desktop:pr-14 desktop:text-[34px]">
            {copy.title}
          </p>
          <p className="mt-2 text-sm leading-[1.45] text-[#bcae9f] desktop:mt-[7px]">{copy.description}</p>

          <fieldset disabled={isPending} className="contents">
            <p
              id={`${ids}-course`}
              className="mt-[22px] text-[13px] leading-[1.45] font-medium text-[#bcae9f] desktop:mt-10"
            >
              Khóa học quan tâm
            </p>
            <div className="relative mt-2">
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <CourseSelect
                    courses={courses}
                    labelId={`${ids}-course`}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    errorId={errors.courseId ? `${ids}-course-error` : undefined}
                  />
                )}
              />
              {errors.courseId ? (
                <p id={`${ids}-course-error`} className={fieldErrorClassName}>
                  {errors.courseId.message}
                </p>
              ) : null}
            </div>

            <div className="mt-7 flex flex-col gap-3.5 desktop:mt-6">
              <RegistrationField
                id={`${ids}-name`}
                label="Họ và tên *"
                placeholder="Nhập họ và tên"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />
              <RegistrationField
                id={`${ids}-phone`}
                label="Số điện thoại *"
                placeholder="Nhập số điện thoại"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <RegistrationField
                id={`${ids}-email`}
                label="Email (không bắt buộc)"
                placeholder="ban@email.com"
                type="email"
                inputMode="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Honeypot: invisible to people and assistive tech, bots fill it; the API rejects non-empty values. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="sr-only"
              {...register("website")}
            />
          </fieldset>

          <button
            type="submit"
            aria-disabled={isPending || undefined}
            onClick={(event) => {
              if (isPending) event.preventDefault();
            }}
            className={cn(flowButtonVariants({ tone: "primary" }), "mt-9 w-full desktop:mt-[38px]")}
          >
            {isPending ? "Đang gửi thông tin..." : "Gửi đăng ký tư vấn"}
          </button>
          <p role="alert" className="text-xs leading-[1.45] text-[#ff9e8b] empty:hidden">
            {submitError ? <span className="mt-3 block">{submitError}</span> : null}
          </p>

          <p className="mt-[18px] text-xs leading-[1.45] text-[#bcae9f] desktop:mt-5">{copy.privacyNote}</p>
          <p className="mt-[43px] text-xs leading-[1.45] font-medium text-[#ff750a] desktop:mt-[25px]">
            Chưa cần thanh toán ở bước này.
          </p>
        </form>
      </div>
    </div>
  );
}

type RegistrationFieldProps = ComponentProps<"input"> & { id: string; label: string; error?: string };

/** Field error under an input / the course selector (overlaps the gap below, no layout shift). */
const fieldErrorClassName = "absolute top-full left-0 -mt-0.5 text-[11px] leading-4 text-[#ff9e8b]";

/**
 * `Academy / Registration Field` (608 desktop / 342 mobile; 2455:5436): Default · Focus (2px orange) ·
 * Error (peach border + message) · Filled (ivory value).
 */
function RegistrationField({ id, label, error, className, ...props }: RegistrationFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="relative flex flex-col gap-2">
      <label htmlFor={id} className="font-inter text-[13px] leading-5 font-medium text-[#bcae9f]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-[58px] w-full rounded-lg border bg-[#231b16] px-4 font-inter text-[15px] leading-6 text-ivory transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-[#978a7e]",
          "focus:border-[#ff750a] focus:shadow-[inset_0_0_0_1px_#ff750a] focus-visible:outline-none disabled:opacity-100",
          error ? "border-[#ff9e8b]" : "border-[#49382d]",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className={fieldErrorClassName}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Desktop-only `Course / Context` panel (352px): atmosphere photo + the selected course. */
function CourseContext({ course }: { course: AcademyCourse | undefined }) {
  return (
    <div className="relative -my-px -ml-px hidden w-[352px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-[#100d0b] px-8 pt-[34px] pb-[74px] desktop:flex">
      <div aria-hidden className="absolute inset-0 opacity-[0.32]">
        <Image src="/images/photos/stage-lights.png" alt="" fill sizes="352px" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,1,1,0.97)_0%,rgba(5,1,1,0.86)_40%,rgba(5,1,1,0.86)_67%,rgba(5,1,1,0.12)_100%)]" />
      </div>
      <p className="relative text-[13px] leading-[1.45] font-bold text-[#ff750a]">HOOKED ACADEMY</p>
      <p className="relative mt-[65px] text-[30px] leading-[1.45] font-bold text-ivory">
        Hành trình âm nhạc
        <br />
        bắt đầu từ đây.
      </p>
      <div className="relative mt-auto h-px shrink-0 bg-[#49382d]" />
      <p className="relative mt-[27px] text-[11px] leading-[1.45] font-semibold text-[#ff750a]">KHÓA HỌC BẠN CHỌN</p>
      <p className="relative mt-3.5 text-2xl leading-[1.45] font-bold text-ivory uppercase">{course?.title}</p>
      <p className="relative mt-[91px] text-sm leading-[1.45] text-[#bcae9f]">
        Sau khi gửi, Hooked sẽ liên hệ để tư vấn lộ trình và lịch học phù hợp.
      </p>
    </div>
  );
}

/** Success (2455:5383 desktop / 2455:5384 mobile): ✓ mark, confirmation and the chosen course. */
function RegistrationSuccess({
  course,
  copy,
  onClose,
}: {
  course: AcademyCourse | undefined;
  copy: RegistrationCopy;
  onClose: () => void;
}) {
  const router = useRouter();
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  const onContinue = () => {
    onClose();
    // Assumption (plan/03 §1 Trigger): from another page, "Tiếp tục khám phá Academy" leads to /academy.
    if (window.location.pathname !== routes.academy) router.push(routes.academy);
  };

  return (
    <div
      data-success
      role="status"
      className="mx-auto flex w-full max-w-[656px] flex-1 flex-col overflow-y-auto px-6 pt-[108px] pb-10 tablet:px-12 desktop:max-w-none desktop:px-16 desktop:pt-[60px] desktop:pb-[58px]"
    >
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#ff750a] text-[26px] leading-none font-semibold text-[#160c05]"
      >
        ✓
      </span>
      <p className="mt-[26px] text-[32px] leading-[1.45] font-bold text-ivory desktop:text-[38px]">
        {copy.successTitleLines.map((line, index) => (
          <Fragment key={index}>
            {index > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </p>
      <p className="mt-3 text-base leading-[1.45] text-[#bcae9f] desktop:mt-3.5">{copy.successBody}</p>
      <p className="mt-[50px] text-[11px] leading-[1.45] font-semibold text-[#ff750a] desktop:mt-[67px]">
        KHÓA HỌC BẠN QUAN TÂM
      </p>
      <p className="mt-3 text-xl leading-[1.45] font-bold text-ivory uppercase">{course?.title}</p>
      <button
        ref={continueRef}
        type="button"
        onClick={onContinue}
        className={cn(flowButtonVariants({ tone: "primary" }), "mt-[150px] w-full shrink-0 desktop:mt-[69px]")}
      >
        Tiếp tục khám phá Academy
      </button>
    </div>
  );
}
