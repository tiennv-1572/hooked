import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

import { CmsError } from "@/admin/lib/cms/adapter";
import type { AdminRole } from "@/admin/lib/cms/types/shared";

import { getSessionUser, type SessionUser } from "../auth/session";

/** JSON error body shared by the admin and public APIs: `{ error: { code, message, fields? } }`. */
export function errorResponse(status: number, code: string, message: string, fields?: Record<string, string>) {
  return Response.json({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof CmsError) {
    const status = { not_found: 404, conflict: 409, invalid: 422, unknown: 500 }[error.code];
    return errorResponse(status, error.code, error.message);
  }
  if (error instanceof HttpError) return errorResponse(error.status, error.code, error.message, error.fields);
  console.error(error);
  const message =
    error instanceof Error && /ECONNREFUSED|connect/i.test(error.message)
      ? "Không kết nối được MySQL. Chạy `docker compose up -d` rồi thử lại."
      : "Lỗi máy chủ, vui lòng thử lại.";
  return errorResponse(500, "server_error", message);
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/** Parse + validate a JSON body; throws a 422 with per-field messages. */
export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, "bad_request", "Body phải là JSON hợp lệ.");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) fields[issue.path.join(".") || "_"] ??= issue.message;
    throw new HttpError(422, "validation_error", "Dữ liệu không hợp lệ.", fields);
  }
  return result.data;
}

const RANK: Record<AdminRole, number> = { editor: 1, admin: 2, owner: 3 };

/** Wrap an admin route handler: requires a session (optionally a minimum role) and maps errors to JSON. */
export function withAdmin<Ctx>(
  handler: (request: NextRequest, context: Ctx, user: SessionUser) => Promise<Response>,
  options: { role?: AdminRole } = {},
) {
  return async (request: NextRequest, context: Ctx) => {
    try {
      const user = await getSessionUser();
      if (!user) return errorResponse(401, "unauthorized", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      if (options.role && RANK[user.role] < RANK[options.role]) {
        return errorResponse(403, "forbidden", "Bạn không có quyền thực hiện thao tác này.");
      }
      return await handler(request, context, user);
    } catch (error) {
      return handleError(error);
    }
  };
}

/** Wrap a public route handler: error mapping + permissive CORS for read endpoints. */
export function withPublic<Ctx>(handler: (request: NextRequest, context: Ctx) => Promise<Response>) {
  return async (request: NextRequest, context: Ctx) => {
    try {
      const response = await handler(request, context);
      response.headers.set("Access-Control-Allow-Origin", "*");
      return response;
    } catch (error) {
      return handleError(error);
    }
  };
}

/** Cache tag of a CMS collection or singleton (`cms:courses`, `cms:home`). */
export const cmsTag = (key: string) => `cms:${key}`;

/** Make the website show the change on the next request (no stale content after an admin save). */
export function invalidate(...keys: string[]) {
  for (const key of keys) revalidateTag(cmsTag(key), { expire: 0 });
}
