import type { ArticleBlock as DesignArticleBlock } from "@/data/blog";
import type { Photo } from "@/data/home";

/*
 * Shapes the Blog components take. The content comes from the CMS (src/server/content/views/blog.ts maps the public
 * DTOs into these), so posts, their order and their blocks can change at any time.
 */

/**
 * A block of the reading column: the design's blocks — paragraphs as sanitized CMS rich text, one block possibly
 * holding several `<p>` — plus the CMS-only `image` (single photo + caption) and `quote` blocks, which no Figma
 * article uses yet.
 */
export type ArticleBlock =
  | Exclude<DesignArticleBlock, { type: "paragraph" }>
  | { type: "paragraph"; html: string }
  | { type: "image"; image: Photo; caption: string | null }
  | { type: "quote"; text: string; cite: string | null };

/** Fixed copy of the blog index header (display heading, set in caps by CSS, and lead paragraph). */
export const BLOG_INDEX_COPY = {
  title: "BLOGPOST",
  description:
    "Câu chuyện từ cộng đồng Hooked: những sân khấu học viên bước lên, những giải đấu nuôi dưỡng tài năng và hành trình định hình lại cách đào tạo âm nhạc điện tử.",
};

/** A card of the blog index. */
export type BlogPostCardData = {
  slug: string;
  title: string;
  /** Short label above the title ("Hooked × Sun Group"). */
  kicker: string;
  /** Start of the introduction, plain text. */
  excerpt: string;
  cover: Photo;
  readingMinutes: number;
};

/** A blog post page. */
export type BlogArticleData = {
  title: string;
  /** Introduction, sanitized CMS rich text (one or more `<p>`). */
  intro: string;
  introCta?: { label: string; href: string };
  /** Cover, shown next to the introduction. */
  hero: Photo;
  body: ArticleBlock[];
};
