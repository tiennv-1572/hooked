"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { MaskIcon, PlayBadge } from "@/components/projects/detail/media-icons";
import { Dialog, DialogClose, DialogCloseButton, DialogContent } from "@/components/ui/dialog";
import type { ProjectVideo } from "@/data/project-details";

type VideoLightboxProps = {
  /** Video to show. `null` renders the "Video đang được cập nhật." state (no YouTube id yet). */
  video: ProjectVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close (controlled dialogs have no Radix Trigger to return to). */
  onCloseAutoFocus?: (event: Event) => void;
};

const youtubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`;
const youtubeWatch = (id: string) => `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;

/**
 * Video lightbox — Figma 73 · OVERLAYS / Video lightboxes (2363:1626).
 * - Dialog (`Video player / Dialog`, desktop 2363:1631 · 1120×758, mobile 2363:1648 · 358px): title bar + close,
 *   16:9 poster with play control, "Xem trên YouTube ↗" footer.
 * - The YouTube iframe (privacy-enhanced youtube-nocookie.com) is only mounted after the play button is pressed;
 *   closing the dialog unmounts it, which stops playback.
 * - `video === null` → Unavailable state (desktop 2226:884 / mobile 2226:905): full-screen message + "← Quay lại dự án".
 *
 * Can be reused by the Projects overview cards: `<VideoLightbox video={getFeaturedProjectVideo(slug)} … />`.
 */
export function VideoLightbox({ video, open, onOpenChange, onCloseAutoFocus }: VideoLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {video ? (
        <VideoDialog video={video} onCloseAutoFocus={onCloseAutoFocus} />
      ) : (
        <VideoUnavailable onCloseAutoFocus={onCloseAutoFocus} />
      )}
    </Dialog>
  );
}

type CloseFocusProps = Pick<VideoLightboxProps, "onCloseAutoFocus">;

function VideoDialog({ video, onCloseAutoFocus }: CloseFocusProps & { video: ProjectVideo }) {
  return (
    <DialogContent
      title={video.title}
      onCloseAutoFocus={onCloseAutoFocus}
      overlayClassName="bg-black/84"
      className="w-[min(358px,calc(100vw-32px))] border-0 bg-coal tablet:max-h-[calc(100dvh-48px)] tablet:w-[min(1120px,calc(100vw-48px),calc((100dvh-176px)*16/9))] tablet:rounded-[20px]"
    >
      <div className="flex items-center gap-4 py-3 pr-3 pl-4 tablet:py-4 tablet:pr-4 tablet:pl-6">
        <p
          aria-hidden
          className="min-w-0 flex-1 text-sm leading-[22px] font-extrabold text-white tablet:text-lg tablet:leading-7"
        >
          {video.title}
        </p>
        <DialogCloseButton label="Đóng video" />
      </div>

      {/* key: switching videos resets the player back to its poster */}
      <VideoPlayer key={video.id} video={video} />

      <a
        href={youtubeWatch(video.id)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-end gap-2 p-4 text-[13px] leading-5 text-[#d3c6b8] transition-colors duration-150 hover:text-accent focus-visible:-outline-offset-4 tablet:px-6"
      >
        Xem trên YouTube
        <span className="sr-only">(mở tab mới)</span>
        <MaskIcon
          name="project-external-link"
          size={12}
          className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </DialogContent>
  );
}

function VideoPlayer({ video }: { video: ProjectVideo }) {
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Keep keyboard focus inside the dialog when the play button is replaced by the iframe.
  useEffect(() => {
    if (playing) frameRef.current?.focus();
  }, [playing]);

  return (
    <div className="relative aspect-video w-full shrink-0 bg-black">
      {playing ? (
        <iframe
          ref={frameRef}
          src={youtubeEmbed(video.id)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Phát video: ${video.title}`}
          className="group absolute inset-0 flex items-center justify-center overflow-hidden focus-visible:-outline-offset-4"
        >
          <Image
            src={video.thumbnail.src}
            alt=""
            fill
            sizes="(min-width: 768px) 1120px, 358px"
            className="object-contain"
            style={video.posterZoom ? { transform: `scale(${video.posterZoom})` } : undefined}
          />
          <PlayBadge className="relative" />
        </button>
      )}
    </div>
  );
}

function VideoUnavailable({ onCloseAutoFocus }: CloseFocusProps) {
  return (
    <DialogContent
      title="Video đang được cập nhật."
      onCloseAutoFocus={onCloseAutoFocus}
      overlayClassName="bg-transparent"
      className="inset-0 top-0 left-0 h-dvh max-h-none w-full translate-none items-center justify-center rounded-none border-0 bg-[rgba(5,4,3,0.96)] px-6 pb-20 tablet:px-12"
    >
      <div className="flex w-full max-w-[640px] flex-col items-start gap-5">
        <p
          aria-hidden
          className="text-[28px] leading-[37px] font-extrabold text-ivory tablet:text-[40px] tablet:leading-[52px]"
        >
          Video đang được cập nhật.
        </p>
        <p className="text-lg leading-6 text-muted">Video dự án sẽ hiển thị tại đây khi được bổ sung.</p>
        <DialogClose className="group flex items-center gap-2.5 text-base leading-[21px] font-semibold text-ivory transition-colors duration-150 hover:text-accent">
          <MaskIcon
            name="project-arrow-left"
            size={24}
            className="transition-transform duration-150 group-hover:-translate-x-0.5"
          />
          Quay lại dự án
        </DialogClose>
      </div>
    </DialogContent>
  );
}
