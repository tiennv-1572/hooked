import type { Metadata } from "next";

import { CoursesList } from "@/admin/modules/academy/courses-list";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Khóa học" };

export default function CoursesPage() {
  return <CoursesList />;
}
