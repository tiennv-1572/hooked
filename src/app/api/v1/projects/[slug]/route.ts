import { errorResponse, withPublic } from "@/server/api/http";
import { getProject } from "@/server/content/queries";

type Context = { params: Promise<{ slug: string }> };

/** GET /api/v1/projects/{slug} — project detail with photo album and videos. */
export const GET = withPublic<Context>(async (_request, { params }) => {
  const project = await getProject((await params).slug);
  return project ? Response.json({ data: project }) : errorResponse(404, "not_found", "Không tìm thấy dự án.");
});
