import type { Metadata } from "next";

import { StudentEditor } from "@/admin/modules/academy/student-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Học viên" };

/** `/admin/students/new` creates; `/admin/students/<id>` edits. The id is read client-side (useParams). */
export default function StudentEditorPage() {
  return <StudentEditor />;
}
