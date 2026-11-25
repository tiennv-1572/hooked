/**
 * Ảnh của trang "Trang › Contact" (content/huong-dan/trang/contact.mdx): màn CMS, trang Contact trên website, và câu
 * báo lỗi khi để trống (tạo ra rồi bấm Hoàn tác — không lưu gì).
 */
import { expect, test } from "@playwright/test";

import { card, login, shot } from "../kit";

const IMG = "trang/contact";

test("Trang › Contact", async ({ page }) => {
  await login(page);
  await page.goto("/admin/pages/contact");
  const eyebrow = page.getByRole("textbox", { name: "Dòng nhãn *" });
  const title = page.getByRole("textbox", { name: "Tiêu đề *" });
  await expect(eyebrow).not.toHaveValue("");
  await expect(page.getByText("hooked.vie@gmail.com")).toBeVisible();

  await shot(page, IMG, {
    marks: [
      { n: 1, target: eyebrow, at: "left" },
      { n: 2, target: title, at: "above" },
      { n: 3, target: card(page.getByText("Thông tin liên hệ", { exact: true })), at: "left" },
      { n: 4, target: page.getByRole("link", { name: "Sửa trong Cài đặt" }), at: "left" },
    ],
  });

  // Both empty: the two messages — then Hoàn tác (nothing is saved).
  await eyebrow.fill("");
  await title.fill("");
  await page.keyboard.press("Control+s");
  await expect(page.getByText("Nhập dòng nhãn.")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    area: card(eyebrow),
    marks: [
      { n: 1, target: page.getByText("Nhập dòng nhãn."), at: "right", tight: true },
      { n: 2, target: page.getByText("Nhập tiêu đề."), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(eyebrow).toHaveValue("CONTACT HOOKED");

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/contact");
  const hero = site.getByRole("region", { name: "Liên hệ Hooked." });
  await shot(site, `${IMG}-website`, {
    marks: [
      { n: 1, target: hero.getByText("CONTACT HOOKED", { exact: true }), at: "right", tight: true },
      { n: 2, target: hero.getByRole("heading", { level: 1 }), at: "right", tight: true },
      { n: 3, target: hero.getByRole("link", { name: /Gửi email cho Hooked/ }), at: "left" },
      { n: 4, target: site.getByRole("region", { name: "Thông tin liên hệ" }), at: "left" },
    ],
  });
  await site.close();
});
