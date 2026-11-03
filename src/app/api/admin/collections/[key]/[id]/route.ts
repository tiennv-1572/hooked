import { ADMIN_ONLY_COLLECTIONS, affectedKeys, collectionKey } from "@/server/api/admin-keys";
import { errorResponse, HttpError, invalidate, withAdmin } from "@/server/api/http";
import { setUserPassword, takePassword } from "@/server/auth/users";
import { getItem, removeItems, updateItem } from "@/server/cms/repository";

type Context = { params: Promise<{ key: string; id: string }> };

/** GET /api/admin/collections/{key}/{id} */
export const GET = withAdmin<Context>(async (_request, { params }) => {
  const { key, id } = await params;
  const item = await getItem(collectionKey(key), id);
  return item ? Response.json({ data: item }) : errorResponse(404, "not_found", "Không tìm thấy nội dung.");
});

/** PATCH /api/admin/collections/{key}/{id} — partial update (fields are replaced, not deep-merged). */
export const PATCH = withAdmin<Context>(async (request, { params }, user) => {
  const { key: raw, id } = await params;
  const key = collectionKey(raw);
  if (ADMIN_ONLY_COLLECTIONS.includes(key) && user.role === "editor" && id !== user.id) {
    throw new HttpError(403, "forbidden", "Bạn không có quyền thực hiện thao tác này.");
  }
  const { password, rest } = takePassword((await request.json()) as Record<string, unknown>);
  if (password && (key !== "users" || user.role === "editor")) {
    throw new HttpError(403, "forbidden", "Bạn không có quyền đặt mật khẩu cho người dùng này.");
  }
  const item = await updateItem(key, id, rest);
  if (password) await setUserPassword(id, password);
  invalidate(...affectedKeys(key));
  return Response.json({ data: item });
});

/** DELETE /api/admin/collections/{key}/{id} */
export const DELETE = withAdmin<Context>(async (_request, { params }, user) => {
  const { key: raw, id } = await params;
  const key = collectionKey(raw);
  if (ADMIN_ONLY_COLLECTIONS.includes(key) && user.role === "editor") {
    throw new HttpError(403, "forbidden", "Bạn không có quyền thực hiện thao tác này.");
  }
  await removeItems(key, [id]);
  invalidate(...affectedKeys(key));
  return new Response(null, { status: 204 });
});
