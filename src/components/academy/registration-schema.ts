import { z } from "zod";

/**
 * Client-side contract of the "Đăng ký tư vấn" form (react-hook-form). The API (POST /api/v1/registrations,
 * src/server/content/registrations.ts) validates again and returns the same Vietnamese messages per field.
 * Copy from Figma "Registration / Error" (2455:5377): name + phone errors. The phone-format and
 * email-format messages are not designed yet (assumption, plan/03 §1 "Validation").
 */
export const registrationMessages = {
  courseRequired: "Chọn khóa học bạn quan tâm.",
  nameRequired: "Vui lòng nhập họ và tên.",
  nameTooLong: "Họ và tên tối đa 120 ký tự.",
  phoneRequired: "Nhập số điện thoại để Hooked liên hệ.",
  phoneInvalid: "Số điện thoại chưa đúng định dạng.",
  emailInvalid: "Email chưa đúng định dạng.",
} as const;

/** Vietnamese mobile/landline numbers: 0xxxxxxxxx or +84xxxxxxxxx (spaces, dots and dashes allowed). */
const VN_PHONE = /^(?:0|\+?84)\d{9}$/;

/** `courseIds`: the courses currently offered by the CMS (the selector's options). */
export function createRegistrationSchema(courseIds: readonly string[]) {
  return z.object({
    courseId: z.string().refine((id) => courseIds.includes(id), registrationMessages.courseRequired),
    name: z.string().trim().min(1, registrationMessages.nameRequired).max(120, registrationMessages.nameTooLong),
    phone: z
      .string()
      .trim()
      .min(1, registrationMessages.phoneRequired)
      .refine((value) => VN_PHONE.test(value.replace(/[\s.-]/g, "")), registrationMessages.phoneInvalid),
    email: z
      .string()
      .trim()
      .max(160, registrationMessages.emailInvalid)
      .refine((value) => value === "" || z.email().safeParse(value).success, registrationMessages.emailInvalid),
    /** Honeypot: hidden from people, filled by bots; the API rejects any value. */
    website: z.string(),
  });
}

export type RegistrationValues = z.infer<ReturnType<typeof createRegistrationSchema>>;
