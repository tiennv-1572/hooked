import type { NextRequest } from "next/server";

import { withPublic } from "@/server/api/http";
import { getStudents } from "@/server/content/queries";

/** GET /api/v1/students?featured=true&role=DJ — published student stories in display order (`role`: case-insensitive). */
export const GET = withPublic(async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const featured = params.get("featured");
  const data = await getStudents({
    featured: featured === null ? undefined : featured === "true" || featured === "1",
    role: params.get("role")?.trim() || undefined,
  });
  return Response.json({ data, meta: { total: data.length } });
});
