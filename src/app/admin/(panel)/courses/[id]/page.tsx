import type { Metadata } from "next";

import { CourseEditor } from "@/admin/modules/academy/course-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Khóa học" };

/** `/admin/courses/new` creates; `/admin/courses/<id>` edits. The id is read client-side (useParams). */
export default function CourseEditorPage() {
  return <CourseEditor />;
}
