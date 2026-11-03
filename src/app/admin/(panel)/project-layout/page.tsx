import type { Metadata } from "next";

import { ProjectsLayoutEditor } from "@/admin/modules/projects/projects-layout-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Cài đặt hiển thị dự án" };

export default function ProjectLayoutPage() {
  return <ProjectsLayoutEditor />;
}
