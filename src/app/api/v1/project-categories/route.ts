import { withPublic } from "@/server/api/http";
import { getProjectCategories } from "@/server/content/queries";

/** GET /api/v1/project-categories — service categories used as filter chips on /projects. */
export const GET = withPublic(async () => {
  const data = await getProjectCategories();
  return Response.json({ data, meta: { total: data.length } });
});
