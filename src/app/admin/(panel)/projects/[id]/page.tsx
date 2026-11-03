import type { Metadata } from "next";

import { ProjectEditor } from "@/admin/modules/projects/project-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Dự án" };

/** `/admin/projects/new` creates; `/admin/projects/<id>` edits. The id is read client-side (useParams). */
export default function ProjectEditorPage() {
  return <ProjectEditor />;
}
