import "server-only";

import { z } from "zod";

import { HttpError } from "../api/http";
import { createItem, listItems } from "../cms/repository";
import type { RegistrationResultDto } from "./dto";

/** Body of POST /api/v1/registrations (the "Đăng ký tư vấn" form). */
export const registrationInput = z.object({
  name: z
    .string({ error: "Vui lòng nhập họ và tên." })
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .max(120, "Họ và tên tối đa 120 ký tự."),
  phone: z
    .string({ error: "Nhập số điện thoại để Hooked liên hệ." })
    .trim()
    .min(1, "Nhập số điện thoại để Hooked liên hệ.")
    .regex(/^(\+?84|0)[0-9 .-]{8,13}$/, "Số điện thoại chưa đúng định dạng."),
  email: z.union([z.literal(""), z.email("Email chưa đúng định dạng.")]).optional(),
  /** Course id (e.g. "dj-co-ban"). */
  courseId: z.string({ error: "Chọn khóa học bạn quan tâm." }).trim().min(1, "Chọn khóa học bạn quan tâm."),
  /** Where the form was opened ("Academy · carousel"…). */
  source: z.string().trim().max(120).optional(),
  /** Honeypot — must stay empty (bots fill every field). */
  website: z.string().max(0, "Dữ liệu không hợp lệ.").optional(),
});
export type RegistrationInput = z.infer<typeof registrationInput>;

// Naive per-IP limiter (single Node process — good enough for local/dev; use Redis behind a load balancer).
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;

const DEFAULT_MAX_PER_WINDOW = 5;

/** `REGISTRATION_RATE_LIMIT`: max registrations per IP per 10 minutes (default 5; `0` disables, e.g. for e2e runs). */
function maxPerWindow() {
  const raw = process.env.REGISTRATION_RATE_LIMIT?.trim();
  const value = raw ? Number(raw) : DEFAULT_MAX_PER_WINDOW;
  return Number.isInteger(value) && value >= 0 ? value : DEFAULT_MAX_PER_WINDOW;
}

export function rateLimit(ip: string) {
  const max = maxPerWindow();
  if (max === 0) return;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW);
  if (recent.length >= max) {
    throw new HttpError(429, "rate_limited", "Bạn đã gửi quá nhiều lần, vui lòng thử lại sau ít phút.");
  }
  recent.push(now);
  hits.set(ip, recent);
}

export async function createRegistration(input: RegistrationInput): Promise<RegistrationResultDto> {
  const course = (await listItems("courses")).find((item) => item.status === "published" && item.id === input.courseId);
  if (!course)
    throw new HttpError(422, "validation_error", "Khóa học không tồn tại.", { courseId: "Khóa học không tồn tại." });
  const phone = input.phone.replace(/[ .-]/g, "");
  const lead = await createItem("leads", {
    name: input.name,
    phone,
    email: input.email || undefined,
    courseId: course.id,
    status: "new",
    source: input.source || "Website",
    history: [{ status: "new", at: new Date().toISOString(), by: "Website" }],
  });
  return { id: lead.id, status: "new", course: { id: course.id, title: course.title }, createdAt: lead.createdAt };
}
