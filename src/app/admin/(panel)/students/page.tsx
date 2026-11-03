import type { Metadata } from "next";

import { StudentsList } from "@/admin/modules/academy/students-list";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Học viên" };

export default function StudentsPage() {
  return <StudentsList />;
}
