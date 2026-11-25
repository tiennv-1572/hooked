import type { AdminRole, AdminUser } from "@/admin/lib/cms/types/shared";

import { HttpError } from "../api/http";
import { getItem, listItems } from "../cms/repository";
import type { SessionUser } from "./session";

/**
 * Who may change which account — the rules of the users screen (src/admin/modules/system/users-page.tsx, `guardsFor`
 * and `assignableRoles`), enforced on the server so the API cannot be used to go around them:
 * - owners manage everyone, admins manage admins and editors, editors manage nobody;
 * - nobody changes their own role or status, nor deletes their own account (profile fields only);
 * - an admin assigns admin or editor, never owner;
 * - there is always at least one active owner.
 * Passwords are checked separately (assertCanSetPassword in the item route; your own at /api/admin/auth/password).
 */

const ROLES: AdminRole[] = ["owner", "admin", "editor"];
const STATUSES: AdminUser["status"][] = ["active", "invited", "disabled"];
/** Fields of an account its owner may change about themselves (Tài khoản của tôi). */
const PROFILE_FIELDS = ["name", "email", "avatar"];
/** Fields a manager may change about someone they manage (Người dùng: edit sheet, role menu, lock). */
const MANAGED_FIELDS = [...PROFILE_FIELDS, "role", "status"];

const forbidden = (message: string) => new HttpError(403, "forbidden", message);

function canManage(actor: SessionUser, target: Pick<AdminUser, "role">) {
  return actor.role === "owner" || (actor.role === "admin" && target.role !== "owner");
}

function assignableRoles(actor: SessionUser): AdminRole[] {
  return actor.role === "owner" ? ROLES : actor.role === "admin" ? ["admin", "editor"] : [];
}

function assertKnownFields(body: Record<string, unknown>, allowed: string[]) {
  const unknown = Object.keys(body).filter((field) => !allowed.includes(field));
  if (unknown.length) {
    throw new HttpError(422, "validation_error", `Không được thay đổi: ${unknown.join(", ")}.`);
  }
}

function assertRole(actor: SessionUser, role: unknown) {
  if (!ROLES.includes(role as AdminRole)) throw new HttpError(422, "validation_error", "Vai trò không hợp lệ.");
  if (!assignableRoles(actor).includes(role as AdminRole)) {
    throw forbidden("Bạn không gán được vai trò này.");
  }
}

function assertStatus(status: unknown) {
  if (!STATUSES.includes(status as AdminUser["status"])) {
    throw new HttpError(422, "validation_error", "Trạng thái không hợp lệ.");
  }
}

/** At least one active owner once `next` replaces the accounts it names (`null` = deleted). */
async function assertOwnerRemains(next: Map<string, Pick<AdminUser, "role" | "status"> | null>) {
  const users = await listItems("users");
  const owners = users.filter((user) => {
    const after = next.has(user.id) ? next.get(user.id) : user;
    return after?.role === "owner" && after.status === "active";
  });
  if (owners.length === 0) {
    throw forbidden("Đây là chủ sở hữu duy nhất — cần ít nhất một chủ sở hữu đang hoạt động.");
  }
}

/** POST /api/admin/collections/users (invite). */
export function assertCanCreateUser(actor: SessionUser, body: Record<string, unknown>) {
  if (actor.role === "editor") throw forbidden("Biên tập viên không quản lý được người dùng.");
  assertKnownFields(body, MANAGED_FIELDS);
  assertRole(actor, body.role);
  if (body.status !== undefined) assertStatus(body.status);
}

/** PATCH /api/admin/collections/users/{id}. `body` is the patch without the write-only password. */
export async function assertCanUpdateUser(actor: SessionUser, id: string, body: Record<string, unknown>) {
  const target = await getItem("users", id);
  if (!target) throw new HttpError(404, "not_found", "Không tìm thấy người dùng.");

  const changesRole = body.role !== undefined && body.role !== target.role;
  const changesStatus = body.status !== undefined && body.status !== target.status;

  if (id === actor.id) {
    if (changesRole || changesStatus) {
      throw forbidden("Bạn không thể tự đổi vai trò, khóa hoặc xóa tài khoản của chính mình.");
    }
    // The edit sheet also sends the unchanged role and status of a locked row.
    const { role: _role, status: _status, ...rest } = body;
    void _role;
    void _status;
    assertKnownFields(rest, PROFILE_FIELDS);
    return;
  }

  if (actor.role === "editor") throw forbidden("Biên tập viên không quản lý được người dùng.");
  if (!canManage(actor, target)) throw forbidden("Chỉ chủ sở hữu mới thay đổi được chủ sở hữu khác.");
  assertKnownFields(body, MANAGED_FIELDS);
  if (changesRole) assertRole(actor, body.role);
  if (changesStatus) assertStatus(body.status);
  if (changesRole || changesStatus) {
    await assertOwnerRemains(
      new Map([
        [
          id,
          {
            role: (body.role as AdminRole | undefined) ?? target.role,
            status: (body.status as AdminUser["status"] | undefined) ?? target.status,
          },
        ],
      ]),
    );
  }
}

/** DELETE /api/admin/collections/users/{id} and bulk-delete. */
export async function assertCanDeleteUsers(actor: SessionUser, ids: string[]) {
  if (actor.role === "editor") throw forbidden("Biên tập viên không quản lý được người dùng.");
  if (ids.includes(actor.id)) {
    throw forbidden("Bạn không thể tự đổi vai trò, khóa hoặc xóa tài khoản của chính mình.");
  }
  for (const id of ids) {
    const target = await getItem("users", id);
    if (!target) throw new HttpError(404, "not_found", "Không tìm thấy người dùng.");
    if (!canManage(actor, target)) throw forbidden("Chỉ chủ sở hữu mới thay đổi được chủ sở hữu khác.");
  }
  await assertOwnerRemains(new Map(ids.map((id) => [id, null])));
}
