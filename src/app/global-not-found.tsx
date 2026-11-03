import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StatusScreen } from "@/components/layout/status-screen";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { siteFontVariables } from "@/lib/fonts";
import { routes } from "@/lib/site";
import { getSite } from "@/server/content/queries";
import { toSiteChrome } from "@/server/content/views/site";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { name } = await getSite();
  return { title: `Không tìm thấy trang · ${name}` };
}

/**
 * 404 for URLs that match no route. The site and the admin CMS have separate root layouts,
 * so this page brings its own <html>, styles, header and footer (navigation and company details from the CMS).
 */
export default async function GlobalNotFound() {
  const chrome = toSiteChrome(await getSite());

  return (
    <html lang="vi" className={siteFontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader {...chrome.header} />
        <main className="flex-1">
          <StatusScreen
            code="404"
            title="Trang này không tồn tại"
            description="Đường dẫn có thể đã thay đổi hoặc trang đã được gỡ. Hãy quay lại trang chủ hoặc chọn một mục bên dưới."
            actions={
              <>
                <ButtonLink href={routes.home} variant="accent" className="w-[200px]">
                  Về trang chủ
                  <Icon name="arrow-up-right-dark-20" />
                </ButtonLink>
                <ButtonLink href={routes.academy} variant="coal" className="w-[200px]">
                  Khám phá Academy
                  <Icon name="arrow-up-right-accent-20" />
                </ButtonLink>
              </>
            }
          />
        </main>
        <SiteFooter {...chrome.footer} />
      </body>
    </html>
  );
}
