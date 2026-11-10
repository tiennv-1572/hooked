import type { Photo } from "@/data/home";
import type { MediaRef, ProjectImage, ProjectPhoto, ProjectVideo } from "@/data/project-details";
import type { ProjectCardFormat } from "@/data/projects";

/*
 * Shapes the Projects components take. The content comes from the CMS (src/server/content/views/projects.ts maps the
 * public DTOs into these), so category ids are free-form slugs and the project list can change at any time.
 */

/** Id of the "Tất cả" chip; every other chip id is a category slug. */
export const ALL_PROJECTS = "all";

/** Filter chip: `ALL_PROJECTS` or a category slug. */
export type ProjectFilterOption = { id: string; label: string };

/** A card of the Projects overview gallery. */
export type ProjectCardData = {
  slug: string;
  /** Card title, upper-cased with CSS as in Figma. */
  name: string;
  /** Category labels, the tag line under the title, joined with " · " ("Media · Event production · DJ Contest"). */
  tags: string[];
  /** Category slugs — filter membership. */
  categories: string[];
  /** Poster with the orange graffiti frame (text baked into the image). */
  cover: Photo;
};

/**
 * What a card plays while hovered: its YouTube video (muted; `zoom` crops black bars baked into letterboxed videos) or
 * a slideshow of its album.
 */
export type ProjectPreview = { type: "video"; youtubeId: string; zoom: number } | { type: "album"; photos: Photo[] };

/** A cell of the desktop "Tất cả" grid (CMS "Cài đặt hiển thị dự án"): format + the project card it shows. */
export type ProjectGridCell = { format: ProjectCardFormat; slug: string };

/** "No projects for this filter" copy; the title is followed by ` cho “<filter label>”`. */
export type ProjectsEmptyCopy = { title: string; body: string };

/** Fixed copy of the Projects overview: heading, "Tất cả" chip and the empty state (not drawn in Figma). */
export const PROJECTS_COPY = {
  title: "Hooked Projects",
  allFilterLabel: "Tất cả",
  emptyState: {
    title: "Chưa có dự án",
    body: "Chưa có dự án nào thuộc dịch vụ này. Xem tất cả dự án của Hooked.",
  } satisfies ProjectsEmptyCopy,
};

/** A project detail page. */
export type ProjectDetailData = {
  slug: string;
  /** "Devoid Music Festival": page title / metadata, and the H1 upper-cased with CSS. */
  name: string;
  /** Category labels: orange tag line under the H1 and the "Dịch vụ cung cấp" list. */
  categories: string[];
  /** "Đối tác" list — empty hides the column. */
  partners: string[];
  /** Sanitized HTML. */
  description: string;
  cover: {
    /** Shown whole at its own ratio. */
    image: ProjectImage & { alt: string };
    /** Media a click on the cover opens; `null` (no photo or video) renders a plain image. */
    opens: MediaRef | null;
  };
  /** Photo lightbox order. */
  photos: ProjectPhoto[];
  /** `id` is the YouTube id. */
  videos: ProjectVideo[];
  /** Album columns: 3 columns ≥ 1200px, 2 below. */
  masonry: { desktop: MediaRef[][]; mobile: MediaRef[][] };
  /** Link under the album (external channel, or opens the photo lightbox); `null` hides it. */
  albumLink: { label: string; href?: string } | null;
};

export function filterProjects(projects: ProjectCardData[], filter: string) {
  return filter === ALL_PROJECTS ? projects : projects.filter((project) => project.categories.includes(filter));
}

/** Lower-case ASCII words: "International artists booking" → ["international", "artists", "booking"]. */
function words(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Same word, or one is a prefix (≥ 3 letters) of the other: "event" ~ "events", "consult" ~ "consultant". */
const sameWord = (a: string, b: string) =>
  a === b || (Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a)));

/**
 * Map a `?service=` value to the closest filter chip. Accepts category slugs, chip labels ("Event production") and the
 * Home service ids (`media`, `artists-management-booking`, `event`): the category sharing the most words wins, ties go
 * to the first chip. Unknown or empty values fall back to `ALL_PROJECTS`.
 */
export function resolveProjectFilter(value: string | null | undefined, filters: ProjectFilterOption[]): string {
  const key = words(value ?? "");
  if (!key.length) return ALL_PROJECTS;
  const slug = key.join("-");
  const categories = filters.filter((filter) => filter.id !== ALL_PROJECTS);
  const exact = categories.find((filter) => filter.id === slug || words(filter.label).join("-") === slug);
  if (exact) return exact.id;

  let best = { id: ALL_PROJECTS, score: 0 };
  for (const filter of categories) {
    const vocabulary = [...words(filter.id), ...words(filter.label)];
    const score = key.filter((word) => vocabulary.some((entry) => sameWord(word, entry))).length;
    if (score > best.score) best = { id: filter.id, score };
  }
  return best.id;
}
