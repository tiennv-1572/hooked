import type { SingletonMap } from "@/admin/lib/cms/registry";
import { affectedKeys, singletonKey } from "@/server/api/admin-keys";
import { invalidate, withAdmin } from "@/server/api/http";
import { getSingleton, saveSingleton } from "@/server/cms/repository";

type Context = { params: Promise<{ key: string }> };

/** GET /api/admin/singletons/{key} */
export const GET = withAdmin<Context>(async (_request, { params }) => {
  const key = singletonKey((await params).key);
  return Response.json({ data: await getSingleton(key) });
});

/** PUT /api/admin/singletons/{key} — replace the whole document. */
export const PUT = withAdmin<Context>(async (request, { params }) => {
  const key = singletonKey((await params).key);
  const value = (await request.json()) as SingletonMap[typeof key];
  const saved = await saveSingleton(key, value);
  invalidate(...affectedKeys(key));
  return Response.json({ data: saved });
});
