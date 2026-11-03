"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { useRef, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared overlay shell (Figma overlays 70–74): black dismiss backdrop + rounded dialog.
 * Radix gives us focus trap, Esc to close, scroll lock, focus return and `aria-modal`.
 *
 * Usage:
 *   <Dialog open={open} onOpenChange={setOpen}>
 *     <DialogContent title="…" layout="sheet">…</DialogContent>
 *   </Dialog>
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;

type DialogContentProps = Omit<ComponentProps<typeof RadixDialog.Content>, "title"> & {
  /** Accessible dialog title. Rendered visually hidden unless `showTitle`. */
  title: ReactNode;
  showTitle?: boolean;
  /**
   * - `centered` (default): centered panel on every breakpoint (lightboxes: 358px on mobile).
   * - `sheet`: full-screen on mobile/tablet, centered panel from 1200px (registration, course program, reader).
   */
  layout?: "centered" | "sheet";
  /** Classes for the dark backdrop. */
  overlayClassName?: string;
};

export function DialogContent({
  title,
  showTitle = false,
  layout = "centered",
  className,
  overlayClassName,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: DialogContentProps) {
  // Controlled dialogs opened without a <DialogTrigger> would drop focus on <body> when closing:
  // remember what had focus when the dialog opened and give it back (unless the caller handles it).
  const returnFocusTo = useRef<HTMLElement | null>(null);

  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className={cn(
          "fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in",
          overlayClassName,
        )}
      />
      <RadixDialog.Content
        aria-describedby={undefined}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-surface text-white outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in",
          layout === "sheet"
            ? "inset-0 desktop:inset-auto desktop:top-1/2 desktop:left-1/2 desktop:max-h-[calc(100dvh-48px)] desktop:-translate-1/2 desktop:rounded-2xl desktop:border desktop:border-white/10"
            : "top-1/2 left-1/2 max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] -translate-1/2 rounded-2xl border border-white/10",
          className,
        )}
        onOpenAutoFocus={(event) => {
          returnFocusTo.current = document.activeElement as HTMLElement | null;
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          const target = returnFocusTo.current;
          returnFocusTo.current = null;
          if (event.defaultPrevented) return;
          if (target && target !== document.body && document.contains(target)) {
            event.preventDefault();
            target.focus();
          }
        }}
        {...props}
      >
        <RadixDialog.Title className={showTitle ? undefined : "sr-only"}>{title}</RadixDialog.Title>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

/** 44px round close button (QA 91: ivory default, accent on hover). */
export function DialogCloseButton({ className, label = "Đóng" }: { className?: string; label?: string }) {
  return (
    <RadixDialog.Close
      aria-label={label}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-ivory text-ink transition-colors duration-150 hover:bg-accent",
        className,
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </RadixDialog.Close>
  );
}
