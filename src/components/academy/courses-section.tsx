import type { AcademyCourse } from "@/components/academy/academy-content";
import { CourseCarousel } from "@/components/academy/course-carousel";
import { Container } from "@/components/ui/container";

/**
 * Page heading + course carousel.
 * Desktop (`Academy / Courses` 2039:89): centered 88px "ACADEMY" over an ember radial glow.
 * Mobile (`Academy / Page heading` 2823:5027 + carousel 2823:5029): left-aligned 44px heading.
 */
export function CoursesSection({ title, courses }: { title: string; courses: AcademyCourse[] }) {
  return (
    <section
      aria-labelledby="academy-title"
      className="desktop:bg-[radial-gradient(1091px_466px_at_50%_50%,#542810_0%,#391c0e_24%,#1d100b_48%,#110906_74%,var(--color-ink)_100%)] desktop:px-6 desktop:pt-8 desktop:pb-6"
    >
      <Container data-reveal="stagger" className="pt-10 pb-6 desktop:p-0">
        <h1
          id="academy-title"
          className="text-[44px] leading-[49px] font-extrabold text-white desktop:bg-[linear-gradient(90deg,var(--color-ivory),var(--color-white))] desktop:bg-clip-text desktop:text-center desktop:text-[88px] desktop:leading-[104px] desktop:tracking-[-2.64px] desktop:text-transparent"
        >
          {title}
        </h1>
      </Container>
      {courses.length > 0 ? (
        <div className="desktop:mt-6">
          <CourseCarousel courses={courses} />
        </div>
      ) : null}
    </section>
  );
}
