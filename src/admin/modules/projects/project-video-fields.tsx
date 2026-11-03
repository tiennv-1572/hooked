"use client";

import { AlertCircle, CheckCircle2, ExternalLink, ImagePlus, Play, RotateCcw, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, get, useFormContext, useFormState, useWatch } from "react-hook-form";

import { TextField } from "@/admin/components/cms/form-fields";
import { Thumb } from "@/admin/components/cms/image-fields";
import { MediaPicker } from "@/admin/components/cms/media-picker";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { Button } from "@/admin/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { createId } from "@/admin/lib/cms/ids";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

import { parseYouTubeId, videoPoster, YOUTUBE_ID, youtubeEmbedUrl, youtubeWatchUrl } from "./project-utils";

/** Form shape of one video row (thumbnail undefined = YouTube's auto poster). */
export type VideoFormValue = { id: string; youtubeId: string; title: string; thumbnail?: ImageRef };

const NONE = "__none__";

/**
 * "Video" section: YouTube repeater (URL or id → parsed id, auto thumbnail, inline preview on demand)
 * + the featured video played from the overview card.
 */
export function ProjectVideosField() {
  return (
    <div className="flex flex-col gap-6">
      <RepeaterField<VideoFormValue>
        name="videos"
        label="Video YouTube"
        description="Dán link YouTube — ảnh thumbnail được lấy tự động."
        newItem={() => ({ id: createId("vid"), youtubeId: "", title: "", thumbnail: undefined })}
        itemLeading={(item) => (
          <Thumb image={videoPoster(item)} checker={false} className="aspect-video w-14 shrink-0 rounded bg-muted" />
        )}
        itemTitle={(item, index) => <VideoRowTitle video={item} index={index} />}
        renderItem={(index) => <VideoRowFields index={index} />}
        addLabel="Thêm video"
      />
      <FeaturedVideoField />
    </div>
  );
}

function VideoRowTitle({ video, index }: { video: VideoFormValue; index: number }) {
  const featured = useWatch({ name: "featuredVideoId" }) as string | null;
  const { errors } = useFormState({ name: `videos.${index}` });
  const hasError = Boolean(get(errors, `videos.${index}`));
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className={cn("truncate", !video.title && "text-muted-foreground")}>
        {video.title || "Video chưa có tiêu đề"}
      </span>
      {featured && featured === video.id ? (
        <span className="bg-primary/12 text-primary inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
          <Star className="size-3 fill-current" /> <span className="hidden sm:inline">Nổi bật</span>
        </span>
      ) : null}
      {hasError ? (
        <span className="text-destructive inline-flex shrink-0 items-center gap-1 text-[11px] font-medium">
          <AlertCircle className="size-3.5" /> <span className="hidden sm:inline">Cần sửa</span>
        </span>
      ) : null}
    </span>
  );
}

