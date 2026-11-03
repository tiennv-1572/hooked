import type { NewItem } from "@/admin/lib/cms/registry";
import { ADMIN_ONLY_COLLECTIONS, affectedKeys, collectionKey } from "@/server/api/admin-keys";
import { HttpError, invalidate, withAdmin } from "@/server/api/http";
import { setUserPassword, takePassword } from "@/server/auth/users";
import { createItem, listItems } from "@/server/cms/repository";

type Context = { params: Promise<{ key: string }> };

/** GET /api/admin/collections/{key} — all items. */
export const GET = withAdmin<Context>(async (_request, { params }) => {
  const key = collectionKey((await params).key);
  return Response.json({ data: await listItems(key) });
});

/** POST /api/admin/collections/{key} — create one item. */
export const POST = withAdmin<Context>(async (request, { params }, user) => {
  const key = collectionKey((await params).key);
  if (ADMIN_ONLY_COLLECTIONS.includes(key) && user.role === "editor") {
    throw new HttpError(403, "forbidden", "Bạn không có quyền thực hiện thao tác này.");
  }
  // `users` may carry a write-only temporary password (invite flow); it is hashed into its own column.
  const { password, rest } = takePassword((await request.json()) as Record<string, unknown>);
  const item = await createItem(key, rest as NewItem<typeof key>);
  if (key === "users" && password) await setUserPassword(item.id, password);
  invalidate(...affectedKeys(key));
  return Response.json({ data: item }, { status: 201 });
});
