"use client";

import { useRef, useState, type ComponentProps } from "react";

import { useAcademyOverlays } from "@/components/academy/academy-overlays";
import { RegistrationDialog, type RegistrationDialogProps } from "@/components/academy/registration-dialog";
import { buttonVariants, type ButtonVariantProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RegisterButtonProps = Omit<ComponentProps<"button">, "type" | "onClick"> & {
  /** Course pre-selected in the form (defaults to the first course). */
  courseId?: string;
  /** Where the form was opened, stored on the lead ("Academy · carousel"). */
  source?: string;
  /**
   * Courses + copy for the button's own dialog, needed only outside `<AcademyOverlays>` (which already has them).
   * Pass what the page got from `getCourses()` / `getAcademyPage()` (see src/server/content/views/academy.ts).
   */
  dialog?: Pick<RegistrationDialogProps, "courses" | "copy">;
  /** Shared Button variant; `"plain"` applies only `className`. Defaults to the copper `cta` gradient. */
  variant?: ButtonVariantProps["variant"] | "plain";
  size?: ButtonVariantProps["size"];
};

/**
 * Opens the "Đăng ký tư vấn" Registration dialog (Figma 70 · OVERLAYS 2341:1603) for `courseId`.
 * Inside the Academy page it reuses the page-level dialog (`<AcademyOverlays>`); anywhere else it renders
 * its own dialog instance from `dialog`, so other pages can drop it in directly:
 *
 *   <RegisterButton courseId="mc-co-ban" source="Trang chủ · Academy" dialog={{ courses, copy }}>Đăng ký ngay</RegisterButton>
 */
export function RegisterButton({
  courseId,
  source,
  dialog,
  variant = "cta",
  size,
  className,
  children,
  ...props
}: RegisterButtonProps) {
  const overlays = useAcademyOverlays();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => (overlays ? overlays.openRegistration(courseId, source) : setOpen(true))}
        className={variant === "plain" ? className : cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
      {overlays || !dialog ? null : (
        <RegistrationDialog
          open={open}
          onOpenChange={setOpen}
          courses={dialog.courses}
          copy={dialog.copy}
          courseId={courseId}
          source={source}
          returnFocusRef={buttonRef}
        />
      )}
    </>
  );
}
