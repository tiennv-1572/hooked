import type { Metadata } from "next";

import { CourseCategories } from "@/admin/modules/academy/course-categories";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Danh mục khóa học" };

export default function CourseCategoriesPage() {
  return <CourseCategories />;
}
