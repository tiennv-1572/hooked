/**
 * Projects overview content (Figma "04 · Projects / Overview" 2341:1602 and
 * "90.4 · RUNTIME / Project filters" → Projects / FilteredGallery 2221:3051).
 * Detail-page content (partners, description, media album, featured video) lives in `project-details.ts`;
 * the card play control uses `getFeaturedProjectVideo(slug)` from there (Xóm Húc has none → no play control).
 */
import type { Photo } from "@/data/home";

/** Service categories used both as card tags and as gallery filters. */
export type ProjectCategoryId =
  | "event-production"
  | "artist-management"
  | "media"
  | "music-consultant"
  | "international-artists-booking"
  | "dj-contest";

export type ProjectFilterId = "all" | ProjectCategoryId;

export type ProjectFilter = { id: ProjectFilterId; label: string };

/** Filter chips, in Figma order (lower-case labels as drawn on the chips). */
export const projectFilters: ProjectFilter[] = [
  { id: "all", label: "Tất cả" },
  { id: "event-production", label: "Event production" },
  { id: "artist-management", label: "Artist management" },
  { id: "media", label: "Media" },
  { id: "music-consultant", label: "Music consultant" },
  { id: "international-artists-booking", label: "International artists booking" },
  { id: "dj-contest", label: "DJ Contest" },
];

/** Tag labels as printed under each card title (Title Case, singular "Artist Booking" — Figma copy). */
export const projectServiceLabels: Record<ProjectCategoryId, string> = {
  "event-production": "Event Production",
  "artist-management": "Artist Management",
  media: "Media",
  "music-consultant": "Music Consultant",
  "international-artists-booking": "International Artist Booking",
  "dj-contest": "DJ Contest",
};

/**
 * Figma ProjectCard format (2223:439). On desktop "Tất cả" each format owns a slot of the editorial grid:
 * Landscape 760 · Portrait 408 · Compact 464 · Wide 704 · Panorama 1192 (all 16:9 media).
 */
export type ProjectCardFormat = "landscape" | "portrait" | "compact" | "wide" | "panorama";

export type ProjectSummary = {
  slug: string;
  /** Card title, upper case as in Figma. */
  title: string;
  /** Card tags in display order; also drives filter membership. */
  services: ProjectCategoryId[];
  /** Poster with the orange graffiti frame (text baked into the image). */
  cover: Photo;
  format: ProjectCardFormat;
};

const cover = (slug: string, alt: string): Photo => ({
  src: `/images/projects/covers/${slug}.png`,
  alt,
  width: 2560,
  height: 1440,
});

/**
 * Canonical order = mobile / filtered order (Devoid, SPIN, Xóm Húc, Frequency, Vui Fest).
 * The desktop "Tất cả" grid swaps Frequency (left) and Xóm Húc (right) through grid placement.
 */
export const projects: ProjectSummary[] = [
  {
    slug: "devoid-music-festival",
    title: "DEVOID MUSIC FESTIVAL",
    services: ["event-production", "artist-management", "media", "music-consultant", "international-artists-booking"],
    cover: cover("devoid-music-festival", "Poster Devoid Music Festival: New World, 28.12.2024"),
    format: "landscape",
  },
  {
    slug: "spin-awards",
    title: "SPIN AWARDS",
    services: ["media", "event-production", "dj-contest"],
    cover: cover("spin-awards", "Poster SPIN Awards: Hip-hop Edition, 15.03 - 24.05.2025"),
    format: "portrait",
  },
  {
    slug: "xom-huc",
    title: "“XÓM HÚC” DJ CONTEST",
    services: ["media", "event-production", "dj-contest"],
    cover: cover("xom-huc", "Poster Xóm Húc mùa 2, 24.10 - 30.11.2025"),
    format: "wide",
  },
  {
    slug: "frequency-arena",
    title: "FREQUENCY ARENA FACE2FACE EDM BATTLE",
    services: ["event-production", "artist-management", "media", "music-consultant"],
    cover: cover("frequency-arena", "Poster Frequency Arena Face2Face EDM Battle II, 14.08.2025"),
    format: "compact",
  },
  {
    slug: "vui-fest-cat-ba",
    title: "VUI FEST CÁT BÀ",
    services: ["event-production", "artist-management", "media", "music-consultant"],
    cover: cover("vui-fest-cat-ba", "Poster Vui Fest Cát Bà 2026, khách hàng Sun Group"),
    format: "panorama",
  },
];

export function getProjectSummary(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function filterProjects(list: ProjectSummary[], filter: ProjectFilterId) {
  return filter === "all" ? list : list.filter((project) => project.services.includes(filter));
}

/** Legacy / Home ids → filter ids (Home "OUR SERVICE" links to `/projects?service=<id>`). */
const filterAliases: Record<string, ProjectFilterId> = {
  event: "event-production",
  events: "event-production",
  "artists-management-booking": "artist-management",
  "artist-management-booking": "artist-management",
  "artists-management": "artist-management",
  "international-artist-booking": "international-artists-booking",
  booking: "international-artists-booking",
};

/** Keyword fallback, checked in order, for anything else that looks like a service. */
const filterKeywords: [RegExp, ProjectFilterId][] = [
  [/event/, "event-production"],
  [/artist|management|manage/, "artist-management"],
  [/media/, "media"],
  [/consult/, "music-consultant"],
  [/booking|international/, "international-artists-booking"],
  [/dj|contest/, "dj-contest"],
];

/**
 * Map a `?service=` value to the closest filter. Accepts filter ids, the Home service ids
 * (`media`, `artists-management-booking`, `event`) and loose labels ("Event production").
 * Unknown or empty values fall back to "all".
 */
export function resolveProjectFilter(value: string | null | undefined): ProjectFilterId {
  if (!value) return "all";
  const key = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
  if (!key) return "all";
  const exact = projectFilters.find((filter) => filter.id === key);
  if (exact) return exact.id;
  if (key in filterAliases) return filterAliases[key];
  return filterKeywords.find(([pattern]) => pattern.test(key))?.[1] ?? "all";
}
