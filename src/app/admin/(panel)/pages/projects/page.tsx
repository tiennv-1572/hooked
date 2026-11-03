import type { Metadata } from "next";

import { ProjectsPageEditor } from "@/admin/modules/projects/projects-page-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Projects" };

export default function ProjectsPageContentPage() {
  return <ProjectsPageEditor />;
}
