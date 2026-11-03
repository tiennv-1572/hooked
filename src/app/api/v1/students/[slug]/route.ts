import { errorResponse, withPublic } from "@/server/api/http";
import { getStudent } from "@/server/content/queries";

type Context = { params: Promise<{ slug: string }> };

/** GET /api/v1/students/{slug} — one student story (Student reader). */
export const GET = withPublic<Context>(async (_request, { params }) => {
  const student = await getStudent((await params).slug);
  return student ? Response.json({ data: student }) : errorResponse(404, "not_found", "Không tìm thấy học viên.");
});
