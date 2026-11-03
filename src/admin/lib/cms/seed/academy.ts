import { courses as siteCourses, featuredStudents } from "@/data/academy";
import { students as siteStudents, studentsPage as siteStudentsPage } from "@/data/students";
import { paragraphsToHtml } from "@/lib/html-text";

import type {
  AcademyPage,
  Course,
  CourseCategory,
  Lead,
  LeadEvent,
  LeadStatus,
  Student,
  StudentsPage,
} from "../types/academy";
import { daysAgo, img, SEED_NOW, stamp } from "./helpers";

/** The four categories of the original site (ids = lower-case labels, also used by the DB migration). */
export const courseCategorySeed: CourseCategory[] = [
  { id: "dj", label: "DJ" },
  { id: "mc", label: "MC" },
  { id: "producer", label: "Producer" },
  { id: "flip", label: "Flip" },
].map((category, index) => ({ ...stamp(category.id, 130), ...category, order: index }));

export const courseSeed: Course[] = siteCourses.map((course, index) => ({
  ...stamp(course.id, 120 - index, 20 - index),
  // The natural-case name ("DJ cơ bản"); the site upper-cases it where the design does.
  title: course.indexTitle,
  categoryId: course.category.toLowerCase(),
  description: course.description,
  instructors: course.instructors.map((line) => ({ ...line })),
  duration: course.duration,
  schedule: course.schedule.map((line) => (typeof line === "string" ? { value: line } : { ...line })),
  tuition: course.tuition,
  modules: [...course.modules],
  benefits: [...course.benefits],
  image: img(course.image),
  zoomTopLeft: course.zoomTopLeft,
  status: "published",
  order: index,
}));

export const studentSeed: Student[] = siteStudents.map((student, index) => {
  const featured = featuredStudents.find((item) => item.slug === student.slug);
  return {
    ...stamp(student.slug, 90 - index, 30 - (index % 10)),
    slug: student.slug,
    name: student.name,
    role: student.role,
    affiliation: student.affiliation,
    portrait: img(student.portrait),
    crop: student.portrait.crop,
    story: paragraphsToHtml(student.story),
    featured: Boolean(featured),
    headline: featured?.headline,
    status: "published",
    order: index,
  };
});

// --- Mock registrations (leads) over the last 30 days -------------------------------------------------
const FIRST = [
  "Minh",
  "Anh",
  "Khánh",
  "Linh",
  "Tuấn",
  "Hà",
  "Phương",
  "Đức",
  "Trang",
  "Quân",
  "Ngọc",
  "Huy",
  "Mai",
  "Long",
  "Thảo",
];
const LAST = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"];
const MIDDLE = ["Văn", "Thị", "Minh", "Đức", "Thu", "Hoài", "Quốc", "Bảo"];
const SOURCES = ["Academy · carousel", "Academy · danh sách khóa học", "Course program modal", "Trang chủ · Academy"];
const NOTES = [
  "Muốn học buổi tối, đã có controller cơ bản.",
  "Hỏi về học phí trả góp.",
  "Đã đến xem lớp thử.",
  "Cần tư vấn lộ trình từ cơ bản lên toàn diện.",
];

/** Small deterministic PRNG so the mock data is stable between reloads. */
function prng(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
}

function buildLeads(): Lead[] {
  const random = prng(2026);
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  const weights = [0.24, 0.12, 0.14, 0.08, 0.16, 0.12, 0.14]; // DJ cơ bản is the most requested
  const pickCourse = () => {
    let roll = random();
    for (let i = 0; i < weights.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return courseSeed[i] ?? courseSeed[0];
    }
    return courseSeed[0];
  };
  const leads: Lead[] = [];
  for (let i = 0; i < 64; i += 1) {
    const day = Math.floor(Math.pow(random(), 1.3) * 45);
    const status: LeadStatus =
      day < 3
        ? "new"
        : day < 10
          ? pick(["new", "contacted", "contacted"])
          : pick(["contacted", "enrolled", "enrolled", "closed"]);
    const last = pick(LAST);
    const first = pick(FIRST);
    const name = `${last} ${pick(MIDDLE)} ${first}`;
    const slug = first.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
    const created = daysAgo(day, 8 + Math.floor(random() * 13), Math.floor(random() * 60));
    leads.push({
      id: `lead-${String(i + 1).padStart(3, "0")}`,
      createdAt: created,
      updatedAt: created,
      name,
      phone: `09${Math.floor(10000000 + random() * 89999999)}`,
      email: random() > 0.35 ? `${slug}${Math.floor(random() * 90 + 10)}@gmail.com` : undefined,
      courseId: pickCourse().id,
      status,
      source: pick(SOURCES),
      note: random() > 0.7 ? pick(NOTES) : undefined,
    });
  }
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const STAFF = ["Trần Minh Anh", "Lê Thu Hà", "Hooked Admin"];

/**
 * Plausible workflow history for processed leads (contacted within a day, enrolled/closed a few days later).
 * Index-based so it does not consume the PRNG (the generated leads stay identical).
 */
function withHistory(lead: Lead, index: number): Lead {
  if (lead.status === "new") return lead;
  const created = new Date(lead.createdAt).getTime();
  const at = (hours: number) => new Date(Math.min(created + hours * 3_600_000, SEED_NOW.getTime())).toISOString();
  const by = STAFF[index % STAFF.length];
  const history: LeadEvent[] = [{ status: "contacted", at: at(2 + (index % 5) * 4), by }];
  if (lead.status !== "contacted") history.push({ status: lead.status, at: at(48 + (index % 4) * 24), by });
  return { ...lead, history, updatedAt: history[history.length - 1].at };
}

export const leadSeed: Lead[] = buildLeads().map(withHistory);

export const academyPageSeed: AcademyPage = {
  seo: {
    title: "Academy",
    description: "Khóa học DJ, MC Hype & Producer từ cơ bản đến chuyên nghiệp tại Hooked Academy.",
  },
};

export const studentsPageSeed: StudentsPage = {
  seo: { title: "Học viên tiêu biểu", description: siteStudentsPage.description },
};
