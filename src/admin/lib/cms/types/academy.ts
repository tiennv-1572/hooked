import type { Entity, ID, ImageRef, PublishStatus } from "./shared";

/** Academy domain: courses, students, registrations (leads) and the two page singletons. */

/** Course category (CMS "Danh mục khóa học"): filter chips of the course directory on /academy. */
export type CourseCategory = Entity & {
  /** Chip / badge label ("DJ", "Producer"). */
  label: string;
  order: number;
};

/** "Thời lượng: 1 tiếng/ca" → { label: "Thời lượng", value: "1 tiếng/ca" }; plain lines have no label. */
export type InfoLine = { label?: string; value: string };

export type Course = Entity & {
  /** Course name as typed by editors ("DJ cơ bản"); the website upper-cases it where the design does. */
  title: string;
  /** `CourseCategory.id`. */
  categoryId: ID;
  description: string;
  instructors: { label: string; value: string }[];
  /** Lộ trình ("Từ 2 đến 3 tháng"). */
  duration: string;
  schedule: InfoLine[];
  /** Học phí ("15.000.000 VND"). */
  tuition: string;
  modules: string[];
  benefits: string[];
  image: ImageRef;
  /** Show only the top-left of the photo on the desktop card (hides baked-in lockups). */
  zoomTopLeft?: boolean;
  status: PublishStatus;
  order: number;
};

export type Student = Entity & {
  /** Made from the name when the student is created (`collectionMeta.students.autoSlug`); used in `?story=`. */
  slug: string;
  name: string;
  /** Free text typed by editors ("DJ", "MC HYPE"). */
  role: string;
  /** "Hooked Academy". */
  affiliation: string;
  portrait: ImageRef;
  /**
   * Optional portrait crop used by cards: the photo is drawn `scale` × the frame width, left-aligned, and shifted
   * up by `top` (fraction of the drawn width, e.g. 0.04) — same maths as the site's `StudentPhoto`.
   */
  crop?: { scale: number; top: number };
  /** Story shown in the reader — HTML from the rich-text editor (sanitized again on the server). */
  story: string;
  /** Featured in the Academy page story carousel. */
  featured: boolean;
  /** Short quote shown on the Academy story carousel. */
  headline?: string;
  status: PublishStatus;
  order: number;
};

export type LeadStatus = "new" | "contacted" | "enrolled" | "closed";
export const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "enrolled", "closed"];

/** One step of a registration's status workflow (oldest first). */
export type LeadEvent = { status: LeadStatus; at: string; by?: string };

/** A registration from the "Đăng ký tư vấn" form. */
export type Lead = Entity & {
  name: string;
  phone: string;
  email?: string;
  courseId: ID;
  status: LeadStatus;
  /** Where the form was opened ("Academy · carousel", "Course program modal"…). */
  source: string;
  note?: string;
  /** Status changes made in the CMS (the timeline in the lead detail sheet). */
  history?: LeadEvent[];
};

/** Academy page: SEO only; the heading, section labels and the "Đăng ký tư vấn" dialog copy are fixed on the site. */
export type AcademyPage = {
  seo: { title: string; description: string };
};

/** Student Stories page: SEO only; its heading, labels and reader copy are fixed on the site (`studentsPage` in src/data/students.ts). */
export type StudentsPage = {
  seo: { title: string; description: string };
};
