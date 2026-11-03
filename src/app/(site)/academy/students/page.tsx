import type { Metadata } from "next";

import { StoriesIntro } from "@/components/students/stories-intro";
import { StudentStories } from "@/components/students/student-stories";
import { Container } from "@/components/ui/container";
import { getStudents, getStudentsPage } from "@/server/content/queries";
import { toPageMetadata, toStudentsView } from "@/server/content/views/academy";

export async function generateMetadata(): Promise<Metadata> {
  return toPageMetadata(await getStudentsPage());
}

/**
 * Student Stories — Figma "03 · Student Stories" (2846:5166): desktop 2186:2455, tablet example 2830:5098,
 * mobile 2818:4714. Content: CMS students (`studentsPage` holds the SEO). `?story=<slug>` opens that student's reader
 * (handled client-side, the page stays static).
 */
export default async function StudentStoriesPage() {
  const view = toStudentsView({ students: await getStudents() });

  return (
    <section
      aria-labelledby="students-title"
      // 00 · Background / Gradient + grain: ink, warming up just before the footer on desktop.
      className="grain bg-ink pt-10 pb-10 tablet:pt-12 tablet:pb-12 desktop:bg-[linear-gradient(180deg,var(--color-ink)_calc(100%_-_261px),#0d0402_calc(100%_-_76px),#1a0803_100%)] desktop:pt-15 desktop:pb-20"
    >
      <Container>
        <StoriesIntro id="students-title" {...view.intro} />
        <StudentStories {...view.stories} className="mt-10" />
      </Container>
    </section>
  );
}
