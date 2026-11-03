import { eq } from "drizzle-orm";
import { z } from "zod";

import { hashPassword, verifyPassword } from "@/server/auth/password";
import { errorResponse, parseJson, withAdmin } from "@/server/api/http";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";

const body = z.object({
  current: z.string().min(1, "Nhập mật khẩu hiện tại."),
  next: z
    .string()
    .min(8, "Mật khẩu mới tối thiểu 8 ký tự.")
    .regex(/[A-Za-z]/, "Mật khẩu cần có chữ.")
    .regex(/\d/, "Mật khẩu cần có số."),
});

/** POST /api/admin/auth/password — change my password. */
export const POST = withAdmin(async (request, _context, user) => {
  const { current, next } = await parseJson(request, body);
  const [row] = await getDb().select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return errorResponse(422, "validation_error", "Mật khẩu hiện tại không đúng.", {
      current: "Mật khẩu hiện tại không đúng.",
    });
  }
  await getDb()
    .update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.id, user.id));
  return Response.json({ ok: true });
});
