import type { Metadata } from "next";

import type { ProjectsPage } from "@/admin/lib/cms/types/projects";
import {
  ALL_PROJECTS,
  PROJECTS_COPY,
  type ProjectCardData,
  type ProjectGridCell,
  type ProjectDetailData,
  type ProjectFilterOption,
  type ProjectsEmptyCopy,
} from "@/components/projects/project-content";
import { projectDetails, type MediaRef, type ProjectPhoto, type ProjectVideo } from "@/data/project-details";
import { htmlToText } from "@/lib/html-text";
import { projectHref } from "@/lib/site";

import type {
  ImageDto,
  ProjectCategoryDto,
  ProjectDto,
  ProjectGridCellDto,
  ProjectSummaryDto,
  ProjectVideoDto,
} from "../dto";
import { toPhoto } from "./photo";

/*
 * Projects overview (/projects) and project detail (/projects/[slug]): public DTOs (+ the `projectsPage` SEO) →
 * the props of src/components/projects/**. Pages stay thin: query, map here, render.
 */

/** Intrinsic sizes used only when an image was saved without dimensions (pasted URL). */
const POSTER = { width: 2560, height: 1440 } as const;
const PHOTO = { width: 1200, height: 800 } as const;
const YOUTUBE = { width: 1280, height: 720 } as const;

const image = (dto: ImageDto, fallback: { width: number; height: number }) => {
  const { src, width, height } = toPhoto(dto, fallback);
  return { src, width, height };
};

/*
 * Figma presentation hints the CMS has no fields for, read from the original site data (src/data/project-details.ts):
 * - the album masonry, which Figma places tile by tile with a different column order per breakpoint;
 * - the zoom that hides the black bars baked into some letterboxed YouTube posters (video lightbox).
 * A hint only applies while the CMS media still match it (same photo/video ids, same thumbnail); once an editor adds or
 * removes media the album switches to the automatic layout and the poster is shown as uploaded.
 */
const FIGMA_ALBUMS = new Map(projectDetails.map((project) => [project.slug, project.masonry]));
const POSTER_ZOOM = new Map(
  projectDetails.flatMap((project) =>
    project.videos.flatMap((video) =>
      video.posterZoom ? [[`${video.id} ${video.thumbnail.src}`, video.posterZoom]] : [],
    ),
  ) as [string, number][],
);

// ---------------------------------------------------------------------------------------------------------
// Overview

export function toProjectVideo(video: ProjectVideoDto): ProjectVideo {
  const posterZoom = POSTER_ZOOM.get(`${video.youtubeId} ${video.thumbnail.url}`);
  return {
    // The components key videos by YouTube id (embed + "Xem trên YouTube" URLs).
    id: video.youtubeId,
    title: video.title,
    thumbnail: image(video.thumbnail, YOUTUBE),
    ...(posterZoom ? { posterZoom } : {}),
  };
}

export function toProjectCard(project: ProjectSummaryDto): ProjectCardData {
  return {
    slug: project.slug,
    name: project.name,
    tags: project.categories.map((category) => category.label),
    categories: project.categories.map((category) => category.slug),
    cover: toPhoto(project.cover, POSTER),
  };
}

export function toProjectsOverview({
  grid,
  categories,
  projects,
}: {
  grid: ProjectGridCellDto[];
  categories: ProjectCategoryDto[];
  projects: ProjectSummaryDto[];
}): {
  title: string;
  grid: ProjectGridCell[];
  filters: ProjectFilterOption[];
  projects: ProjectCardData[];
  videos: Record<string, ProjectVideo>;
  emptyState: ProjectsEmptyCopy;
} {
  // Only the featured videos reach the client gallery, not every project's media.
  const videos: Record<string, ProjectVideo> = {};
  for (const project of projects) {
    if (project.featuredVideo) videos[project.slug] = toProjectVideo(project.featuredVideo);
  }
  const slugs = new Map(projects.map((project) => [project.id, project.slug]));
  return {
    title: PROJECTS_COPY.title,
    grid: grid.flatMap((cell) => {
      const slug = slugs.get(cell.projectId);
      return slug ? [{ format: cell.format, slug }] : [];
    }),
    filters: [
      { id: ALL_PROJECTS, label: PROJECTS_COPY.allFilterLabel },
      ...categories
        .filter((category) => category.slug !== ALL_PROJECTS)
        .map((category) => ({ id: category.slug, label: category.label })),
    ],
    projects: projects.map(toProjectCard),
    videos,
    emptyState: PROJECTS_COPY.emptyState,
  };
}

