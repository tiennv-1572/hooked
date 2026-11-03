"use client";

import { z } from "zod";

import { SeoSection, seoSchema } from "@/admin/components/cms/seo-section";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import type { AcademyPage } from "@/admin/lib/cms/types/academy";

const schema = z.object({ seo: seoSchema }) satisfies z.ZodType<AcademyPage>;

/** Academy page: SEO only (the heading, section labels and the registration form are fixed on the site). */
export function AcademyPageEditor() {
  const editor = useSingletonEditor("academyPage", schema);
  return (
    <SingletonEditor
      editor={editor}
      title="Trang Academy"
      description="Khóa học và học viên được quản lý ở mục riêng."
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Trang" }, { label: "Academy" }]}
    >
      <SeoSection path="/academy" />
    </SingletonEditor>
  );
}
