import type { Metadata, Viewport } from "next";

import { AdminProviders } from "@/admin/components/shell/admin-providers";
import { preferencesBootScript } from "@/admin/lib/preferences";
import { siteFontVariables } from "@/lib/fonts";

import "@/admin/styles/admin.css";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Hooked CMS", template: "%s · Hooked CMS" },
  description: "Quản trị nội dung website Hooked Entertainment.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1a18" },
  ],
};

/**
 * Root layout of the admin CMS (separate from the public site's root layout in app/(site)),
 * so the shadcn/ui theme in admin.css never mixes with the site styles.
 */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="vi" className={siteFontVariables} data-theme-preset="hooked" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencesBootScript }} />
      </head>
      <body className="min-h-dvh">
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
