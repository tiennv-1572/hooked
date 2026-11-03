import { HttpError, invalidate, parseJson, withPublic } from "@/server/api/http";
import { createRegistration, rateLimit, registrationInput } from "@/server/content/registrations";

/**
 * POST /api/v1/registrations — "Đăng ký tư vấn" form → a new lead in the CMS inbox.
 * 201 created · 422 validation (per-field messages) · 429 too many requests.
 */
export const POST = withPublic(async (request) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const input = await parseJson(request, registrationInput);
  if (input.website) throw new HttpError(422, "validation_error", "Dữ liệu không hợp lệ.");
  rateLimit(ip);
  const data = await createRegistration(input);
  invalidate("leads");
  return Response.json({ data }, { status: 201 });
});

/** CORS preflight for the form endpoint. */
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
