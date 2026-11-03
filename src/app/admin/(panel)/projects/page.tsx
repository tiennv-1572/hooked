import type { Metadata } from "next";

import { ProjectsList } from "@/admin/modules/projects/projects-list";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Dự án" };

export default function ProjectsPage() {
  return <ProjectsList />;
}
