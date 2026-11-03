import { z } from "zod";

import { affectedKeys, collectionKey } from "@/server/api/admin-keys";
import { invalidate, parseJson, withAdmin } from "@/server/api/http";
import { reorderItems } from "@/server/cms/repository";

type Context = { params: Promise<{ key: string }> };
const body = z.object({ ids: z.array(z.string().min(1)).max(1000) });

/** POST /api/admin/collections/{key}/reorder — { ids: [first, second, …] } */
export const POST = withAdmin<Context>(async (request, { params }) => {
  const key = collectionKey((await params).key);
  const { ids } = await parseJson(request, body);
  await reorderItems(key, ids);
  invalidate(...affectedKeys(key));
  return new Response(null, { status: 204 });
});
