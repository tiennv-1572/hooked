"use client";

import { useEffect, useRef, useState } from "react";

import { VideoLightbox } from "@/components/projects/detail/video-lightbox";
import { ProjectCard } from "@/components/projects/overview/project-card";
import { ProjectFilterChips } from "@/components/projects/overview/project-filter-chips";
import { ProjectsEmptyState } from "@/components/projects/overview/projects-empty-state";
import {
  ALL_PROJECTS,
  filterProjects,
  resolveProjectFilter,
  type ProjectCardData,
  type ProjectFilterOption,
  type ProjectGridCell,
  type ProjectsEmptyCopy,
} from "@/components/projects/project-content";
import type { ProjectVideo } from "@/data/project-details";
import type { ProjectCardFormat } from "@/data/projects";
import { cn } from "@/lib/utils";

/** Query param shared with Home "OUR SERVICE" (`/projects?service=media`). */
const QUERY_KEY = "service";

const fullWidthSizes = "(min-width: 1200px) 1192px, 100vw";

/**
 * Desktop "Tất cả" editorial grid (2221:2641): three tracks 464 · 272 · 408 (+24px gaps). Every format owns fixed
 * columns — Landscape 1–2 (760), Portrait 3 (408, pushed down 72px), Compact 1 (464, pushed down 96px), Wide 2–3 (704),
 * Panorama 1–3 (1192) — and the cells of the CMS "Cài đặt hiển thị dự án" (format + project, a project may repeat)
 * pack row by row (`dense`: a cell takes the first row where its columns are free). Landscape · Portrait · Wide ·
 * Compact · Panorama is the Figma layout. Tablet: two equal columns (≥ 320px each from 768px), panorama spans both.
 */
const editorialSlots: Record<ProjectCardFormat, { className: string; sizes: string }> = {
  landscape: {
    className: "desktop:col-span-2 desktop:col-start-1",
    sizes: "(min-width: 1200px) 760px, (min-width: 768px) 50vw, 100vw",
  },
  portrait: {
    className: "desktop:col-start-3 desktop:pt-18",
    sizes: "(min-width: 1200px) 408px, (min-width: 768px) 50vw, 100vw",
  },
  wide: {
    className: "desktop:col-span-2 desktop:col-start-2",
    sizes: "(min-width: 1200px) 704px, (min-width: 768px) 50vw, 100vw",
  },
  compact: {
    className: "desktop:col-start-1 desktop:pt-24",
    sizes: "(min-width: 1200px) 464px, (min-width: 768px) 50vw, 100vw",
  },
  panorama: {
    className: "tablet:col-span-2 desktop:col-span-3",
    sizes: fullWidthSizes,
  },
};

/** Grid cells → cards; any other filter: one full-width card per row, in project order. */
function galleryCells(grid: ProjectGridCell[], projects: ProjectCardData[], filter: string) {
  if (filter !== ALL_PROJECTS) {
    return filterProjects(projects, filter).map((project) => ({ key: project.slug, project, format: null }));
  }
  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  return grid.flatMap((cell, index) => {
    const project = bySlug.get(cell.slug);
    return project ? [{ key: `${index}-${cell.slug}`, project, format: cell.format }] : [];
  });
}

type ProjectGalleryProps = {
  /** Cells of the "Tất cả" grid, top to bottom (CMS "Cài đặt hiển thị dự án"). */
  grid: ProjectGridCell[];
  /** Every published project (filtered views). */
  projects: ProjectCardData[];
  /** "Tất cả" first, then one chip per CMS category. */
  filters: ProjectFilterOption[];
  /** Featured video per project slug (resolved on the server); projects without one get no play control. */
  videos: Record<string, ProjectVideo>;
  emptyState: ProjectsEmptyCopy;
};

/**
 * Projects / FilteredGallery (2221:3051; page instances 2226:384 desktop / 2226:641 mobile).
 * - "Tất cả": editorial staggered grid on desktop (cells from the CMS), 2 columns on tablet, 1 column on mobile.
 * - Any other filter: one full-width card per row (desktop 1192px), 64px apart — instant, no geometry animation.
 * - Initial filter comes from `?service=` (read on mount, closest category); changes are mirrored with
 *   `history.replaceState` so the page itself stays static.
 * - Play controls open the shared VideoLightbox (73 · OVERLAYS, built with the project detail pages);
 *   an empty filter shows ProjectsEmptyState.
 */
export function ProjectGallery({ grid, projects, filters, videos, emptyState }: ProjectGalleryProps) {
  const [filter, setFilter] = useState(ALL_PROJECTS);
  const [videoOpen, setVideoOpen] = useState(false);
  const [video, setVideo] = useState<ProjectVideo | null>(null);
  // The lightbox is controlled (no Radix Trigger), so focus is handed back to the play control by hand.
  const playTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const initial = resolveProjectFilter(new URLSearchParams(window.location.search).get(QUERY_KEY), filters);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off sync from the URL after hydration
    if (initial !== ALL_PROJECTS) setFilter(initial);
  }, [filters]);

  function selectFilter(next: string) {
    setFilter(next);
    const url = new URL(window.location.href);
    if (next === ALL_PROJECTS) url.searchParams.delete(QUERY_KEY);
    else url.searchParams.set(QUERY_KEY, next);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function openVideo(next: ProjectVideo, trigger: HTMLElement) {
    playTriggerRef.current = trigger;
    setVideo(next);
    setVideoOpen(true);
  }

  function handleVideoOpenChange(open: boolean) {
    setVideoOpen(open);
    if (!open) requestAnimationFrame(() => playTriggerRef.current?.focus({ preventScroll: true }));
  }

  const editorial = filter === ALL_PROJECTS;
  const cells = galleryCells(grid, projects, filter);
  const count = new Set(cells.map((cell) => cell.project.slug)).size;
  const activeLabel = filters.find((item) => item.id === filter)?.label ?? "";

  return (
    <div className="flex flex-col gap-8 desktop:gap-10">
      <ProjectFilterChips filters={filters} value={filter} onChange={selectFilter} />

      <h2 className="sr-only">Danh sách dự án</h2>
      <p aria-live="polite" className="sr-only">
        {editorial ? `${activeLabel} ${count} dự án` : `${count} dự án ${activeLabel}`}
      </p>

      {cells.length > 0 ? (
        <ul
          className={cn(
            "grid grid-cols-1 gap-y-16",
            editorial &&
              "gap-y-9 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-16 desktop:grid-flow-row-dense desktop:grid-cols-[464fr_272fr_408fr]",
          )}
        >
          {cells.map(({ key, project, format }, index) => {
            const slot = format ? editorialSlots[format] : null;
            const featured = videos[project.slug];
            return (
              <li key={key} className={cn("min-w-0", slot?.className)}>
                <ProjectCard
                  project={project}
                  sizes={slot?.sizes ?? fullWidthSizes}
                  onPlay={featured ? (trigger) => openVideo(featured, trigger) : undefined}
                  playLabel={featured?.title}
                  largeMobileTitle={format === "wide"}
                  eager={index === 0}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <ProjectsEmptyState
          title={`${emptyState.title} cho “${activeLabel}”`}
          body={emptyState.body}
          onReset={() => selectFilter(ALL_PROJECTS)}
        />
      )}

      <VideoLightbox video={video} open={videoOpen} onOpenChange={handleVideoOpenChange} />
    </div>
  );
}
