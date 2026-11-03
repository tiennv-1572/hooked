import type { Metadata } from "next";

import { ProjectCategories } from "@/admin/modules/projects/project-categories";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Danh mục dự án" };

export default function ProjectCategoriesPage() {
  return <ProjectCategories />;
}
