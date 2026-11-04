import type { CollectionKey } from "@/admin/lib/cms/registry";
import { ADMIN_ONLY_COLLECTIONS, affectedKeys, collectionKey } from "@/server/api/admin-keys";
import { errorResponse, HttpError, invalidate, withAdmin } from "@/server/api/http";
import { setUserPassword, takePassword } from "@/server/auth/users";
import type { SessionUser } from "@/server/auth/session";
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
  if (password) await assertCanSetPassword(key, id, user);
  const item = await updateItem(key, id, rest);
  if (password) await setUserPassword(id, password);
  invalidate(...affectedKeys(key));
  return Response.json({ data: item });
});

/**
 * Setting someone's password: owners for anyone, admins for admins and editors (same level or lower), editors never.
 * Your own password changes at POST /api/admin/auth/password, which checks the current one.
 */
async function assertCanSetPassword(key: CollectionKey, id: string, user: SessionUser) {
  if (key !== "users" || user.role === "editor") {
    throw new HttpError(403, "forbidden", "Bạn không có quyền đặt mật khẩu cho người dùng này.");
  }
  if (id === user.id) {
    throw new HttpError(403, "forbidden", "Đổi mật khẩu của bạn ở “Tài khoản của tôi” (cần mật khẩu hiện tại).");
  }
  const target = await getItem("users", id);
  if (!target) throw new HttpError(404, "not_found", "Không tìm thấy người dùng.");
  if (target.role === "owner" && user.role !== "owner") {
    throw new HttpError(403, "forbidden", "Chỉ chủ sở hữu mới đổi được mật khẩu của chủ sở hữu.");
  }
}

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
