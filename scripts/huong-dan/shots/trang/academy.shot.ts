/**
 * Ảnh của trang "Trang › Academy" (content/huong-dan/trang/academy.mdx): màn SEO, trang Academy trên website, và hai câu
 * báo lỗi (tạo ra rồi bấm Hoàn tác — không lưu gì).
 */
import { expect, test } from "@playwright/test";

import { shot } from "../kit";
import { seoPage } from "./seo-page";

test("Trang › Academy", async ({ page }) => {
  const { img, seo } = await seoPage(page, {
    slug: "academy",
    admin: "/admin/pages/academy",
    path: "/academy",
    height: 1700,
    website: (site) => [
      { n: 1, target: site.getByRole("heading", { level: 1, name: "ACADEMY" }), at: "right", tight: true },
      { n: 2, target: site.getByRole("region", { name: "Các khóa học của Hooked Academy" }) },
      { n: 3, target: site.getByRole("group", { name: "Lọc khóa học theo nhóm" }) },
      { n: 4, target: site.getByRole("region", { name: "Tất cả khóa học" }).getByRole("list") },
    ],
  });

  // Errors: a title over 70 characters, an empty description — then Hoàn tác (nothing is saved).
  const title = page.getByRole("textbox", { name: "Tiêu đề SEO *" });
  const description = page.getByRole("textbox", { name: "Mô tả SEO *" });
  await title.fill("Academy — Khóa học DJ, MC Hype và Music Producer chuyên nghiệp tại Hà Nội");
  await description.fill("");
  await page.keyboard.press("Control+s");
  await expect(page.getByText("Tối đa 70 ký tự.")).toBeVisible();
  await expect(page.getByText("Nhập mô tả SEO.")).toBeVisible();
  await shot(page, `${img}-loi`, {
    area: seo,
    marks: [
      { n: 1, target: page.getByText(/^\d+\/50$/), at: "left", tight: true },
      { n: 2, target: page.getByText("Tối đa 70 ký tự."), at: "right", tight: true },
      { n: 3, target: page.getByText("Nhập mô tả SEO."), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(title).toHaveValue("Academy");
});