export function toProjectsMetadata({ seo }: ProjectsPage): Metadata {
  return { title: seo.title, description: seo.description };
}

// ---------------------------------------------------------------------------------------------------------
// Detail

const refKey = (ref: MediaRef) => `${ref.type}:${ref.id}`;

/** Figma's hand-placed album when it still holds exactly the project's media (a cover-only photo may stay out). */
function figmaAlbum(slug: string, media: MediaRef[], coverPhotoId: string | undefined) {
  const album = FIGMA_ALBUMS.get(slug);
  if (!album) return null;
  const available = new Set(media.map(refKey));
  for (const columns of [album.desktop, album.mobile]) {
    const placed = new Set(columns.flat().map(refKey));
    if ([...placed].some((key) => !available.has(key))) return null;
    if ([...available].some((key) => !placed.has(key) && key !== `photo:${coverPhotoId}`)) return null;
  }
  return album;
}

/** Height of a video tile's caption (title + "Xem video") relative to the tile width. */
const VIDEO_CAPTION = 0.25;

/** Automatic masonry: each tile, in album order, goes to the shortest column. */
function balancedColumns(tiles: { ref: MediaRef; ratio: number }[], count: number): MediaRef[][] {
  const columns = Array.from({ length: count }, () => ({ height: 0, refs: [] as MediaRef[] }));
  for (const tile of tiles) {
    const column = columns.reduce((shortest, entry) => (entry.height < shortest.height ? entry : shortest));
    column.refs.push(tile.ref);
    column.height += tile.ratio;
  }
  return columns.map((column) => column.refs);
}

function autoAlbum(photos: ProjectPhoto[], videos: ProjectVideo[]) {
  const tiles = [
    ...photos.map((photo) => ({ ref: { type: "photo", id: photo.id } as MediaRef, ratio: photo.height / photo.width })),
    ...videos.map((video) => ({ ref: { type: "video", id: video.id } as MediaRef, ratio: 9 / 16 + VIDEO_CAPTION })),
  ];
  return { desktop: balancedColumns(tiles, 3), mobile: balancedColumns(tiles, 2) };
}

/**
 * What a click on the cover opens: the photo or video showing the same image (Figma: the cover is photo 01, or the
 * first video for SPIN Awards which has no photos), else the first photo, else the featured / first video.
 */
function coverTarget(project: ProjectDto, coverPhotoId: string | undefined): MediaRef | null {
  if (coverPhotoId) return { type: "photo", id: coverPhotoId };
  const video = project.videos.find((entry) => entry.thumbnail.url === project.hero.image.url);
  if (video) return { type: "video", id: video.youtubeId };
  if (project.photos[0]) return { type: "photo", id: project.photos[0].id };
  const fallback = project.featuredVideo ?? project.videos[0];
  return fallback ? { type: "video", id: fallback.youtubeId } : null;
}

export function toProjectDetail(project: ProjectDto): ProjectDetailData {
  const photos = project.photos.map((photo) => ({ id: photo.id, ...toPhoto(photo, PHOTO) }));
  const videos: ProjectVideo[] = [];
  for (const video of project.videos.map(toProjectVideo)) {
    if (!videos.some((entry) => entry.id === video.id)) videos.push(video);
  }
  const coverPhotoId = project.photos.find((photo) => photo.url === project.hero.image.url)?.id;
  const media: MediaRef[] = [
    ...photos.map((photo) => ({ type: "photo" as const, id: photo.id })),
    ...videos.map((video) => ({ type: "video" as const, id: video.id })),
  ];

  return {
    slug: project.slug,
    name: project.name,
    categories: project.categories.map((category) => category.label),
    partners: project.partners,
    description: project.description,
    cover: { image: toPhoto(project.hero.image, PHOTO), opens: coverTarget(project, coverPhotoId) },
    photos,
    videos,
    masonry: figmaAlbum(project.slug, media, coverPhotoId) ?? autoAlbum(photos, videos),
    albumLink: project.albumLink.label
      ? { label: project.albumLink.label, ...(project.albumLink.href ? { href: project.albumLink.href } : {}) }
      : null,
  };
}

export function toProjectMetadata(project: ProjectDto): Metadata {
  const cover = project.cover.url ? toPhoto(project.cover, POSTER) : null;
  const description = htmlToText(project.description).replace(/\n/g, " ");
  return {
    title: project.name,
    description,
    openGraph: {
      type: "article",
      title: project.name,
      description,
      url: projectHref(project.slug),
      ...(cover ? { images: [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] } : {}),
    },
  };
}
