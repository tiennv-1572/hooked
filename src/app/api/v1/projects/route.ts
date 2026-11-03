import type { NextRequest } from "next/server";

import { withPublic } from "@/server/api/http";
import { getProjects } from "@/server/content/queries";

/** GET /api/v1/projects?category=media — published projects (overview cards) in display order. */
export const GET = withPublic(async (request: NextRequest) => {
  const category = request.nextUrl.searchParams.get("category") || undefined;
  const data = await getProjects(category ? { category } : {});
  return Response.json({ data, meta: { total: data.length } });
});
