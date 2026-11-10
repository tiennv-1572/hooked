"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  ProjectCardPreview,
  usePreviewTrigger,
  type PreviewStatus,
} from "@/components/projects/overview/project-card-preview";
import type { ProjectCardData, ProjectPreview } from "@/components/projects/project-content";
import { Icon } from "@/components/ui/icon";
import { projectHref } from "@/lib/site";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: ProjectCardData;
  /** Responsive `sizes` for the poster — depends on the gallery slot. */
  sizes: string;
  /** Opens the project video viewer. Without it no play control is drawn (Figma "Video" off — Xóm Húc). */
  onPlay?: (trigger: HTMLButtonElement) => void;
  /** Accessible name of the play control, e.g. the video title. */
  playLabel?: string;
  /** Played while the card is hovered: the project video, or a slideshow of its album. */
  preview?: ProjectPreview;
  /** Bigger mobile title (Figma "Format=Wide" instance used by Xóm Húc in the 390 frame). */
  largeMobileTitle?: boolean;
  eager?: boolean;
  className?: string;
};

/**
 * Projects / ProjectCard (2223:439) — 16:9 poster with the orange graffiti frame, centred play control,
 * caption outside the image (title + ↗, service tag line).
 *
 * Hover / keyboard focus (QA 90 · Project media hover, 2413:3518 → 2430:8673): the poster zooms to 104%
 * so the thick baked-in frame leaves the viewport and a 2px rounded brand outline takes its place,
 * the play control grows 56 → 64px and turns brand orange, the title turns brand and the ↗ nudges out.
 *
 * The whole card is a stretched link to `/projects/<slug>`; the play control is a separate button above it.
 *
 * Hover preview (mouse, motion allowed): after a short hover the project video plays muted over the poster, or the
 * album runs as a slideshow when there is no video — see ProjectCardPreview. While the video loads, the play control
 * shows a spinner instead of ▶ (it still opens the video); while it plays, the control fades away — keyboard focus
 * brings it back.
 */
export function ProjectCard({
  project,
  sizes,
  onPlay,
  playLabel,
  preview,
  largeMobileTitle,
  eager,
  className,
}: ProjectCardProps) {
  const tags = project.tags.join(" · ");
  const trigger = usePreviewTrigger();
  const [status, setStatus] = useState<PreviewStatus>("idle");

  return (
    <article className={cn("group relative isolate flex flex-col gap-5", className)} {...trigger.handlers}>
      <div className="relative aspect-video overflow-hidden rounded-[15px] bg-black">
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : undefined}
          fetchPriority={eager ? "high" : undefined}
          className="object-cover transition-transform duration-300 ease-out select-none group-hover:scale-[1.04] group-has-focus-visible:scale-[1.04]"
          draggable={false}
        />
        {preview ? (
          <ProjectCardPreview preview={preview} active={trigger.active} sizes={sizes} onStatusChange={setStatus} />
        ) : null}
        {/* Hover outline (Projects / HoverBorder 2421:1712) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent transition-colors duration-150 group-hover:border-brand group-has-focus-visible:border-brand"
        />
        {onPlay ? (
          <button
            type="button"
            onClick={(event) => onPlay(event.currentTarget)}
            aria-label={`Phát video: ${playLabel ?? project.name}`}
            className={cn(
              "absolute top-1/2 left-1/2 z-10 flex size-14 -translate-1/2 items-center justify-center rounded-full bg-ivory",
              "transition-[width,height,background-color,opacity] duration-200 ease-out",
              "group-hover:size-16 group-hover:bg-brand group-has-focus-visible:size-16 group-has-focus-visible:bg-brand",
              // Out of the way of the playing preview (clicks go to the card link); focusing it shows it again.
              status === "playing" &&
                "pointer-events-none opacity-0 focus-visible:pointer-events-auto focus-visible:opacity-100",
            )}
          >
            <Icon
              name="projects-play"
              size={24}
              className={cn("transition-opacity duration-200", status === "loading" && "opacity-0")}
            />
            <Spinner visible={status === "loading"} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h3
            className={cn(
              "min-w-0 flex-1 font-extrabold text-ivory uppercase transition-colors duration-150 group-hover:text-brand group-has-focus-visible:text-brand",
              largeMobileTitle ? "text-[28px] leading-9" : "text-[22px] leading-8",
              "tablet:text-[26px] tablet:leading-9",
            )}
          >
            <Link
              href={projectHref(project.slug)}
              className="outline-none after:absolute after:inset-0 after:z-0 after:rounded-[15px] after:outline-offset-4 focus-visible:after:outline-2 focus-visible:after:outline-accent"
            >
              {project.name}
            </Link>
          </h3>
          <span aria-hidden className="relative size-6 shrink-0">
            <Icon
              name="projects-arrow-up-right"
              size={24}
              className="transition-opacity duration-150 group-hover:opacity-0 group-has-focus-visible:opacity-0"
            />
            <Icon
              name="projects-arrow-up-right-hover"
              size={24}
              className="absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-has-focus-visible:opacity-100"
            />
          </span>
        </div>
        <p className="text-sm leading-4.5 text-muted">{tags}</p>
      </div>
    </article>
  );
}

/** Loading ring in the play control's ink, in place of ▶ while the hover preview loads. */
function Spinner({ visible }: { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn(
        "absolute inset-0 m-auto size-6 text-ink transition-opacity duration-200",
        visible ? "animate-spin opacity-100" : "opacity-0",
      )}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
