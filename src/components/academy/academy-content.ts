import type { Course, FeaturedStudent } from "@/data/academy";

/*
 * Shapes the Academy components take. The content comes from the CMS (src/server/content/views/academy.ts maps the
 * public DTOs into these), so course ids are free-form strings and the course list can change at any time.
 */

/**
 * A course as rendered by the carousel, directory and overlays: the design's `Course` with a CMS id, one CMS name
 * (`title`, natural case — components upper-case it with CSS where the design does) and its category label.
 */
export type AcademyCourse = Omit<Course, "id" | "category" | "indexTitle" | "previewTitle"> & {
  id: string;
  category: string;
};

/** A student on the "Câu chuyện học viên" carousel; `href` opens their reader on the Student Stories page. */
export type FeaturedStory = FeaturedStudent & { href: string };

/** "Đăng ký tư vấn" dialog copy. */
export type RegistrationCopy = {
  title: string;
  description: string;
  /** Success heading, one entry per line ("Đã nhận thông tin" / "của bạn."). */
  successTitleLines: string[];
  successBody: string;
  privacyNote: string;
};

/** Fixed copy of the Academy page (design): heading, section labels and the "Đăng ký tư vấn" dialog. */
export const ACADEMY_COPY = {
  title: "ACADEMY",
  /** Directory heading on mobile / tablet. */
  coursesHeading: "Tất cả khóa học",
  /** Directory column header on desktop. */
  directoryHeading: "KHÓA HỌC",
  storiesHeadingLines: ["HỌC VIÊN", "TIÊU BIỂU"],
  storiesCtaLabel: "Tất cả câu chuyện",
  registration: {
    title: "Đăng ký tư vấn",
    description: "Để lại thông tin để Hooked đồng hành cùng bạn chọn khóa học phù hợp.",
    successTitleLines: ["Đã nhận thông tin", "của bạn."],
    successBody: "Hooked sẽ liên hệ để tư vấn lộ trình và lịch học phù hợp với bạn.",
    privacyNote: "Hooked sử dụng thông tin này để tư vấn khóa học bạn chọn.",
  } satisfies RegistrationCopy,
};

/** The course with `id`, or the first course (the default selection). */
export function findCourse(courses: readonly AcademyCourse[], id: string | undefined): AcademyCourse | undefined {
  return courses.find((course) => course.id === id) ?? courses[0];
}

/** `source` of the leads sent from the Academy page (shown and filterable in /admin/leads). */
export const registrationSources = {
  /** "Đăng ký ngay" on the course carousel. */
  carousel: "Academy · carousel",
  /** A directory row (opens the program modal). */
  directory: "Academy · danh sách khóa học",
  /** Appended when the form is opened from the program modal: "Academy · danh sách khóa học · chương trình học". */
  program: "chương trình học",
  fallback: "Academy",
} as const;
