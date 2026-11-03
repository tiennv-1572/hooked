import type { Metadata } from "next";

import { ACADEMY_COPY, type AcademyCourse, type FeaturedStory } from "@/components/academy/academy-content";
import { studentsPage, type Student } from "@/data/students";
import { routes } from "@/lib/site";

import type { CourseCategoryDto, CourseDto, StudentDto } from "../dto";
import { toPhoto } from "./photo";

/*
 * Academy (/academy) and Student Stories (/academy/students): public DTOs + CMS page singletons → the props of
 * src/components/academy/* and src/components/students/*. Pages stay thin: query, map here, render.
 */

/** `/academy/students?story=jgrayson` — opens that student's reader. */
const storyHref = (slug: string) => `${routes.students}?story=${encodeURIComponent(slug)}`;

/** "DJ · Hooked Academy". */
const roleLabel = (student: Pick<StudentDto, "role" | "affiliation">) => `${student.role} · ${student.affiliation}`;

// ---------------------------------------------------------------------------------------------------------
// Academy

export function toAcademyCourse(course: CourseDto): AcademyCourse {
  return {
    id: course.id,
    title: course.title,
    category: course.category?.label ?? "",
    description: course.description,
    instructors: course.instructors,
    duration: course.duration,
    schedule: course.schedule.map((line) => (line.label ? { label: line.label, value: line.value } : line.value)),
    tuition: course.tuition,
    modules: course.modules,
    benefits: course.benefits,
    image: toPhoto(course.image),
    zoomTopLeft: course.zoomTopLeft || undefined,
  };
}

/** A student of the Academy "Câu chuyện học viên" carousel (`getStudents({ featured: true })`). */
export function toFeaturedStory(student: StudentDto): FeaturedStory {
  return {
    slug: student.slug,
    name: student.name,
    role: roleLabel(student),
    headline: student.headline ?? "",
    portrait: toPhoto(student.portrait),
    href: storyHref(student.slug),
  };
}

export function toAcademyView({
  courses,
  categories,
  featured,
}: {
  courses: CourseDto[];
  categories: CourseCategoryDto[];
  featured: StudentDto[];
}) {
  const academyCourses = courses.map(toAcademyCourse);
  // Filter chips: categories that have a published course, in the CMS order of "Danh mục khóa học".
  const used = new Set(courses.map((course) => course.category?.id));
  const chips = categories.filter((category) => used.has(category.id)).map((category) => category.label);
  return {
    overlays: { courses: academyCourses, registration: ACADEMY_COPY.registration },
    courses: { title: ACADEMY_COPY.title, courses: academyCourses },
    directory: {
      courses: academyCourses,
      categories: chips,
      heading: ACADEMY_COPY.coursesHeading,
      columnLabel: ACADEMY_COPY.directoryHeading,
    },
    stories: {
      students: featured.map(toFeaturedStory),
      headingLines: ACADEMY_COPY.storiesHeadingLines,
      ctaLabel: ACADEMY_COPY.storiesCtaLabel,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Student Stories

export function toStudent(student: StudentDto): Student {
  const { crop } = student.portrait;
  return {
    slug: student.slug,
    name: student.name,
    role: student.role,
    affiliation: student.affiliation,
    portrait: crop ? { ...toPhoto(student.portrait), crop } : toPhoto(student.portrait),
    story: student.story,
  };
}

/** The page copy is fixed (design); the CMS supplies the students. */
export function toStudentsView({ students }: { students: StudentDto[] }) {
  return {
    intro: {
      titleLines: studentsPage.titleLines,
      description: studentsPage.description,
      collectionLabel: studentsPage.collectionLabel,
      countLabel: `${students.length} HỌC VIÊN`,
    },
    stories: {
      students: students.map(toStudent),
      labels: {
        title: studentsPage.title,
        readLabel: studentsPage.readLabel,
        readerLabel: studentsPage.readerLabel,
      },
    },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Metadata

/** `generateMetadata` from a page singleton's `seo` block (the site layout's title template adds the site name). */
export function toPageMetadata({ seo }: { seo: { title: string; description: string } }): Metadata {
  return { title: seo.title, description: seo.description };
}
