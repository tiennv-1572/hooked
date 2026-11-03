import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BlogArticle, BlogArticleSkeleton } from "@/components/blog/blog-article";
import { getPost, getPostSlugs } from "@/server/content/queries";
import { toBlogArticle, toBlogPostMetadata } from "@/server/content/views/blog";

type Params = PageProps<"/blog/[slug]">["params"];

/**
 * Cache Components needs at least one entry (an empty list fails the build), so an empty CMS prerenders this
 * placeholder, which `notFound()`s like any unknown slug.
 */
const PLACEHOLDER_SLUG = "__no-post__";

/** Published posts are prerendered; posts published later render on their first request (then get cached). */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? toBlogPostMetadata(post) : {};
}

async function BlogPostContent({ params }: { params: Params }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={toBlogArticle(post)} />;
}

/**
 * Blog post — Figma "11–13 · Blog" (2553:3833, 2846:5208, 2846:5213). Content: the published CMS post (`getPost`).
 * `params` is read inside <Suspense> so the route keeps an instant App Shell (Next 16 instant-navigation rule).
 * Unknown, draft or scheduled slugs → `notFound()`.
 */
export default function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<BlogArticleSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}
