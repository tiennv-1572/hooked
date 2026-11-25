/** Ảnh của trang "Trang › Học viên tiêu biểu" (content/huong-dan/trang/hoc-vien-tieu-bieu.mdx). Không lưu gì. */
import { test } from "@playwright/test";

import { seoPage } from "./seo-page";

test("Trang › Học viên tiêu biểu", async ({ page }) => {
  await seoPage(page, {
    slug: "hoc-vien-tieu-bieu",
    admin: "/admin/pages/students",
    path: "/academy/students",
    height: 1080,
    website: (site) => [
      { n: 1, target: site.getByRole("heading", { level: 1, name: "Học viên tiêu biểu" }), at: "right", tight: true },
      { n: 2, target: site.getByText("Những câu chuyện từ cộng đồng học viên Hooked."), at: "right", tight: true },
      {
        n: 3,
        target: site
          .getByText(/^\d+ HỌC VIÊN$/)
          .filter({ visible: true })
          .first(),
        at: "left",
        tight: true,
      },
      // The breadcrumb is a list too: the first story card is the first item that offers its story.
      { n: 4, target: site.getByRole("listitem").filter({ hasText: "Xem câu chuyện" }).first() },
    ],
  });
});
