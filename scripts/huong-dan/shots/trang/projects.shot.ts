/** Ảnh của trang "Trang › Projects" (content/huong-dan/trang/projects.mdx). Không lưu gì. */
import { test } from "@playwright/test";

import { seoPage } from "./seo-page";

test("Trang › Projects", async ({ page }) => {
  await seoPage(page, {
    slug: "projects",
    admin: "/admin/pages/projects",
    path: "/projects",
    height: 1000,
    website: (site) => [
      { n: 1, target: site.getByRole("heading", { level: 1, name: "Hooked Projects" }), at: "right", tight: true },
      { n: 2, target: site.getByRole("group", { name: "Lọc dự án theo dịch vụ" }) },
      { n: 3, target: site.getByRole("region", { name: "Hooked Projects" }).getByRole("listitem").first() },
    ],
  });
});
