import { eq } from "drizzle-orm";
import { z } from "zod";

import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { errorResponse, handleError, parseJson } from "@/server/api/http";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";

const body = z.object({
  email: z.email("Email không hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  remember: z.boolean().optional().default(true),
});

/** POST /api/admin/auth/login — email + password → httpOnly session cookie. */
export async function POST(request: Request) {
  try {
    const { email, password, remember } = await parseJson(request, body);
    const [row] = await getDb().select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    if (!row || !(await verifyPassword(password, row.passwordHash))) {
      return errorResponse(401, "invalid_credentials", "Email hoặc mật khẩu không đúng.");
    }
    if (row.status === "disabled") return errorResponse(403, "inactive", "Tài khoản đã bị khóa.");
    // An invited user signing in with the temporary password activates the account.
    const now = new Date();
    await getDb()
      .update(users)
      .set({
        status: "active",
        lastActiveAt: now,
        doc: { ...(row.doc as object), status: "active", lastActiveAt: now.toISOString() },
      })
      .where(eq(users.id, row.id));
    const user = { id: row.id, name: row.name, email: row.email, role: row.role as "owner" | "admin" | "editor" };
    await createSession(user, remember);
    return Response.json({ user });
  } catch (error) {
    return handleError(error);
  }
}
