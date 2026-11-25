/**
 * Ảnh của trang "Hệ thống › Cài đặt website" (content/huong-dan/he-thong/cai-dat-website.mdx).
 * Không lưu gì: lỗi tạo thử được bỏ bằng Hoàn tác. Chân trang website chụp như đang có.
 */
import { expect, test } from "@playwright/test";

import { card, login, noToasts, shot } from "../kit";

const IMG = "he-thong/cai-dat-website";

test("Cài đặt website", async ({ page }) => {
  await login(page);
  await page.goto("/admin/settings");
  const panel = page.getByRole("tabpanel");
  await expect(page.getByRole("textbox", { name: "Tên website *" })).toHaveValue("Hooked Entertainment");

  // ── Thông tin chung ──────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-thong-tin-chung`, {
    marks: [
      { n: 1, target: page.getByRole("tablist"), at: "right" },
      { n: 2, target: page.getByRole("textbox", { name: "Tên website *" }), at: "above" },
      { n: 3, target: page.getByRole("textbox", { name: "Khẩu hiệu" }), at: "above" },
      { n: 4, target: page.getByRole("textbox", { name: "Mô tả *" }), at: "left" },
      { n: 5, target: card(panel.getByText("Kết quả Google", { exact: true })), at: "below" },
    ],
  });

  // ── Công ty & liên hệ ────────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("tab", { name: /Công ty/ }).click();
  const phoneHref = page.locator("#company\\.phoneHref");
  await expect(phoneHref).toBeVisible();
  await shot(page, `${IMG}-cong-ty`, {
    fitHeight: true,
    marks: [
      { n: 1, target: page.getByRole("textbox", { name: /^Tên pháp lý/ }), at: "above" },
      { n: 2, target: page.getByRole("textbox", { name: /^Địa chỉ/ }), at: "above" },
      { n: 3, target: page.getByRole("textbox", { name: /^Email/ }), at: "above" },
      { n: 4, target: page.getByRole("textbox", { name: /^Số điện thoại/ }), at: "above" },
      { n: 5, target: phoneHref, at: "right" },
      { n: 6, target: page.getByRole("switch", { name: "Tạo liên kết gọi tự động" }), at: "above" },
      { n: 7, target: card(panel.getByText("Footer", { exact: true })), at: "below" },
    ],
  });

  // ── Mạng xã hội ─────────────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("tab", { name: /Mạng xã hội/ }).click();
  const socialRows = panel
    .locator("div.rounded-lg.border")
    .filter({ has: page.getByRole("textbox", { name: "Tên mạng xã hội" }) });
  await expect(socialRows).toHaveCount(4);
  const facebook = socialRows.first();
  await shot(page, `${IMG}-mang-xa-hoi`, {
    fitHeight: true,
    marks: [
      { n: 1, target: facebook.getByRole("button", { name: "Kéo để sắp xếp" }), at: "left" },
      { n: 2, target: facebook.getByRole("textbox", { name: "Tên mạng xã hội" }), at: "above" },
      { n: 3, target: facebook.getByRole("textbox", { name: "Đường dẫn" }), at: "above" },
      { n: 4, target: facebook.getByRole("link", { name: "Mở liên kết" }), at: "above" },
      { n: 5, target: facebook.getByRole("button", { name: "Xóa" }), at: "above" },
      { n: 6, target: panel.getByRole("button", { name: "Thêm liên kết" }), at: "above" },
      { n: 7, target: panel.getByText("Thêm nhanh:").locator(".."), at: "below" },
    ],
  });

  // ── SEO ─────────────────────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("tab", { name: "SEO" }).click();
  const template = page.getByRole("textbox", { name: /Mẫu tiêu đề/ });
  await expect(template).toHaveValue("%s · Hooked Entertainment");
  await shot(page, `${IMG}-seo`, {
    fitHeight: true,
    marks: [
      { n: 1, target: template, at: "above" },
      { n: 2, target: page.getByRole("textbox", { name: /Tiêu đề mặc định/ }), at: "above" },
      { n: 3, target: card(panel.getByText("Ảnh chia sẻ", { exact: true })), at: "left" },
      { n: 4, target: panel.getByRole("combobox", { name: "Trang mẫu" }), at: "above" },
      { n: 5, target: card(panel.getByText("Chia sẻ Facebook", { exact: true })), at: "left" },
    ],
  });

  // ── Saved with mistakes: the messages, the tabs marked, then Hoàn tác ───────────────────────────────────
  await template.fill("Hooked Entertainment");
  await page.getByRole("tab", { name: /Công ty/ }).click();
  await page.getByRole("textbox", { name: /^Email/ }).fill("hooked.vie");
  await page.getByRole("button", { name: /Lưu thay đổi/ }).click();
  await expect(page.getByText("Email không hợp lệ.")).toBeVisible();
  await noToasts(page);
  await shot(page, `${IMG}-loi`, {
    area: page.getByRole("tablist"),
    include: [card(page.getByRole("textbox", { name: /^Email/ }))],
    marks: [
      { n: 1, target: page.getByRole("tab", { name: /Công ty/ }), at: "above" },
      { n: 2, target: page.getByRole("tab", { name: "SEO" }), at: "above" },
      { n: 3, target: page.getByText("Email không hợp lệ."), at: "right", tight: true },
    ],
    padding: 24,
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(page.getByText("Email không hợp lệ.")).toBeHidden();
  await expect(page.getByText("Đã lưu mọi thay đổi")).toBeVisible();

  // ── On the website: the footer, on every page ───────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/");
  const footer = site.locator("footer");
  await footer.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website`, {
    area: footer,
    marks: [
      { n: 1, target: footer.getByRole("link", { name: /hooked\.vie@gmail\.com/ }), at: "right" },
      { n: 2, target: footer.getByRole("link", { name: "0966 609 807" }), at: "right" },
      { n: 3, target: footer.getByText("Social", { exact: true }).locator(".."), at: "left" },
      { n: 4, target: footer.locator("address"), at: "right" },
    ],
    padding: 0,
  });
  await site.close();
});
