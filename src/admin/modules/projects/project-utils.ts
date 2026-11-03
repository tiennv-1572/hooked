import type { ProjectCardFormat, ProjectCategory, ProjectVideo } from "@/admin/lib/cms/types/projects";
import type { ImageRef } from "@/admin/lib/cms/types/shared";

/*
 * Pure helpers shared by the Projects module (list, editor, categories, page copy).
 */

// ---------------------------------------------------------------------------------------------------------
// YouTube

export const YOUTUBE_ID = /^[\w-]{11}$/;

/**
 * Accepts a bare id ("UJvCMG7W6q8") or any common YouTube URL
 * (watch?v=, youtu.be/, /embed/, /shorts/, /live/, music.youtube.com…) and returns the 11-char id.
 */
export function parseYouTubeId(input: string | undefined | null): string | null {
  const value = (input ?? "").trim();
  if (!value) return null;
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.replace(/^(www|m|music)\./, "");
    let candidate: string | null = null;
    if (host === "youtu.be") candidate = url.pathname.split("/")[1] ?? null;
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      candidate =
        url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live|v|e)\/([^/?#]+)/)?.[1] ?? null;
    }
    return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

/** Auto poster served by YouTube for every public video (480×360, letterboxed). */
export const youtubeThumbnailUrl = (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

export function youtubeThumbnail(id: string, title: string): ImageRef {
  return { url: youtubeThumbnailUrl(id), alt: title, width: 480, height: 360 };
}

/** Thumbnail actually shown for a video: custom image, else YouTube's auto poster. */
export function videoPoster(
  video: Pick<ProjectVideo, "youtubeId" | "title"> & { thumbnail?: ImageRef | null },
): ImageRef | undefined {
  if (video.thumbnail?.url) return video.thumbnail;
  return YOUTUBE_ID.test(video.youtubeId ?? "") ? youtubeThumbnail(video.youtubeId, video.title) : undefined;
}

export const isAutoThumbnail = (video: Pick<ProjectVideo, "youtubeId" | "thumbnail">) =>
  video.thumbnail?.url === youtubeThumbnailUrl(video.youtubeId);

// ---------------------------------------------------------------------------------------------------------
// Card formats — Figma ProjectCard (2223:439) on the desktop "Tất cả" editorial grid

export type CardFormatMeta = {
  label: string;
  /** Cell width on the 1192px desktop grid. */
  width: number;
  /** Where the cell sits in its row. */
  hint: string;
  /** Columns on the 3-track grid (464 · 272 · 408), also used by the mini-map icon. */
  colStart: 1 | 2 | 3;
  colSpan: 1 | 2 | 3;
  /** Row of the mini-map icon (the Figma template: Landscape + Portrait, Compact + Wide, Panorama). */
  row: 1 | 2 | 3;
};

export const CARD_FORMAT_META: Record<ProjectCardFormat, CardFormatMeta> = {
  landscape: { label: "Landscape", width: 760, hint: "Lớn, bên trái", row: 1, colStart: 1, colSpan: 2 },
  portrait: { label: "Portrait", width: 408, hint: "Nhỏ, bên phải", row: 1, colStart: 3, colSpan: 1 },
  compact: { label: "Compact", width: 464, hint: "Nhỏ, bên trái", row: 2, colStart: 1, colSpan: 1 },
  wide: { label: "Wide", width: 704, hint: "Lớn, bên phải", row: 2, colStart: 2, colSpan: 2 },
  panorama: { label: "Panorama", width: 1192, hint: "Full chiều ngang", row: 3, colStart: 1, colSpan: 3 },
};

// ---------------------------------------------------------------------------------------------------------
// Categories & misc

export function categoryLabels(ids: string[], categories: ProjectCategory[] | undefined) {
  const byId = new Map((categories ?? []).map((category) => [category.id, category.label]));
  return ids.map((id) => byId.get(id)).filter((label): label is string => Boolean(label));
}

/** First free slug: "devoid" → "devoid-ban-sao" → "devoid-ban-sao-2"… */
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let index = 2;
  while (used.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export const projectPublicHref = (slug: string) => `/projects/${slug}`;

/** Site filter link (`/projects?service=<slug>`), shared with Home "OUR SERVICE". */
export const projectFilterHref = (slug: string) => `/projects?service=${slug}`;

export const SITE_INK = "#050101";
