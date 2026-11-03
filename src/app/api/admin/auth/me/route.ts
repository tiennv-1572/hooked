import { getSessionUser } from "@/server/auth/session";
import { handleError } from "@/server/api/http";

/**
 * GET /api/admin/auth/me — `{ user }` for the signed-in admin, `{ user: null }` otherwise.
 * Always 200 so the login page can probe the session without a console error; every other admin route answers 401.
 */
export async function GET() {
  try {
    return Response.json({ user: await getSessionUser() });
  } catch (error) {
    return handleError(error);
  }
}
