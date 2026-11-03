import { addDays, differenceInCalendarDays, endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";
import { vi } from "date-fns/locale";

import type { Course, Lead, LeadStatus, Student } from "@/admin/lib/cms/types/academy";
import type { Post } from "@/admin/lib/cms/types/blog";
import type { Project } from "@/admin/lib/cms/types/projects";

export const RANGES = [7, 30, 90] as const;
export type RangeDays = (typeof RANGES)[number];

const DAY = 24 * 60 * 60 * 1000;

/**
 * Reference "today" for every lead statistic on the dashboard.
 *
 * Choice: use the real clock (`now`) whenever there is at least one registration in the last 90 days, so a live
 * site always shows the current window (including quiet days). Otherwise fall back to the newest registration's
 * day — this keeps the charts meaningful for the demo seed (generated around 2026-11-02) when the browser clock
 * is months later. The UI says so when the fallback is active.
 */
export function resolveAnchor(leads: Lead[], now: number) {
  const newest = leads.reduce((max, lead) => Math.max(max, parseISO(lead.createdAt).getTime()), 0);
  if (!newest || now - newest <= 90 * DAY) return { anchor: new Date(now), isFallback: false };
  return { anchor: new Date(newest), isFallback: true };
}

/** Inclusive window of `days` calendar days ending on `anchor`'s day, shifted back by `offset` windows. */
export function windowOf(anchor: Date, days: number, offset = 0) {
  const end = endOfDay(subDays(anchor, offset * days));
  const start = startOfDay(subDays(end, days - 1));
  return { start, end };
}

export function leadsIn(leads: Lead[], range: { start: Date; end: Date }) {
  const from = range.start.getTime();
  const to = range.end.getTime();
  return leads.filter((lead) => {
    const time = parseISO(lead.createdAt).getTime();
    return time >= from && time <= to;
  });
}

/** Percent change; null when there is no previous value to compare with. */
export function percentChange(current: number, previous: number) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export type DailyPoint = { date: string; label: string; leads: number };

/** One point per calendar day of the window (zero-filled). */
export function dailySeries(leads: Lead[], range: { start: Date; end: Date }): DailyPoint[] {
  const counts = new Map<string, number>();
  for (const lead of leadsIn(leads, range)) {
    const key = format(parseISO(lead.createdAt), "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const days = differenceInCalendarDays(range.end, range.start) + 1;
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(range.start, index);
    const key = format(date, "yyyy-MM-dd");
    return { date: key, label: format(date, "dd/MM"), leads: counts.get(key) ?? 0 };
  });
}

/** "Thứ Hai, 02/11/2026" */
export function longDay(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  const text = format(date, "EEEE, dd/MM/yyyy", { locale: vi });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "enrolled", "closed"];

/** Chart colours of the lead pipeline — match the LeadStatusBadge tones. */
export const STATUS_COLOR: Record<LeadStatus, string> = {
  new: "var(--chart-1)",
  contacted: "var(--chart-3)",
  enrolled: "var(--chart-4)",
  closed: "var(--chart-5)",
};

export function countByStatus(leads: Lead[]) {
  const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, enrolled: 0, closed: 0 };
  for (const lead of leads) counts[lead.status] = (counts[lead.status] ?? 0) + 1;
  return counts;
}

export type CourseCount = { id: string; label: string; leads: number };

/** Leads per course, every course listed (zero included), most requested first. */
export function countByCourse(leads: Lead[], courses: Course[]): CourseCount[] {
  const counts = new Map<string, number>();
  for (const lead of leads) counts.set(lead.courseId, (counts.get(lead.courseId) ?? 0) + 1);
  const rows: CourseCount[] = courses.map((course) => ({
    id: course.id,
    label: course.title,
    leads: counts.get(course.id) ?? 0,
  }));
  const known = new Set(courses.map((course) => course.id));
  const orphan = [...counts.entries()].filter(([id]) => !known.has(id)).reduce((sum, [, count]) => sum + count, 0);
  if (orphan) rows.push({ id: "__other", label: "Khóa học đã xóa", leads: orphan });
  return rows.sort((a, b) => b.leads - a.leads);
}

// ---------------------------------------------------------------------------------------------------------
// "Nội dung cần chú ý"

export type AttentionLink = { id: string; label: string; detail?: string; href: string; count?: number };
export type AttentionCheck = {
  key: "drafts" | "seo" | "headline";
  /** Shown when the check fails ("2 bài viết thiếu mô tả SEO"). */
  title: (count: number) => string;
  /** Shown when everything is fine. */
  okTitle: string;
  hint: string;
  count: number;
  items: AttentionLink[];
};

export function buildAttention(input: {
  courses: Course[];
  projects: Project[];
  posts: Post[];
  students: Student[];
}): AttentionCheck[] {
  const { courses, projects, posts, students } = input;

  const drafts: AttentionLink[] = [
    ...posts
      .filter((item) => item.status === "draft")
      .map((item) => ({ id: item.id, label: item.title, detail: "Bài viết", href: `/admin/posts/${item.id}` })),
    ...courses
      .filter((item) => item.status === "draft")
      .map((item) => ({ id: item.id, label: item.title, detail: "Khóa học", href: `/admin/courses/${item.id}` })),
    ...projects
      .filter((item) => item.status === "draft")
      .map((item) => ({ id: item.id, label: item.name, detail: "Dự án", href: `/admin/projects/${item.id}` })),
    ...students
      .filter((item) => item.status === "draft")
      .map((item) => ({ id: item.id, label: item.name, detail: "Học viên", href: `/admin/students/${item.id}` })),
  ];

  const seo: AttentionLink[] = posts
    .filter((post) => !post.seo?.description?.trim())
    .map((post) => ({
      id: post.id,
      label: post.title,
      detail: post.status === "draft" ? "Bản nháp" : "Đã xuất bản",
      href: `/admin/posts/${post.id}`,
    }));

  const headline: AttentionLink[] = students
    .filter((student) => student.featured && !student.headline?.trim())
    .map((student) => ({
      id: student.id,
      label: student.name,
      detail: "Học viên nổi bật",
      href: `/admin/students/${student.id}`,
    }));

  return [
    {
      key: "drafts",
      title: (count) => `${count} bản nháp chưa xuất bản`,
      okTitle: "Không có bản nháp tồn đọng",
      hint: "Bản nháp không hiển thị trên website.",
      count: drafts.length,
      items: drafts,
    },
    {
      key: "seo",
      title: (count) => `${count} bài viết thiếu mô tả SEO`,
      okTitle: "Bài viết đều có mô tả SEO",
      hint: "Mô tả hiển thị trên Google và khi chia sẻ link.",
      count: seo.length,
      items: seo,
    },
    {
      key: "headline",
      title: (count) => `${count} học viên nổi bật thiếu câu giới thiệu`,
      okTitle: "Học viên nổi bật đều có câu giới thiệu",
      hint: "Câu giới thiệu hiển thị trên carousel trang Academy.",
      count: headline.length,
      items: headline,
    },
  ];
}
