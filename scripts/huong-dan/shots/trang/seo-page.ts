/**
 * Shared by the four page screens that only hold SEO (Trang › Academy, Học viên tiêu biểu, Projects, Blog): the CMS
 * screen with its fields numbered, then the website page with its parts numbered (each part is edited elsewhere).
 * Nothing is saved. Not a `*.shot.ts`: Playwright does not run it on its own.
 */
import { expect, type Locator, type Page } from "@playwright/test";

import { card, login, shot, type Mark } from "../kit";

export type SeoPage = {
  /** Picture names: `trang/<slug>`, `trang/<slug>-website`. */
  slug: string;
  /** The CMS screen, e.g. `/admin/pages/academy`. */
  admin: string;
  /** The website page, e.g. `/academy`. */
  path: string;
  /** Window height for the website picture. */
  height: number;
  /** Numbered parts of the website page. */
  website: (site: Page) => Mark[];
  /** The part of the website page to take (default: the whole window). */
  area?: (site: Page) => Locator;
};

export async function seoPage(page: Page, options: SeoPage) {
  const img = `trang/${options.slug}`;
  await login(page);
  await page.goto(options.admin);
  const title = page.getByRole("textbox", { name: "Tiêu đề SEO *" });
  await expect(title).not.toHaveValue("");

  await shot(page, img, {
    marks: [
      { n: 1, target: title, at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Mô tả SEO *" }), at: "left" },
      { n: 3, target: page.getByText("Xem trước kết quả tìm kiếm", { exact: true }).locator("..") },
      { n: 4, target: page.getByRole("button", { name: /Lưu thay đổi/ }), at: "above" },
    ],
  });

  // Same context as the CMS page: baseURL, locale and reduced motion of the config.
  const site = await page.context().newPage();
  await site.setViewportSize({ height: options.height, width: 1280 });
  await site.goto(options.path);
  await expect(site.locator("h1").first()).toBeVisible();
  await shot(site, `${img}-website`, { area: options.area?.(site), marks: options.website(site) });
  await site.close();
  return { img, seo: card(title) };
}
