import type { Metadata } from "next";

import { StudentsPageEditor } from "@/admin/modules/academy/students-page-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Học viên tiêu biểu" };

export default function StudentsPageEditorPage() {
  return <StudentsPageEditor />;
}
