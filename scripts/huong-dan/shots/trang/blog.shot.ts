/** Ảnh của trang "Trang › Blog" (content/huong-dan/trang/blog.mdx). Không lưu gì. */
import { test } from "@playwright/test";

import { seoPage } from "./seo-page";

test("Trang › Blog", async ({ page }) => {
  await seoPage(page, {
    slug: "blog",
    admin: "/admin/pages/blog",
    path: "/blog",
    height: 1180,
    website: (site) => [
      { n: 1, target: site.getByRole("heading", { level: 1, name: "BLOGPOST" }), at: "right", tight: true },
      { n: 2, target: site.getByText(/^Câu chuyện từ cộng đồng Hooked:/), at: "left" },
      { n: 3, target: site.locator("main").getByRole("listitem").first() },
    ],
  });
});
