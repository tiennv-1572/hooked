import type { Metadata } from "next";

import { BlogPageEditor } from "@/admin/modules/blog/blog-page-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Blog" };

export default function BlogPageContentPage() {
  return <BlogPageEditor />;
}
