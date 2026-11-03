"use client";

import { Check, ListFilter } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { Controller, get, useFormContext } from "react-hook-form";

import type { SelectOption } from "@/admin/components/cms/form-fields";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Separator } from "@/admin/components/ui/separator";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { InfoLine, LeadStatus } from "@/admin/lib/cms/types/academy";
import { cn } from "@/lib/utils";

/*
 * Shared pieces of the Academy module (courses, students, leads, Academy / Students page copy).
 */

/** Course categories ("Danh mục khóa học", CMS order) as select options, plus an id → label lookup. */
export function useCourseCategories() {
  const { data, isLoading } = useCollection("courseCategories");
  return useMemo(() => {
    const list = data ?? [];
    const options: SelectOption[] = list.map((category) => ({ value: category.id, label: category.label }));
    const labels = new Map(list.map((category) => [category.id, category.label]));
    return { list, options, labelOf: (id: string | undefined) => (id ? labels.get(id) : undefined), isLoading };
  }, [data, isLoading]);
}

export const publishFilterOptions = [
  { label: "Đã xuất bản", value: "published" },
  { label: "Bản nháp", value: "draft" },
];

/** Status workflow order used by selects, KPI and the detail sheet. */
export const LEAD_FLOW: LeadStatus[] = ["new", "contacted", "enrolled", "closed"];

export const LEAD_STATUS_HINT: Record<LeadStatus, string> = {
  new: "Chưa liên hệ — cần gọi lại sớm",
  contacted: "Đã gọi / nhắn tin tư vấn",
  enrolled: "Đã đăng ký học và đóng học phí",
  closed: "Không tiếp tục (không liên lạc được, đổi ý…)",
};

/** "Nguyễn Văn Minh" → "NM". */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** "Thời lượng: 1 tiếng/ca" or the plain value. */
export const infoLineText = (line: InfoLine) => (line.label ? `${line.label}: ${line.value}` : line.value);

/** Registrations per course (total / new / enrolled) — used by the course list, editor and lead filters. */
export function useLeadCountsByCourse() {
  const { data: leads, isLoading } = useCollection("leads");
  const counts = useMemo(() => {
    const map = new Map<string, { total: number; new: number; enrolled: number }>();
    for (const lead of leads ?? []) {
      const entry = map.get(lead.courseId) ?? { total: 0, new: 0, enrolled: 0 };
      entry.total += 1;
      if (lead.status === "new") entry.new += 1;
      if (lead.status === "enrolled") entry.enrolled += 1;
      map.set(lead.courseId, entry);
    }
    return map;
  }, [leads]);
  return { counts, isLoading };
}

/**
 * Publish status as two radio cards (Đã xuất bản / Bản nháp) bound to react-hook-form.
 */
export function PublishStatusField({
  name = "status",
  label = "Trạng thái",
  publishedHint = "Hiển thị trên website.",
  draftHint = "Chỉ quản trị viên thấy, chưa lên website.",
}: {
  name?: string;
  label?: ReactNode;
  publishedHint?: string;
  draftHint?: string;
}) {
  const { control, formState } = useFormContext();
  const error = get(formState.errors, name) as { message?: string } | undefined;
  const options = [
    { value: "published", title: "Đã xuất bản", hint: publishedHint, dot: "bg-success" },
    { value: "draft", title: "Bản nháp", hint: draftHint, dot: "bg-muted-foreground/60" },
  ];
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field>
          {label ? <FieldLabel>{label}</FieldLabel> : null}
          <div role="radiogroup" aria-label={typeof label === "string" ? label : "Trạng thái"} className="grid gap-2">
            {options.map((option) => {
              const active = field.value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => field.onChange(option.value)}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    active ? "border-primary bg-primary/5 ring-primary/30 ring-1" : "hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                      active && "border-primary",
                    )}
                  >
                    {active ? <span className="bg-primary size-2 rounded-full" /> : null}
                  </span>
                  <span className="grid gap-0.5">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <span className={cn("size-1.5 rounded-full", option.dot)} />
                      {option.title}
                    </span>
                    <span className="text-muted-foreground text-xs">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError>{error?.message}</FieldError>
        </Field>
      )}
    />
  );
}

export type FacetChoice = { label: string; value: string; count?: number; icon?: ReactNode };

/**
 * Multi-select filter button (same look as the DataTable facet filters) for toolbars we build ourselves
 * (lead inbox, student grid) where the selection is controlled from outside (URL, KPI cards…).
 */
export function FacetPopover({
  title,
  options,
  selected,
  onChange,
  className,
}: {
  title: string;
  options: FacetChoice[];
  selected: string[];
  onChange: (values: string[]) => void;
  className?: string;
}) {
  const set = new Set(selected);
  const toggle = (value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    onChange([...next]);
  };
  const chosen = options.filter((option) => set.has(option.value));
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("border-dashed", className)}>
          <ListFilter />
          {title}
          {set.size ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <Badge variant="secondary" className="max-w-40 truncate rounded-sm px-1 font-normal">
                {set.size > 2 ? `${set.size} đã chọn` : chosen.map((option) => option.label).join(", ")}
              </Badge>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => {
            const active = set.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                    active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {active ? <Check className="size-3" /> : null}
                </span>
                {option.icon}
                <span className="flex-1 truncate">{option.label}</span>
                {option.count !== undefined ? (
                  <span className="text-muted-foreground text-xs tabular-nums">{option.count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {set.size ? (
          <>
            <Separator className="my-1" />
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded-md px-2 py-1.5 text-center text-sm hover:bg-muted"
            >
              Bỏ lọc
            </button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/** Small stat used in KPI strips and aside cards. */
export function MiniStat({
  label,
  value,
  hint,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 px-3 py-2.5", className)}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 text-xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}
