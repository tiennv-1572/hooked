import type { Metadata } from "next";

import { AcademyOverlays } from "@/components/academy/academy-overlays";
import { CourseDirectory } from "@/components/academy/course-directory";
import { CoursesSection } from "@/components/academy/courses-section";
import { StudentStoriesSection } from "@/components/academy/student-stories-section";
import { getAcademyPage, getCourseCategories, getCourses, getStudents } from "@/server/content/queries";
import { toAcademyView, toPageMetadata } from "@/server/content/views/academy";

export async function generateMetadata(): Promise<Metadata> {
  return toPageMetadata(await getAcademyPage());
}

/** Academy — Figma "02 · Academy" (2815:4691; desktop 2075:273, mobile 2818:4704). Content: CMS courses, featured students; `academyPage` holds the SEO. */
export default async function AcademyPage() {
  const [courses, categories, featured] = await Promise.all([
    getCourses(),
    getCourseCategories(),
    getStudents({ featured: true }),
  ]);
  const view = toAcademyView({ courses, categories, featured });

  return (
    <AcademyOverlays {...view.overlays}>
      {/* "00 · Background / Gradient + grain": ink, warming towards the footer. */}
      <div className="grain bg-[linear-gradient(180deg,var(--color-ink)_0%,var(--color-ink)_80%,#120603_100%)] desktop:bg-[linear-gradient(180deg,var(--color-ink)_0%,var(--color-ink)_78%,#0d0402_88%,#240a05_100%)]">
        <CoursesSection {...view.courses} />
        <CourseDirectory {...view.directory} />
        <StudentStoriesSection {...view.stories} />
      </div>
    </AcademyOverlays>
  );
}
