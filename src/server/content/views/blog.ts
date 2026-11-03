import type { Metadata } from "next";

import type { BlogPage } from "@/admin/lib/cms/types/blog";
import {
  BLOG_INDEX_COPY,
  type ArticleBlock,
  type BlogArticleData,
  type BlogPostCardData,
} from "@/components/blog/blog-content";
import { blogHref, routes, siteConfig } from "@/lib/site";

import type { ImageDto, PostBlockDto, PostDto, PostSummaryDto } from "../dto";
import { toPhoto } from "./photo";

/*
 * Blog index (/blog) and blog post (/blog/[slug]): public DTOs + the `blogPage` singleton → the props of
 * src/components/blog/**. Pages stay thin: query, map here, render.
 */

/** Intrinsic size used only when an image was saved without dimensions (pasted URL): the 3:2 article photos. */
const PHOTO = { width: 1200, height: 800 } as const;

const photo = (image: ImageDto) => toPhoto(image, PHOTO);

const ogImage = (image: ImageDto | null) => {
  if (!image?.url) return {};
  const { src, alt, width, height } = photo(image);
  return { images: [{ url: src, width, height, ...(alt ? { alt } : {}) }] };
};

// ---------------------------------------------------------------------------------------------------------
// Index

export function toBlogPostCard(post: PostSummaryDto): BlogPostCardData {
  return {
    slug: post.slug,
    title: post.title,
    kicker: post.kicker,
    excerpt: post.excerpt,
    cover: photo(post.cover),
    readingMinutes: post.readingMinutes,
  };
}

export function toBlogIndex({ posts }: { posts: PostSummaryDto[] }) {
  return { ...BLOG_INDEX_COPY, posts: posts.map(toBlogPostCard) };
}

/** The newest post's cover doubles as the index Open Graph image. */
export function toBlogIndexMetadata({ page, posts }: { page: BlogPage; posts: PostSummaryDto[] }): Metadata {
  const { title, description } = page.seo;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title: `${title} · ${siteConfig.name}`,
      description,
      url: routes.blog,
      ...ogImage(posts[0]?.cover ?? null),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Post

function toArticleBlock(block: PostBlockDto): ArticleBlock {
  switch (block.type) {
    case "heading":
      return { type: "heading", text: block.text };
    case "paragraph":
      return { type: "paragraph", html: block.html };
    case "list":
      return { type: "list", items: block.items.map((item) => item.parts) };
    case "image":
      return { type: "image", image: photo(block.image), caption: block.caption };
    case "imagePair":
      return { type: "imagePair", images: [photo(block.images[0]), photo(block.images[1])] };
    case "quote":
      return { type: "quote", text: block.text, cite: block.cite };
    case "cta":
      return { type: "cta", label: block.label, href: block.href };
  }
}

export function toBlogArticle(post: PostDto): BlogArticleData {
  return {
    title: post.title,
    intro: post.intro.parts,
    ...(post.introCta ? { introCta: post.introCta } : {}),
    hero: photo(post.cover),
    body: post.blocks.map(toArticleBlock),
  };
}

/** SEO fields fall back to the title / excerpt / cover (the DTO already applies the first two). */
export function toBlogPostMetadata(post: PostDto): Metadata {
  return {
    title: post.seo.title,
    description: post.seo.description,
    openGraph: {
      type: "article",
      title: post.seo.title,
      description: post.seo.description,
      url: blogHref(post.slug),
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...ogImage(post.seo.image ?? post.cover),
    },
  };
}
