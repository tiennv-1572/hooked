import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import type { AdminRole } from "@/admin/lib/cms/types/shared";

import { getDb } from "../db/client";
import { users } from "../db/schema";

export const SESSION_COOKIE = "hooked_admin";
const LONG_SESSION = 60 * 60 * 24 * 30; // 30 days ("Ghi nhớ đăng nhập")
const SHORT_SESSION = 60 * 60 * 12; // 12 hours

export type SessionUser = { id: string; name: string; email: string; role: AdminRole; avatar?: string };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set (≥ 32 characters) in .env");
  return new TextEncoder().encode(value);
}

export async function createSession(user: SessionUser, remember: boolean) {
  const maxAge = remember ? LONG_SESSION : SHORT_SESSION;
  const token = await new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: remember ? maxAge : undefined,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Current admin user (re-read from MySQL so disabled/deleted accounts lose access immediately). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const [row] = await getDb().select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!row || row.status !== "active") return null;
    const doc = row.doc as { avatar?: string };
    return { id: row.id, name: row.name, email: row.email, role: row.role as AdminRole, avatar: doc.avatar };
  } catch {
    return null;
  }
}
