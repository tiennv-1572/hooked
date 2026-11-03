import { eq } from "drizzle-orm";

import { HttpError } from "../api/http";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import { hashPassword } from "./password";

/** Same rules as POST /api/admin/auth/password. */
export function assertPasswordStrength(password: string) {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(422, "validation_error", "Mật khẩu tối thiểu 8 ký tự, có cả chữ và số.", {
      password: "Mật khẩu tối thiểu 8 ký tự, có cả chữ và số.",
    });
  }
}

/**
 * Pull the write-only `password` field out of a users create/update body (it never goes into the JSON doc).
 * There is no email delivery: admins hand the temporary password to the invitee, who activates on first login.
 */
export function takePassword(body: Record<string, unknown>) {
  const { password, ...rest } = body;
  if (password === undefined || password === "") return { password: undefined, rest };
  if (typeof password !== "string") throw new HttpError(422, "validation_error", "Mật khẩu không hợp lệ.");
  assertPasswordStrength(password);
  return { password, rest };
}

export async function setUserPassword(id: string, password: string) {
  await getDb()
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(users.id, id));
}
