import { errorResponse, withPublic } from "@/server/api/http";
import { getCourse } from "@/server/content/queries";

type Context = { params: Promise<{ id: string }> };

/** GET /api/v1/courses/{id} — one course (program, tuition, schedule…). */
export const GET = withPublic<Context>(async (_request, { params }) => {
  const course = await getCourse((await params).id);
  return course ? Response.json({ data: course }) : errorResponse(404, "not_found", "Không tìm thấy khóa học.");
});
