/*
 * Public API v1 data shapes (DTOs) — what /api/v1/* returns and what the website's Server Components consume.
 * Only published content is exposed; admin-only fields (status, order, notes…) are stripped.
 * Documented in the OpenAPI spec (src/server/openapi/spec.ts).
 */

export type ImageDto = { url: string; alt: string; width?: number; height?: number };
export type LinkDto = { label: string; href: string };
export type NavItemDto = { label: string; href: string; newTab: boolean };

export type SiteDto = {
  name: string;
  tagline: string;
  description: string;
  company: { legalName: string; address: string; email: string; phone: { display: string; href: string } };
  socials: LinkDto[];
  seo: { titleTemplate: string; defaultTitle: string; ogImage: ImageDto | null };
  navigation: { desktop: NavItemDto[]; mobile: NavItemDto[]; footer: NavItemDto[] };
};

export type PartnerDto = { id: string; name: string; logo: ImageDto; website: string | null };
export type CollaborationDto = { id: string; title: string; partnerLabel: string; href: string; image: ImageDto };

export type HomeDto = {
  /** `type: "video"` → muted looping YouTube background (`youtubeId`), `image` is its poster. */
  hero: { slides: { id: string; type: "image" | "video"; image: ImageDto; youtubeId: string | null }[] };
  intro: { titleLines: string[]; body: string };
  highlights: { id: string; title: string; href: string; align: "start" | "end"; image: ImageDto }[];
  services: {
    id: string;
    title: string;
    titleLines: string[] | null;
    description: string;
    href: string;
    image: ImageDto;
  }[];
  blogCarousel: {
    initialIndex: number;
    items: { id: string; title: string; lines: [string, string]; href: string; image: ImageDto }[];
  };
  partners: { titleLines: string[]; body: string; cta: LinkDto; logos: PartnerDto[] };
};

/** CMS "Danh mục khóa học" — filter chips of the course directory on /academy. */
export type CourseCategoryDto = { id: string; label: string };

export type CourseDto = {
  id: string;
  /** Course name as typed in the CMS ("DJ cơ bản"); upper-case it in the UI where the design does. */
  title: string;
  /** `null` only if the course points at a category that no longer exists. */
  category: CourseCategoryDto | null;
  description: string;
  instructors: { label: string; value: string }[];
  duration: string;
  /** Lines of the "Giờ học" block; `label` is shown bold ("Thời lượng: 1 tiếng/ca"). */
  schedule: { label: string | null; value: string }[];
  tuition: string;
  modules: string[];
  benefits: string[];
  image: ImageDto;
  zoomTopLeft: boolean;
};

export type StudentDto = {
  id: string;
  slug: string;
  name: string;
  role: string;
  affiliation: string;
  portrait: ImageDto & { crop: { scale: number; top: number } | null };
  /** Sanitized HTML. */
  story: string;
  featured: boolean;
  headline: string | null;
};

export type ProjectCategoryDto = { id: string; slug: string; label: string };

export type ProjectVideoDto = { id: string; youtubeId: string; title: string; thumbnail: ImageDto };

export type ProjectSummaryDto = {
  id: string;
  slug: string;
  /** Natural case ("Devoid Music Festival"); the site upper-cases it with CSS. */
  name: string;
  /** Editor's order: filters, the tag line under the name and the detail page's "Dịch vụ cung cấp" list. */
  categories: ProjectCategoryDto[];
  cover: ImageDto;
  featuredVideo: ProjectVideoDto | null;
};

/** A cell of the /projects "Tất cả" grid (desktop), top to bottom. */
export type ProjectGridCellDto = {
  format: "landscape" | "portrait" | "compact" | "wide" | "panorama";
  projectId: string;
};

export type ProjectDto = ProjectSummaryDto & {
  partners: string[];
  /** Sanitized HTML. */
  description: string;
  /** Shown whole (no crop). */
  hero: { image: ImageDto };
  photos: (ImageDto & { id: string })[];
  videos: ProjectVideoDto[];
  albumLink: { label: string; href: string | null };
};

/**
 * Article body blocks. Text fields use an inline markdown subset: `**bold**` and `[label](/href)`.
 * `parts` is the same text pre-parsed into runs (plain string | { text, bold?, href? }).
 */
export type InlineRun = string | { text: string; bold?: boolean; href?: string };
export type PostBlockDto =
  | { id: string; type: "heading"; text: string }
  /** Sanitized HTML: one or more `<p>` with bold / italic / underline, links, lists, quotes. */
  | { id: string; type: "paragraph"; html: string }
  | { id: string; type: "list"; items: { text: string; parts: InlineRun[] }[] }
  | { id: string; type: "image"; image: ImageDto; caption: string | null }
  | { id: string; type: "imagePair"; images: [ImageDto, ImageDto] }
  | { id: string; type: "quote"; text: string; cite: string | null }
  | { id: string; type: "cta"; label: string; href: string };

export type PostSummaryDto = {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  /** First ~160 characters of the intro, as plain text (index card, meta description). */
  excerpt: string;
  cover: ImageDto;
  tags: string[];
  author: string;
  publishedAt: string | null;
  readingMinutes: number;
};

export type PostDto = PostSummaryDto & {
  /** Sanitized rich-text HTML (one or more `<p>`) and its plain text. */
  intro: { html: string; text: string };
  introCta: LinkDto | null;
  blocks: PostBlockDto[];
  seo: { title: string; description: string; image: ImageDto | null };
};

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

export type RegistrationResultDto = {
  id: string;
  status: "new";
  course: { id: string; title: string };
  createdAt: string;
};
