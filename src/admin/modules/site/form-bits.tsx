"use client";

import { Newspaper } from "lucide-react";
import type { ReactNode } from "react";
import { Controller, get, useFormContext, useFormState } from "react-hook-form";

import { Thumb } from "@/admin/components/cms/image-fields";
import { PublishBadge } from "@/admin/components/cms/status-badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/admin/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/admin/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/admin/components/ui/field";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { Post } from "@/admin/lib/cms/types/blog";
import { formatDate } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

/** Repeater row title with a red "Thiếu thông tin" marker when the row holds invalid fields. */
export function RowTitle({ name, children, extra }: { name: string; children: ReactNode; extra?: ReactNode }) {
  const { errors } = useFormState({ name });
  const invalid = get(errors, name) !== undefined;
  return (
    <span className="inline-flex max-w-full items-center gap-2 align-middle">
      <span className="truncate">{children}</span>
      {extra}
      {invalid ? (
        <span className="bg-destructive/10 text-destructive shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
          Thiếu thông tin
        </span>
      ) : null}
    </span>
  );
}

/** Two-option segmented control bound to a string field. */
export function SegmentedField({
  name,
  label,
  description,
  options,
  className,
}: {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  options: { value: string; label: ReactNode; icon?: ReactNode }[];
  className?: string;
}) {
  const { control } = useFormContext();
  return (
    <Field className={className}>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div>
            <div role="radiogroup" className="inline-flex w-fit flex-wrap rounded-lg bg-muted p-[3px]">
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
                      "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-all [&_svg]:size-4",
                      active
                        ? "bg-background text-foreground dark:bg-input/30 shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  );
}

/** Dialog listing blog posts (cover, title, kicker, status) — "Thêm từ bài viết". */
export function PostPickerDialog({
  open,
  onOpenChange,
  onPick,
  title = "Chọn bài viết",
  description = "Tiêu đề, chú thích, ảnh và liên kết sẽ được điền từ bài viết — bạn vẫn có thể sửa lại.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (post: Post) => void;
  title?: string;
  description?: string;
}) {
  const { data: posts, isLoading } = useCollection("posts");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 p-0 sm:max-w-lg">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="rounded-none! border-t">
          <CommandInput placeholder="Tìm bài viết…" />
          <CommandList className="max-h-[min(420px,60vh)]">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : (
              <>
                <CommandEmpty>
                  <span className="text-muted-foreground flex flex-col items-center gap-2">
                    <Newspaper className="size-5" /> Không có bài viết phù hợp.
                  </span>
                </CommandEmpty>
                <CommandGroup>
                  {posts?.map((post) => (
                    <CommandItem
                      key={post.id}
                      value={`${post.title} ${post.kicker} ${post.slug}`}
                      onSelect={() => {
                        onPick(post);
                        onOpenChange(false);
                      }}
                      className="gap-3"
                    >
                      <Thumb image={post.cover} className="h-12 w-16 shrink-0 rounded-md" />
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="truncate font-medium">{post.title}</span>
                        <span className="text-muted-foreground truncate text-xs">
                          {post.kicker} · {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                      </span>
                      <PublishBadge status={post.status} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/** Cut a sentence on a word boundary ("Bệ phóng cho nghệ sĩ…"). */
export function shortText(text: string, max = 36) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}
