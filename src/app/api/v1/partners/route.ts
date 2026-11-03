import type { NextRequest } from "next/server";

import { withPublic } from "@/server/api/http";
import { getPartners } from "@/server/content/queries";

/** GET /api/v1/partners?placement=home|partners — partner logos in display order. */
export const GET = withPublic(async (request: NextRequest) => {
  const placement = request.nextUrl.searchParams.get("placement");
  const data = await getPartners(placement === "home" || placement === "partners" ? { placement } : {});
  return Response.json({ data, meta: { total: data.length } });
});
