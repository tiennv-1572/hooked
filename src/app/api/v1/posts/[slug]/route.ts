import { errorResponse, withPublic } from "@/server/api/http";
import { getPost } from "@/server/content/queries";

type Context = { params: Promise<{ slug: string }> };

/** GET /api/v1/posts/{slug} — full article (intro, blocks, SEO). */
export const GET = withPublic<Context>(async (_request, { params }) => {
  const post = await getPost((await params).slug);
  return post ? Response.json({ data: post }) : errorResponse(404, "not_found", "Không tìm thấy bài viết.");
});
