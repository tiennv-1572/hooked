"use client";

import { Type } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Input } from "@/admin/components/ui/input";
import { Spinner } from "@/admin/components/ui/spinner";

/** Click-to-rename label: Enter / blur saves, Escape cancels. */
export function InlineLabel({
  label,
  isTaken,
  onSave,
  emptyMessage = "Nhập tên danh mục.",
}: {
  label: string;
  isTaken: (label: string) => boolean;
  onSave: (label: string) => Promise<void>;
  /** Shown when the field is emptied. */
  emptyMessage?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const [saving, setSaving] = useState(false);
  const cancelled = useRef(false);
  const clean = draft.trim();
  const error = !clean ? emptyMessage : clean !== label && isTaken(clean) ? "Tên này đã tồn tại." : null;

  const commit = async () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (error || clean === label) {
      setDraft(label);
      setEditing(false);
      if (error && clean) toast.error(error);
      return;
    }
    setSaving(true);
    try {
      await onSave(clean);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(label);
          setEditing(true);
        }}
        className="group/label hover:text-primary focus-visible:ring-ring flex min-w-0 items-center gap-1.5 rounded-md text-left text-sm font-medium outline-none focus-visible:ring-2"
        title="Bấm để đổi tên"
      >
        <span className="truncate">{label}</span>
        <Type className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover/label:opacity-60 group-focus-visible/label:opacity-60" />
      </button>
    );
  }
  return (
    <div className="flex min-w-0 items-center gap-2 sm:w-72">
      <Input
        autoFocus
        value={draft}
        disabled={saving}
        aria-label="Tên danh mục"
        aria-invalid={error ? true : undefined}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            cancelled.current = true;
            setDraft(label);
            setEditing(false);
          }
        }}
        className="h-7"
      />
      {saving ? <Spinner className="size-3.5" /> : null}
    </div>
  );
}
