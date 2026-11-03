import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/blog-index";
import { getBlogPage, getPosts } from "@/server/content/queries";
import { toBlogIndex, toBlogIndexMetadata } from "@/server/content/views/blog";

/** The index has no pagination: one page with the newest posts (the API's maximum page size). */
const POSTS_LIMIT = 50;

export async function generateMetadata(): Promise<Metadata> {
  const [page, posts] = await Promise.all([getBlogPage(), getPosts({ limit: POSTS_LIMIT })]);
  return toBlogIndexMetadata({ page, posts: posts.data });
}

/** Blog index — not in Figma (see BlogIndex). Content: published posts, newest first; `blogPage` holds the SEO. */
export default async function BlogIndexPage() {
  const posts = await getPosts({ limit: POSTS_LIMIT });
  return <BlogIndex {...toBlogIndex({ posts: posts.data })} />;
}
