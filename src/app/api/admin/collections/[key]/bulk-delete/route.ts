import { z } from "zod";

import { ADMIN_ONLY_COLLECTIONS, affectedKeys, collectionKey } from "@/server/api/admin-keys";
import { HttpError, invalidate, parseJson, withAdmin } from "@/server/api/http";
import { removeItems } from "@/server/cms/repository";

type Context = { params: Promise<{ key: string }> };
const body = z.object({ ids: z.array(z.string().min(1)).min(1).max(500) });

/** POST /api/admin/collections/{key}/bulk-delete — { ids: [...] } */
export const POST = withAdmin<Context>(async (request, { params }, user) => {
  const key = collectionKey((await params).key);
  if (ADMIN_ONLY_COLLECTIONS.includes(key) && user.role === "editor") {
    throw new HttpError(403, "forbidden", "Bạn không có quyền thực hiện thao tác này.");
  }
  const { ids } = await parseJson(request, body);
  await removeItems(key, ids);
  invalidate(...affectedKeys(key));
  return new Response(null, { status: 204 });
});
