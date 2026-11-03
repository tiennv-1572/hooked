import type { MetadataRoute } from "next";

import { blogHref, projectHref, routes } from "@/lib/site";
import { getPosts, getProjects } from "@/server/content/queries";
import { siteUrl } from "@/server/content/views/site";

/** Reads the CMS through the cached queries, so it stays prerendered and admin saves (revalidateTag) refresh it. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), allPosts()]);
  const url = (path: string) => `${siteUrl}${path}`;

  return [
    ...Object.values(routes).map((path) => ({ url: url(path) })),
    ...projects.map((project) => ({ url: url(projectHref(project.slug)) })),
    ...posts.map((post) => ({
      url: url(blogHref(post.slug)),
      ...(post.publishedAt ? { lastModified: post.publishedAt } : {}),
    })),
  ];
}

/** `getPosts` caps a page at 50 posts. */
async function allPosts() {
  const first = await getPosts({ limit: 50 });
  const rest = await Promise.all(
    Array.from({ length: first.meta.totalPages - 1 }, (_, index) => getPosts({ limit: 50, page: index + 2 })),
  );
  return [first, ...rest].flatMap((result) => result.data);
}
