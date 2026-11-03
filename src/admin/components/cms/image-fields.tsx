"use client";

import { ImageIcon, ImagePlus, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Controller, get, useFormContext } from "react-hook-form";

import { MediaPicker } from "@/admin/components/cms/media-picker";
import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { createId } from "@/admin/lib/cms/ids";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

type ImageFieldProps = {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  /** Preview box ratio, e.g. "16/9", "3/4", "1/1". */
  aspect?: string;
  /** Upload folder in the media library. */
  folder?: string;
  /** Preview background: checkerboard (default) or the site's dark ink (white logos). */
  previewBg?: "checker" | "dark";
  className?: string;
};

/** Thumbnail with its own <img> so data URLs and remote URLs work without next/image config. */
export function Thumb({
  image,
  className,
  fit = "cover",
  checker = true,
}: {
  image?: ImageRef | null;
  className?: string;
  fit?: "cover" | "contain";
  /** Checkerboard behind transparent pixels (off for previews on a coloured background). */
  checker?: boolean;
}) {
  if (!image?.url) {
    return (
      <div className={cn("text-muted-foreground flex items-center justify-center bg-muted", className)}>
        <ImageIcon className="size-5" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={image.url}
      alt={image.alt}
      loading="lazy"
      className={cn(checker && "bg-checker", fit === "cover" ? "object-cover" : "object-contain", className)}
    />
  );
}

/**
 * Single image (value: ImageRef | undefined): preview, pick from library / upload / URL, replace, remove.
 * Removing sets `null`, not `undefined`: react-hook-form shows a field's default value again when it is undefined.
 * No alt-text input: the website uses the title of the item that owns the image (src/server/content/mappers.ts).
 *
 *   <ImageField name="image" label="Ảnh khóa học" aspect="16/9" folder="academy" />
 */
export function ImageField({
  name,
  label,
  description,
  required,
  aspect = "16/9",
  folder,
  previewBg = "checker",
  className,
}: ImageFieldProps) {
  const { control, formState } = useFormContext();
  const [open, setOpen] = useState(false);
  const error = get(formState.errors, name) as { message?: string; url?: { message?: string } } | undefined;
  const message = error?.message ?? error?.url?.message;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const image = field.value as ImageRef | null | undefined;
        return (
          <Field data-invalid={message ? true : undefined} className={className}>
            {label ? (
              <FieldLabel>
                {label}
                {required ? <span className="text-destructive">*</span> : null}
              </FieldLabel>
            ) : null}
            {image?.url ? (
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-xl border",
                    previewBg === "dark" ? "bg-[#050101] p-6" : "bg-checker",
                  )}
                  style={{ aspectRatio: aspect }}
                >
                  <Thumb
                    image={image}
                    className="size-full"
                    checker={previewBg !== "dark"}
                    fit={aspect === "auto" || previewBg === "dark" ? "contain" : "cover"}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
                      <RefreshCw /> Thay ảnh
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => field.onChange(null)}>
                      <Trash2 /> Gỡ
                    </Button>
                  </div>
                  {image.width && image.height ? (
                    <span className="absolute right-2 bottom-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                      {image.width}×{image.height}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                style={{ aspectRatio: aspect === "auto" ? "16/9" : aspect }}
                className="text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-sm transition-colors"
              >
                <ImagePlus className="size-6" />
                Chọn hoặc tải ảnh lên
              </button>
            )}
            {description ? <FieldDescription>{description}</FieldDescription> : null}
            <FieldError>{message}</FieldError>
            <MediaPicker
              open={open}
              onOpenChange={setOpen}
              folder={folder}
              onSelect={([picked]) => field.onChange({ ...picked, alt: picked.alt || image?.alt || "" })}
            />
          </Field>
        );
      }}
    />
  );
}

type GalleryImage = ImageRef & { id: string };

/**
 * Ordered image gallery (value: (ImageRef & { id })[]): add many from the library, drag to reorder, remove.
 *
 *   <GalleryField name="photos" label="Album ảnh" folder={`projects/${slug}`} />
 */
export function GalleryField({
  name,
  label,
  description,
  folder,
  aspect = "4/3",
  className,
}: Omit<ImageFieldProps, "required">) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const images: GalleryImage[] = field.value ?? [];
        return (
          <Field className={className}>
            {label ? (
              <div className="flex items-center justify-between">
                <FieldLabel>
                  {label} <span className="text-muted-foreground font-normal">({images.length})</span>
                </FieldLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                  <Plus /> Thêm ảnh
                </Button>
              </div>
            ) : null}
            {images.length ? (
              <SortableList
                layout="grid"
                items={images}
                getId={(image) => image.id}
                onReorder={(next) => field.onChange(next)}
                renderItem={(image, index, handle) => (
                  <div className="group relative overflow-hidden rounded-lg border bg-card">
                    <div style={{ aspectRatio: aspect }}>
                      <Thumb image={image} className="size-full" />
                    </div>
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      <DragHandle {...handle} className="bg-background/90 shadow-sm" />
                      <span className="bg-background/90 rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums shadow-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="secondary"
                        onClick={() => field.onChange(images.filter((item) => item.id !== image.id))}
                        aria-label="Gỡ ảnh"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}
              />
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-10 text-sm transition-colors"
              >
                <ImagePlus className="size-6" /> Thêm ảnh vào album
              </button>
            )}
            {description ? <FieldDescription>{description}</FieldDescription> : null}
            <MediaPicker
              open={open}
              onOpenChange={setOpen}
              multiple
              folder={folder}
              onSelect={(picked) =>
                field.onChange([...images, ...picked.map((image) => ({ ...image, id: createId("img") }))])
              }
            />
          </Field>
        );
      }}
    />
  );
}
