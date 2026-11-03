import type { Entity, ID, ImageRef, LinkRef, PublishStatus } from "./shared";

/**
 * Blog domain.
 *
 * `paragraph` blocks hold HTML from the rich-text editor (one block may hold several paragraphs; sanitized again on
 * the server). `list` items and `intro` use a tiny markdown subset:
 *   **bold lead-in**   and   [link text](/projects/devoid-music-festival)
 * (see `src/admin/lib/cms/inline.ts` for parse/serialise helpers).
 */
export type PostBlock =
  | { id: ID; type: "heading"; text: string }
  | { id: ID; type: "paragraph"; html: string }
  | { id: ID; type: "list"; items: string[] }
  | { id: ID; type: "image"; image: ImageRef; caption?: string }
  | { id: ID; type: "imagePair"; images: [ImageRef, ImageRef] }
  | { id: ID; type: "quote"; text: string; cite?: string }
  | { id: ID; type: "cta"; label: string; href: string };

export type PostBlockType = PostBlock["type"];

export type Post = Entity & {
  slug: string;
  title: string;
  /** Short label for the index card ("Hooked × Sun Group"). */
  kicker: string;
  /** Introduction paragraph (inline markdown); its first ~160 characters are the index card text and meta description. */
  intro: string;
  introCta?: LinkRef;
  cover: ImageRef;
  blocks: PostBlock[];
  tags: string[];
  author: string;
  status: PublishStatus;
  /** ISO date-time; scheduled when in the future. */
  publishedAt?: string;
  seo: { title?: string; description?: string; image?: ImageRef };
};

/** Blog index page: SEO only; its heading and lead are fixed on the site (BLOG_INDEX_COPY). */
export type BlogPage = {
  seo: { title: string; description: string };
};
