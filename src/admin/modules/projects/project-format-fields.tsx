"use client";

import { Check, EyeOff, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import type { PublishStatus } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

/** Selectable card used by the radio-style field below. */
function OptionCard({
  active,
  onSelect,
  children,
  className,
  label,
}: {
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-3",
        active ? "border-primary bg-primary/5 ring-primary ring-1" : "hover:border-primary/40 hover:bg-muted/40",
        className,
      )}
    >
      {active ? (
        <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-4 items-center justify-center rounded-full">
          <Check className="size-3" />
        </span>
      ) : null}
      {children}
    </button>
  );
}

const STATUS_OPTIONS: { value: PublishStatus; label: string; description: string; icon: ReactNode }[] = [
  {
    value: "published",
    label: "Đã xuất bản",
    description: "Hiển thị trên trang Projects và có trang chi tiết.",
    icon: <Globe />,
  },
  { value: "draft", label: "Bản nháp", description: "Ẩn khỏi website, chỉ thấy trong CMS.", icon: <EyeOff /> },
];

export function StatusField({ name }: { name: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div role="radiogroup" aria-label="Trạng thái" className="grid gap-2">
          {STATUS_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              active={field.value === option.value}
              onSelect={() => field.onChange(option.value)}
              className="flex-row items-start gap-3 py-2.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md [&_svg]:size-4",
                  field.value === option.value
                    ? option.value === "published"
                      ? "bg-success/15 text-success"
                      : "text-foreground bg-muted"
                    : "text-muted-foreground bg-muted",
                )}
              >
                {option.icon}
              </span>
              <span className="grid gap-0.5 pr-4">
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-muted-foreground text-xs">{option.description}</span>
              </span>
            </OptionCard>
          ))}
        </div>
      )}
    />
  );
}
