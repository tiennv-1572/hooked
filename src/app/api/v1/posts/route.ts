import type { NextRequest } from "next/server";

import { withPublic } from "@/server/api/http";
import { getPosts } from "@/server/content/queries";

/** GET /api/v1/posts?tag=&page=1&limit=12 — published posts, newest first, paginated. */
export const GET = withPublic(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const result = await getPosts({
    tag: params.get("tag") || undefined,
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 12,
  });
  return Response.json(result);
});
