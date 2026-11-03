"use client";

import { ImagePlus, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, get, useFormContext } from "react-hook-form";

import { Thumb } from "@/admin/components/cms/image-fields";
import { MediaPicker } from "@/admin/components/cms/media-picker";
import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

type ImageGridFieldProps<T> = {
  /** Array field ("hero.slides", "gallery"). */
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  folder?: string;
  /** Tile ratio ("16/9", "3/2"). */
  aspect?: string;
  /** Image of an item (default: the item itself — for `ImageRef[]`). */
  getImage?: (item: T) => ImageRef | undefined;
  /** Returns the item with a new image (default: the image itself). */
  setImage?: (item: T, image: ImageRef) => T;
  /** New item from a picked image (default: the image itself). */
  create?: (image: ImageRef) => T;
  /** Stable id of an item; defaults to `item.id`, else the image URL (+ occurrence). */
  getId?: (item: T) => string | undefined;
  /** Caption under tile `index` (e.g. where the photo appears on the site). */
  caption?: (index: number) => ReactNode;
  /** Highlight tile `index` (e.g. the slide shown in the preview). */
  activeIndex?: number;
  onTileClick?: (index: number) => void;
  max?: number;
  gridClassName?: string;
  /** Extra buttons beside "Thêm ảnh" (e.g. "Thêm video YouTube"). */
  actions?: ReactNode;
  /** Overlay on a tile's image (e.g. a "YouTube" badge). */
  tileBadge?: (item: T) => ReactNode;
  /** Label of the add button and empty state (default "Thêm ảnh"). */
  addLabel?: string;
};

/**
 * Ordered image grid bound to an array field: add many from the media library, drag to reorder, replace, remove.
 * No alt-text editing: the website uses the title of the owning item. Works for `ImageRef[]` and for objects holding an image (`{ id, image }[]`).
 */
export function ImageGridField<T>({
  name,
  label,
  description,
  required,
  folder,
  aspect = "16/9",
  getImage = (item) => item as unknown as ImageRef,
  setImage = (_, image) => image as unknown as T,
  create = (image) => image as unknown as T,
  getId = (item) => (item as { id?: string }).id,
  caption,
  activeIndex,
  onTileClick,
  max,
  gridClassName,
  actions,
  tileBadge,
  addLabel = "Thêm ảnh",
}: ImageGridFieldProps<T>) {
  const { control, formState } = useFormContext();
  const [picker, setPicker] = useState<{ mode: "add" } | { mode: "replace"; index: number } | null>(null);
  const error = get(formState.errors, name) as { message?: string; root?: { message?: string } } | undefined;
  const message = error?.message ?? error?.root?.message;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const items: T[] = field.value ?? [];
        const seen = new Map<string, number>();
        const rows = items.map((item, index) => {
          const base = getId(item) ?? getImage(item)?.url ?? `row-${index}`;
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          return { key: count ? `${base}#${count}` : base, item };
        });
        const full = max !== undefined && items.length >= max;
        return (
          <Field data-invalid={message ? true : undefined}>
            {label ? (
              <div className="flex items-center justify-between gap-2">
                <FieldLabel>
                  {label}
                  {required ? <span className="text-destructive">*</span> : null}
                  <span className="text-muted-foreground font-normal">({items.length})</span>
                </FieldLabel>
                {full ? null : (
                  <div className="flex flex-wrap justify-end gap-2">
                    {actions}
                    <Button type="button" variant="outline" size="sm" onClick={() => setPicker({ mode: "add" })}>
                      <Plus /> {addLabel}
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
            {items.length ? (
              <SortableList
                layout="grid"
                className={cn("grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3", gridClassName)}
                items={rows}
                getId={(row) => row.key}
                onReorder={(next) => field.onChange(next.map((row) => row.item))}
                renderItem={(row, index, handle) => {
                  const image = getImage(row.item);
                  return (
                    <div
                      className={cn(
                        "group relative overflow-hidden rounded-lg border bg-card transition-shadow",
                        activeIndex === index && "ring-primary ring-2",
                      )}
                    >
                      <button
                        type="button"
                        className="block w-full cursor-pointer"
                        style={{ aspectRatio: aspect }}
                        onClick={() => (onTileClick ? onTileClick(index) : setPicker({ mode: "replace", index }))}
                        aria-label={onTileClick ? `Xem ảnh ${index + 1}` : `Thay ảnh ${index + 1}`}
                      >
                        <Thumb image={image} className="size-full" />
                      </button>
                      {tileBadge ? (
                        <div className="pointer-events-none absolute right-1.5 bottom-10">{tileBadge(row.item)}</div>
                      ) : null}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        <DragHandle {...handle} className="bg-background/90 shadow-sm" />
                        <span className="bg-background/90 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums shadow-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex gap-1 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:opacity-0">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          onClick={() => setPicker({ mode: "replace", index })}
                          aria-label="Thay ảnh"
                        >
                          <RefreshCw />
                        </Button>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          className="hover:text-destructive"
                          onClick={() => field.onChange(items.filter((_, i) => i !== index))}
                          aria-label="Gỡ ảnh"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      {caption ? (
                        <p className="truncate border-t px-2 py-1.5 text-[11px] font-medium">{caption(index)}</p>
                      ) : null}
                    </div>
                  );
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPicker({ mode: "add" })}
                className="text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-10 text-sm transition-colors"
              >
                <ImagePlus className="size-6" /> {addLabel}
              </button>
            )}
            {description ? <FieldDescription>{description}</FieldDescription> : null}
            <FieldError>{message}</FieldError>
            <MediaPicker
              open={picker !== null}
              onOpenChange={(open) => !open && setPicker(null)}
              multiple={picker?.mode === "add"}
              folder={folder}
              title={picker?.mode === "replace" ? `Thay ảnh ${picker.index + 1}` : undefined}
              onSelect={(picked) => {
                if (!picker) return;
                if (picker.mode === "add") {
                  const room = max === undefined ? picked.length : Math.max(0, max - items.length);
                  field.onChange([...items, ...picked.slice(0, room).map(create)]);
                } else {
                  const [image] = picked;
                  if (!image) return;
                  field.onChange(
                    items.map((item, i) =>
                      i === picker.index
                        ? setImage(item, { ...image, alt: image.alt || getImage(item)?.alt || "" })
                        : item,
                    ),
                  );
                }
              }}
            />
          </Field>
        );
      }}
    />
  );
}