function VideoRowFields({ index }: { index: number }) {
  const base = `videos.${index}`;
  const { setValue } = useFormContext();
  const video = useWatch({ name: base }) as VideoFormValue | undefined;
  const featured = useWatch({ name: "featuredVideoId" }) as string | null;
  const [previewing, setPreviewing] = useState(false);
  const validId = YOUTUBE_ID.test(video?.youtubeId ?? "") ? video!.youtubeId : null;
  const isFeatured = Boolean(video && featured === video.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex min-w-0 flex-col gap-4">
          <YouTubeIdField name={`${base}.youtubeId`} />
          <TextField
            name={`${base}.title`}
            label="Tiêu đề video"
            required
            placeholder="Devoid Music Festival — Aftermovie"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={isFeatured ? "secondary" : "outline"}
              size="sm"
              disabled={isFeatured || !video}
              onClick={() => video && setValue("featuredVideoId", video.id, { shouldDirty: true })}
            >
              <Star className={cn(isFeatured && "fill-primary text-primary")} />
              {isFeatured ? "Đang là video nổi bật" : "Đặt làm video nổi bật"}
            </Button>
            {validId ? (
              <Button type="button" variant="ghost" size="sm" asChild>
                <a href={youtubeWatchUrl(validId)} target="_blank" rel="noreferrer">
                  <ExternalLink /> Mở trên YouTube
                </a>
              </Button>
            ) : null}
          </div>
        </div>
        <VideoThumbnailField
          name={`${base}.thumbnail`}
          video={video}
          onPreview={validId ? () => setPreviewing(true) : undefined}
        />
      </div>
      {previewing && validId ? (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              src={youtubeEmbedUrl(validId)}
              title={video?.title || "Xem thử video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>
          <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setPreviewing(false)}>
            <X /> Đóng xem thử
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Text input that turns any pasted YouTube URL into its 11-char id. */
function YouTubeIdField({ name }: { name: string }) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value as string) ?? "";
        const valid = YOUTUBE_ID.test(value);
        return (
          <Field data-invalid={fieldState.error ? true : undefined}>
            <FieldLabel htmlFor={name}>
              Link hoặc ID YouTube<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id={name}
              value={value}
              placeholder="https://www.youtube.com/watch?v=… hoặc UJvCMG7W6q8"
              aria-invalid={fieldState.error ? true : undefined}
              onChange={(event) => field.onChange(parseYouTubeId(event.target.value) ?? event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="font-mono text-[13px]"
            />
            {fieldState.error ? (
              <FieldError>{fieldState.error.message}</FieldError>
            ) : valid ? (
              <FieldDescription className="text-success flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> ID video: <code className="font-mono">{value}</code>
              </FieldDescription>
            ) : value ? (
              <FieldDescription>Chưa nhận ra link YouTube — kiểm tra lại đường dẫn.</FieldDescription>
            ) : null}
          </Field>
        );
      }}
    />
  );
}

/** Poster of the video: custom image, or YouTube's auto thumbnail when empty. */
function VideoThumbnailField({
  name,
  video,
  onPreview,
}: {
  name: string;
  video: VideoFormValue | undefined;
  onPreview?: () => void;
}) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const custom = (field.value as ImageRef | undefined)?.url ? (field.value as ImageRef) : undefined;
        const poster = video ? videoPoster({ ...video, thumbnail: custom }) : undefined;
        return (
          <Field>
            <FieldLabel>Ảnh thumbnail</FieldLabel>
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
              {poster ? (
                <Thumb image={poster} checker={false} className="size-full" />
              ) : (
                <div className="text-muted-foreground flex size-full items-center justify-center px-3 text-center text-xs">
                  Nhập link YouTube để lấy ảnh
                </div>
              )}
              {poster && onPreview ? (
                <button
                  type="button"
                  onClick={onPreview}
                  aria-label="Xem thử video"
                  className="group absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/25"
                >
                  <span className="group-hover:bg-primary group-hover:text-primary-foreground flex size-10 items-center justify-center rounded-full bg-white/90 text-black shadow transition-colors">
                    <Play className="size-4 fill-current" />
                  </span>
                </button>
              ) : null}
              {poster ? (
                <span className="pointer-events-none absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">
                  {custom ? "Ảnh tùy chỉnh" : "Tự động từ YouTube"}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1">
              <Button type="button" variant="outline" size="xs" onClick={() => setOpen(true)}>
                <ImagePlus /> {custom ? "Đổi ảnh" : "Chọn ảnh riêng"}
              </Button>
              {custom ? (
                <Button type="button" variant="ghost" size="xs" onClick={() => field.onChange(null)}>
                  <RotateCcw /> Dùng ảnh YouTube
                </Button>
              ) : null}
            </div>
            <MediaPicker
              open={open}
              onOpenChange={setOpen}
              folder="projects/videos"
              title="Chọn ảnh thumbnail video"
              onSelect={([picked]) => field.onChange({ ...picked, alt: picked.alt || video?.title || "" })}
            />
          </Field>
        );
      }}
    />
  );
}

/** Video opened by the play control on the overview card. "Không có" → "Video đang được cập nhật.". */
function FeaturedVideoField() {
  const { control, setValue } = useFormContext();
  const videos = (useWatch({ name: "videos" }) as VideoFormValue[] | undefined) ?? [];
  const value = useWatch({ name: "featuredVideoId" }) as string | null;
  const exists = Boolean(value && videos.some((video) => video.id === value));

  // A removed video can't stay featured.
  useEffect(() => {
    if (value && !exists) setValue("featuredVideoId", null, { shouldDirty: true });
  }, [value, exists, setValue]);

  return (
    <Controller
      control={control}
      name="featuredVideoId"
      render={({ field }) => (
        <Field className="rounded-lg border bg-muted/30 p-4">
          <FieldLabel htmlFor="featuredVideoId" className="flex items-center gap-1.5">
            <Star className="text-primary size-4" /> Video nổi bật trên thẻ dự án
          </FieldLabel>
          <Select
            value={exists ? (field.value as string) : NONE}
            onValueChange={(next) => field.onChange(next === NONE ? null : next)}
          >
            <SelectTrigger id="featuredVideoId" className="bg-background h-auto min-h-9 w-full py-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>
                <span className="flex flex-col items-start">
                  <span>Không có</span>
                  <span className="text-muted-foreground text-xs">Website hiển thị “Video đang được cập nhật.”</span>
                </span>
              </SelectItem>
              {videos.map((video, index) => (
                <SelectItem key={video.id} value={video.id} disabled={!YOUTUBE_ID.test(video.youtubeId)}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Thumb
                      image={videoPoster(video)}
                      checker={false}
                      className="aspect-video w-10 shrink-0 rounded-sm bg-muted"
                    />
                    <span className="truncate">{video.title || `Video ${index + 1}`}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {exists
              ? "Phát khi bấm nút ▶ trên thẻ dự án ở trang Projects."
              : videos.length
                ? "Chưa chọn — bấm ▶ trên thẻ dự án sẽ hiển thị “Video đang được cập nhật.”"
                : "Thêm video ở trên để chọn video nổi bật. Hiện website hiển thị “Video đang được cập nhật.”"}
          </FieldDescription>
        </Field>
      )}
    />
  );
}
