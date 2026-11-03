import { destroySession } from "@/server/auth/session";

/** POST /api/admin/auth/logout */
export async function POST() {
  await destroySession();
  return new Response(null, { status: 204 });
}
