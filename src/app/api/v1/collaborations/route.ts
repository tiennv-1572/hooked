import { withPublic } from "@/server/api/http";
import { getCollaborations } from "@/server/content/queries";

/** GET /api/v1/collaborations — featured brand collaborations (Partners page). */
export const GET = withPublic(async () => {
  const data = await getCollaborations();
  return Response.json({ data, meta: { total: data.length } });
});
