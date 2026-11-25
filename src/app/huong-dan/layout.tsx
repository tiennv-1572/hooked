import type { Metadata } from "next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Suspense, type ReactNode } from "react";

import { inter } from "@/lib/fonts";
import { requireGuideSession } from "@/lib/guide/session";
import { GUIDE_TRANSLATIONS } from "@/lib/guide/translations";

import "./guide.css";

/** Signed-in only, so every request renders on the server: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Hướng dẫn sử dụng CMS", template: "%s · Hướng dẫn CMS Hooked" },
  // Internal: it shows the whole CMS. Never indexed, and only for a signed-in CMS account.
  robots: { follow: false, index: false },
};

/**
 * Hướng dẫn sử dụng CMS (Fumadocs) — the app's third root layout, next to the website (`app/(site)`) and the CMS
 * (`app/admin`), so neither of their stylesheets is touched and the guide's never reaches them.
 *
 * Only for a signed-in CMS account: `src/proxy.ts` sends a visitor without the session cookie to the login page and
 * back; `requireGuideSession` is the authoritative check (a valid token of an active account, re-read from MySQL), made
 * by every segment of the guide. It reads the cookie, so it sits in `<Suspense>` (Cache Components): none of the guide
 * is in the static output.
 *
 * Light theme only — `next-themes` would otherwise set a class on `<html>`. The docs shell (sidebar, search, page
 * tree) is in `(docs)/layout.tsx`.
 */
export default function GuideRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <Suspense fallback={null}>
          <SignedIn>{children}</SignedIn>
        </Suspense>
      </body>
    </html>
  );
}

async function SignedIn({ children }: { children: ReactNode }) {
  await requireGuideSession();

  return (
    <RootProvider
      i18n={{ locale: "vi", translations: GUIDE_TRANSLATIONS }}
      search={{ options: { api: "/api/huong-dan/search" } }}
      theme={{ enabled: false }}
    >
      {children}
    </RootProvider>
  );
}
