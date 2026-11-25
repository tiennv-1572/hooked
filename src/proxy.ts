import { NextResponse, type NextRequest } from "next/server";

/** Session cookie of the CMS — `SESSION_COOKIE` in src/server/auth/session.ts (not imported: that module opens MySQL). */
const SESSION_COOKIE = "hooked_admin";

/**
 * Hướng dẫn sử dụng CMS (/huong-dan) is for signed-in CMS accounts only: without the session cookie, go to the CMS
 * login and come back to the same page. Only a first gate — the guide's root layout verifies the session itself
 * (`getSessionUser`), and its search API answers 401. Nothing else of the site or the CMS passes through here.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/huong-dan", "/huong-dan/:path*"],
};
