import type { RegistrationValues } from "@/components/academy/registration-schema";

/** Shown when the request fails without a usable server message (network error, non-JSON response). */
export const SUBMIT_ERROR = "Chưa gửi được thông tin. Vui lòng thử lại.";

type FormField = Exclude<keyof RegistrationValues, "website">;
const FORM_FIELDS: readonly FormField[] = ["courseId", "name", "phone", "email"];

export type RegistrationResult =
  { ok: true; courseId: string } | { ok: false; message: string; fieldErrors?: Partial<Record<FormField, string>> };

type ApiErrorBody = { error?: { code?: string; message?: string; fields?: Record<string, string> } };

/**
 * Sends the "Đăng ký tư vấn" form to the public API: `POST /api/v1/registrations` (creates a lead in /admin/leads).
 * 201 → ok · 422 → per-field messages (mapped onto the form fields) · 429 / 5xx / network → a form-level message.
 */
export async function submitRegistration(values: RegistrationValues & { source: string }): Promise<RegistrationResult> {
  let response: Response;
  try {
    response = await fetch("/api/v1/registrations", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        courseId: values.courseId,
        name: values.name,
        phone: values.phone,
        email: values.email,
        source: values.source,
        website: values.website,
      }),
    });
  } catch {
    return { ok: false, message: SUBMIT_ERROR };
  }

  const body: unknown = await response.json().catch(() => null);
  if (response.ok) {
    const data = (body as { data?: { course?: { id?: string } } } | null)?.data;
    return { ok: true, courseId: data?.course?.id ?? values.courseId };
  }

  const error = (body as ApiErrorBody | null)?.error;
  const message = error?.message || SUBMIT_ERROR;
  if (response.status !== 422 || !error?.fields) return { ok: false, message };

  const fieldErrors: Partial<Record<FormField, string>> = {};
  for (const field of FORM_FIELDS) {
    if (error.fields[field]) fieldErrors[field] = error.fields[field];
  }
  // Errors on fields the visitor cannot see (e.g. the honeypot) fall back to the form-level message.
  return Object.keys(fieldErrors).length ? { ok: false, message, fieldErrors } : { ok: false, message };
}
