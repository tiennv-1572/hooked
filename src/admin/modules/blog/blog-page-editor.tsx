"use client";

import { z } from "zod";

import { SeoSection, seoSchema } from "@/admin/components/cms/seo-section";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import type { BlogPage } from "@/admin/lib/cms/types/blog";

const schema = z.object({ seo: seoSchema }) satisfies z.ZodType<BlogPage>;

/** `/admin/pages/blog` — SEO only (the `/blog` index header is fixed on the site). */
export function BlogPageEditor() {
  const editor = useSingletonEditor("blogPage", schema);
  return (
    <SingletonEditor
      editor={editor}
      title="Trang Blog"
      description="Bài viết được quản lý ở mục Bài viết."
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Trang" }, { label: "Blog" }]}
    >
      <SeoSection path="/blog" />
    </SingletonEditor>
  );
}
