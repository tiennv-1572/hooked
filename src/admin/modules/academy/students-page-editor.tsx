"use client";

import { z } from "zod";

import { SeoSection, seoSchema } from "@/admin/components/cms/seo-section";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import type { StudentsPage } from "@/admin/lib/cms/types/academy";

const schema = z.object({ seo: seoSchema }) satisfies z.ZodType<StudentsPage>;

/** Student Stories page (/academy/students): SEO only (the page copy is fixed on the site). */
export function StudentsPageEditor() {
  const editor = useSingletonEditor("studentsPage", schema);
  return (
    <SingletonEditor
      editor={editor}
      title="Trang Học viên tiêu biểu"
      description="Câu chuyện học viên được quản lý ở mục Học viên."
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Trang" }, { label: "Học viên tiêu biểu" }]}
    >
      <SeoSection path="/academy/students" />
    </SingletonEditor>
  );
}
