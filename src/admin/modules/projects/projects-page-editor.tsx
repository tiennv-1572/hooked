"use client";

import { z } from "zod";

import { SeoSection, seoSchema } from "@/admin/components/cms/seo-section";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import type { ProjectsPage } from "@/admin/lib/cms/types/projects";

const schema = z.object({ seo: seoSchema }) satisfies z.ZodType<ProjectsPage>;

/** /admin/pages/projects — SEO only (the heading, "Tất cả" chip and empty state are fixed on the site). */
export function ProjectsPageEditor() {
  const editor = useSingletonEditor("projectsPage", schema);
  return (
    <SingletonEditor
      editor={editor}
      title="Trang Projects"
      description="Dự án và danh mục được quản lý ở mục riêng."
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Trang" }, { label: "Projects" }]}
    >
      <SeoSection path="/projects" />
    </SingletonEditor>
  );
}
