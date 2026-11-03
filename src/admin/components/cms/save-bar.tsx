"use client";

import { Save, Undo2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/admin/components/ui/button";
import { Kbd } from "@/admin/components/ui/kbd";
import { Spinner } from "@/admin/components/ui/spinner";
import { cn } from "@/lib/utils";

type SaveBarProps = {
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  /** Submit button `form` attribute target. */
  formId: string;
  saveLabel?: string;
  /** Number of validation errors to surface. */
  errorCount?: number;
};

/**
 * Sticky footer of editors: unsaved-changes state, discard, save (⌘S / Ctrl+S).
 * Also warns before leaving the page with unsaved changes.
 */
export function SaveBar({
  isDirty,
  isSaving,
  onDiscard,
  formId,
  saveLabel = "Lưu thay đổi",
  errorCount = 0,
}: SaveBarProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit();
      }
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [formId, isDirty]);

  return (
    <div className="bg-background/85 sticky bottom-0 z-20 -mx-4 mt-2 border-t px-4 py-3 backdrop-blur-md md:-mx-6 md:px-6">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 text-sm">
          <span className={cn("size-2 rounded-full", isDirty ? "bg-warning" : "bg-success")} />
          {errorCount ? (
            <span className="text-destructive">Còn {errorCount} trường chưa hợp lệ</span>
          ) : isDirty ? (
            "Có thay đổi chưa lưu"
          ) : (
            <span className="text-muted-foreground">Đã lưu mọi thay đổi</span>
          )}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" disabled={!isDirty || isSaving} onClick={onDiscard}>
            <Undo2 /> Hoàn tác
          </Button>
          <Button type="submit" form={formId} disabled={isSaving || !isDirty}>
            {isSaving ? <Spinner /> : <Save />}
            {saveLabel}
            <Kbd className="bg-primary-foreground/20 text-primary-foreground ml-1 hidden sm:inline-flex">⌘S</Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
