"use client";

import Image from "next/image";

import { HoverFrame, MaskIcon, PlayBadge } from "@/components/projects/detail/media-icons";
import { useProjectMedia } from "@/components/projects/detail/project-media-provider";
import type { ProjectDetailData } from "@/components/projects/project-content";
import type { ProjectPhoto, ProjectVideo } from "@/data/project-details";

/** Masonry tile widths: 386.67px column on desktop, half of the content column below 1200px. */
const tileSizes = "(min-width: 1200px) 387px, (min-width: 768px) calc(50vw - 56px), calc(50vw - 30px)";

/**
 * `03 · Project cover` (Devoid 2226:562 / mobile 2226:804; SPIN 2437:4388; Xóm Húc 2327:1283): the hero shown whole
 * at its own ratio — never cropped; a very tall image is letterboxed to fit the screen. Click → lightbox
 * (a project without photos or videos shows a plain image).
 */
export function ProjectCover({ cover, label }: { cover: ProjectDetailData["cover"]; label: string }) {
  const { openMedia } = useProjectMedia();
  const { opens } = cover;
  const className = "group relative block w-full overflow-hidden rounded-[15px] bg-[#141414]";
  const image = (
    <Image
      src={cover.image.src}
      alt={cover.image.alt}
      width={cover.image.width}
      height={cover.image.height}
      sizes="(min-width: 1200px) 1192px, calc(100vw - 48px)"
      loading="eager"
      fetchPriority="high"
      className="block h-auto max-h-[85dvh] w-full object-contain"
    />
  );

  if (!opens) return <div className={className}>{image}</div>;
  return (
    <button
      type="button"
      onClick={(event) => openMedia(opens, event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={label}
      className={className}
    >
      {image}
      <HoverFrame />
    </button>
  );
}

/** `Projects / GalleryPhoto` (2409:1799): photo at its own ratio, 15px corners, accent frame on hover. */
export function GalleryPhoto({ photo }: { photo: ProjectPhoto }) {
  const { openMedia } = useProjectMedia();
  return (
    <button
      type="button"
      onClick={(event) => openMedia({ type: "photo", id: photo.id }, event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`Phóng to ảnh: ${photo.alt}`}
      className="group relative block w-full overflow-hidden rounded-[15px] bg-surface"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <Image src={photo.src} alt="" fill sizes={tileSizes} className="object-cover" />
      <HoverFrame />
    </button>
  );
}

/**
 * `Projects / VideoCard` (desktop 2409:1779 · mobile 2409:1792): 16:9 thumbnail + play control, title + ↗,
 * "Xem video". Hover (QA 90): accent frame, accent title/arrow, accent play disc.
 */
export function VideoCard({ video }: { video: ProjectVideo }) {
  const { openMedia } = useProjectMedia();
  return (
    <button
      type="button"
      onClick={(event) => openMedia({ type: "video", id: video.id }, event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`Xem video: ${video.title}`}
      className="group flex w-full flex-col gap-2 rounded-[15px] text-left tablet:gap-3"
    >
      <span className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[15px] bg-surface">
        <Image src={video.thumbnail.src} alt="" fill sizes={tileSizes} className="object-cover" />
        <PlayBadge className="relative" />
        <HoverFrame />
      </span>
      <span className="flex w-full flex-col gap-2">
        <span className="flex items-center gap-3">
          <span className="min-w-0 flex-1 text-[13px] leading-[19px] font-extrabold text-ivory transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent tablet:text-lg tablet:leading-[26px]">
            {video.title}
          </span>
          <MaskIcon
            name="projects-arrow-up-right"
            size={24}
            className="text-ivory transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent"
          />
        </span>
        <span className="text-[11px] leading-4 text-muted tablet:text-[13px] tablet:leading-5">Xem video</span>
      </span>
    </button>
  );
}

/** "Xem toàn bộ album ảnh" (2336:3500) — opens the photo lightbox from the first photo. */
export function AlbumButton({ label, firstPhoto }: { label: string; firstPhoto: ProjectPhoto }) {
  const { openMedia } = useProjectMedia();
  return (
    <button
      type="button"
      onClick={(event) => openMedia({ type: "photo", id: firstPhoto.id }, event.currentTarget)}
      aria-haspopup="dialog"
      className="w-fit text-left text-base leading-[19px] text-muted transition-colors duration-150 hover:text-accent"
    >
      {label}
    </button>
  );
}
