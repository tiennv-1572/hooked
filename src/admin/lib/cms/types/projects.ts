import type { Entity, ID, ImageRef, PublishStatus } from "./shared";

/** Projects domain: portfolio projects, their service categories (filters), the overview page and its card layout. */

export type ProjectCategory = Entity & {
  slug: string;
  label: string;
  order: number;
};

export type ProjectPhoto = ImageRef & { id: ID };

export type ProjectVideo = {
  id: ID;
  youtubeId: string;
  title: string;
  thumbnail: ImageRef;
};

/** Card format of a cell in the overview "Tất cả" grid (Figma editorial grid). */
export type ProjectCardFormat = "landscape" | "portrait" | "compact" | "wide" | "panorama";
export const PROJECT_CARD_FORMATS: ProjectCardFormat[] = ["landscape", "portrait", "compact", "wide", "panorama"];

export type Project = Entity & {
  slug: string;
  /** "Devoid Music Festival" — the site upper-cases it with CSS where the design shows caps. */
  name: string;
  /**
   * ProjectCategory ids, in the editor's order: filters on /projects, the tag line under the name and the
   * "Dịch vụ cung cấp" list of the detail page.
   */
  categoryIds: ID[];
  /** "Đối tác" list — empty hides the column. */
  partners: string[];
  /** HTML from the rich-text editor (sanitized again on the server). */
  description: string;
  /** Overview poster. */
  cover: ImageRef;
  /** Detail page hero, shown whole (no crop). */
  heroImage: ImageRef;
  photos: ProjectPhoto[];
  videos: ProjectVideo[];
  /** Video played from the overview card; null → "Video đang được cập nhật." */
  featuredVideoId: ID | null;
  albumLink: { label: string; href?: string };
  status: PublishStatus;
  order: number;
};

/** A cell of the overview "Tất cả" grid: its format and the project shown (the same project may fill several cells). */
export type ProjectsLayoutSlot = { id: ID; format: ProjectCardFormat; projectId: ID | null };

/**
 * "Cài đặt hiển thị dự án": the cells of the overview "Tất cả" grid, top to bottom. A cell whose project is not
 * published is skipped; with no cell left every published project gets a full-width row.
 */
export type ProjectsLayout = { slots: ProjectsLayoutSlot[] };

/** Projects overview page: SEO only; the heading, "Tất cả" chip and empty state are fixed on the site (PROJECTS_COPY). */
export type ProjectsPage = {
  seo: { title: string; description: string };
};
