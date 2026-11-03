"use client";

import { addDays, format, formatDistanceToNowStrict, setHours, setMinutes, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarClock, CalendarIcon, CircleCheck, Clock, FilePen, Globe, X } from "lucide-react";
import { useId, useState } from "react";
import { vi as dayPickerVi } from "react-day-picker/locale";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/admin/components/ui/button";
import { Calendar } from "@/admin/components/ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { PublishStatus } from "@/admin/lib/cms/types/shared";
import { formatDateTime } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { postState, useNow, type PostState } from "./post-utils";

/** Segmented "Bản nháp / Xuất bản" switch bound to `status`. */
export function StatusToggle() {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name="status"
      render={({ field }) => (
        <div role="radiogroup" aria-label="Trạng thái" className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
          {(
            [
              { value: "draft", label: "Bản nháp", icon: FilePen },
              { value: "published", label: "Xuất bản", icon: Globe },
            ] as const
          ).map((option) => {
            const active = field.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => field.onChange(option.value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-background text-foreground dark:bg-input/40 shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <option.icon className={cn("size-4", active && option.value === "published" && "text-success")} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    />
  );
}

const STATE_STYLE: Record<PostState, { icon: typeof Globe; className: string }> = {
  draft: { icon: FilePen, className: "border-border bg-muted/50 text-muted-foreground" },
  scheduled: { icon: CalendarClock, className: "border-chart-3/30 bg-chart-3/8 text-chart-3" },
  published: { icon: CircleCheck, className: "border-success/30 bg-success/8 text-success" },
};

/** Explains what the current status + date mean on the website. */
export function PublishStateNote() {
  const now = useNow();
  const status = useWatch({ name: "status" }) as PublishStatus;
  const publishedAt = useWatch({ name: "publishedAt" }) as string | undefined;
  const state = postState({ status, publishedAt }, now);
  const { icon: Icon, className } = STATE_STYLE[state];

  let text: string;
  if (state === "draft") text = "Bài viết chỉ hiển thị trong CMS. Chọn “Xuất bản” khi đã sẵn sàng.";
  else if (state === "scheduled" && publishedAt) {
    text = `Đã lên lịch: tự hiển thị lúc ${formatDateTime(publishedAt)} (sau ${formatDistanceToNowStrict(new Date(publishedAt), { locale: vi })}).`;
  } else if (publishedAt) text = `Đang hiển thị trên website từ ${formatDateTime(publishedAt)}.`;
  else text = "Sẽ hiển thị ngay khi lưu (ngày đăng = thời điểm lưu).";

  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[13px] leading-snug", className)}>
      <Icon className="mt-px size-4 shrink-0" />
      <span className="text-foreground/80">{text}</span>
    </div>
  );
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
/** Compact Vietnamese labels ("T2", "Tháng 11, 2026") — the locale defaults ("Th 2") overflow the cells. */
const CALENDAR_FORMATTERS = {
  formatWeekdayName: (day: Date) => WEEKDAYS[day.getDay()],
  formatCaption: (month: Date) => `Tháng ${month.getMonth() + 1}, ${month.getFullYear()}`,
};

/** Date + time picker for `publishedAt` (ISO). A future date schedules the post. */
export function PublishDateField({ name = "publishedAt" }: { name?: string }) {
  const { control } = useFormContext();
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const date = field.value ? new Date(field.value as string) : undefined;
        const time = date ? format(date, "HH:mm") : "09:00";
        const emit = (next: Date) => field.onChange(next.toISOString());
        const withTime = (day: Date, value: string) => {
          const [hours, minutes] = value.split(":").map(Number);
          return setMinutes(setHours(startOfDay(day), hours || 0), minutes || 0);
        };
        return (
          <Field>
            <FieldLabel htmlFor={id}>Ngày đăng</FieldLabel>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button id={id} type="button" variant="outline" className="flex-1 justify-start font-normal">
                    <CalendarIcon />
                    {date ? (
                      formatDateTime(date)
                    ) : (
                      <span className="text-muted-foreground">Chưa đặt — dùng lúc xuất bản</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="end" collisionPadding={12}>
                  <Calendar
                    mode="single"
                    locale={dayPickerVi}
                    formatters={CALENDAR_FORMATTERS}
                    className="mx-auto [--cell-size:--spacing(8)]"
                    selected={date}
                    defaultMonth={date}
                    onSelect={(day) => day && emit(withTime(day, time))}
                    autoFocus
                  />
                  <div className="flex items-center gap-2 border-t px-3 py-2.5">
                    <Clock className="text-muted-foreground size-4" />
                    <Input
                      type="time"
                      aria-label="Giờ đăng"
                      value={time}
                      onChange={(event) => event.target.value && emit(withTime(date ?? new Date(), event.target.value))}
                      className="h-8 w-28"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => emit(new Date())}
                    >
                      Bây giờ
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 border-t px-3 py-2.5" aria-label="Lên lịch nhanh">
                    <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                    {[
                      { label: "Mai 9:00", days: 1 },
                      { label: "+3 ngày", days: 3 },
                      { label: "Tuần sau", days: 7 },
                    ].map((preset) => (
                      <Button
                        key={preset.days}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          emit(withTime(addDays(new Date(), preset.days), "09:00"));
                          setOpen(false);
                        }}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              {date ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => field.onChange(undefined)}
                  aria-label="Xóa ngày đăng"
                >
                  <X />
                </Button>
              ) : null}
            </div>
            <FieldDescription>
              Chọn thời điểm trong tương lai để lên lịch — bài tự hiển thị khi đến giờ.
            </FieldDescription>
          </Field>
        );
      }}
    />
  );
}

/** Author input with suggestions from other posts and CMS users. */
export function AuthorField() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const listId = useId();
  const { data: posts } = useCollection("posts");
  const { data: users } = useCollection("users");
  const suggestions = [
    ...new Set(
      [...(posts ?? []).map((post) => post.author), ...(users ?? []).map((user) => user.name)].filter(Boolean),
    ),
  ];
  const message = (errors.author as { message?: string } | undefined)?.message;
  return (
    <Field data-invalid={message ? true : undefined}>
      <FieldLabel htmlFor="author">
        Tác giả<span className="text-destructive">*</span>
      </FieldLabel>
      <Input
        id="author"
        list={listId}
        placeholder="Hooked Entertainment"
        aria-invalid={message ? true : undefined}
        {...register("author")}
      />
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <FieldError>{message}</FieldError>
    </Field>
  );
}
