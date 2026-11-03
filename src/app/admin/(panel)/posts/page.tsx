import type { Metadata } from "next";

import { PostsList } from "@/admin/modules/blog/posts-list";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Bài viết" };

export default function PostsPage() {
  return <PostsList />;
}
