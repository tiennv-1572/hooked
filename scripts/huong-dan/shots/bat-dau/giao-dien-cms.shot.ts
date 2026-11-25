/**
 * Ảnh của trang "Bắt đầu › Làm quen giao diện CMS" (content/huong-dan/bat-dau/giao-dien-cms.mdx).
 * Không sửa dữ liệu. Chế độ sáng/tối chỉ đổi trong trình duyệt của kịch bản.
 */
import { expect, test } from "@playwright/test";

import { dialog, login, shot } from "../kit";

const IMG = "bat-dau/giao-dien-cms";

test("Làm quen giao diện CMS", async ({ browser, page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: /^Chào buổi/ })).toBeVisible();
  const sidebar = page.locator('[data-slot="sidebar-content"]');
  const header = page.locator("header").first();

  // ── The whole screen ────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-tong-the`, {
    marks: [
      { n: 1, target: sidebar.getByText("Quản lý Academy", { exact: true }), at: "right", tight: true },
      { n: 2, target: page.locator('[data-slot="sidebar-trigger"]'), at: "below" },
      { n: 3, target: header.getByRole("button", { name: /^Tìm kiếm/ }) },
      { n: 4, target: header.getByRole("link", { name: "Xem trên website" }) },
      { n: 5, target: header.getByRole("link", { name: "Hướng dẫn sử dụng" }), at: "below" },
      { n: 6, target: header.getByRole("link", { name: /đăng ký mới$/ }), at: "below" },
      { n: 7, target: header.getByRole("button", { name: "Giao diện" }), at: "below" },
      { n: 8, target: page.locator('[data-sidebar="menu-button"]').filter({ hasText: "admin@hooked.vn" }) },
    ],
  });

  // ── Quick search (Ctrl K) ───────────────────────────────────────────────────────────────────────────────
  await page.keyboard.press("ControlOrMeta+k");
  const palette = dialog(page, "Tìm kiếm");
  const input = palette.getByPlaceholder("Tìm trang, khóa học, dự án, bài viết…");
  await expect(input).toBeVisible();
  await input.fill("dj");
  await expect(palette.getByRole("option").first()).toBeVisible();
  await shot(page, `${IMG}-tim-nhanh`, {
    area: palette,
    marks: [
      { n: 1, target: input, at: "right" },
      { n: 2, target: palette.getByRole("option", { name: "DJ cơ bản" }).first(), at: "right" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();

  // ── Theme menu ──────────────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Giao diện" }).click();
  const theme = page.getByRole("menu");
  await expect(theme).toBeVisible();
  await shot(page, `${IMG}-che-do`, {
    area: theme,
    padding: 12,
    marks: [
      { n: 1, target: theme.getByText("Chế độ", { exact: true }), at: "right", tight: true },
      { n: 2, target: theme.getByText("Màu chủ đạo", { exact: true }), at: "right", tight: true },
      { n: 3, target: theme.getByText("Bố cục", { exact: true }), at: "right", tight: true },
    ],
  });
  await page.keyboard.press("Escape");

  // ── Collapsed menu ──────────────────────────────────────────────────────────────────────────────────────
  await page.locator('[data-slot="sidebar-trigger"]').click();
  await page.waitForTimeout(400);
  await shot(page, `${IMG}-thu-gon`, {
    marks: [{ n: 1, target: page.locator('[data-slot="sidebar-trigger"]'), at: "below" }],
  });
  await page.locator('[data-slot="sidebar-trigger"]').click();

  // ── On a phone: the menu opens from the ☰ button ────────────────────────────────────────────────────────
  const phone = await browser.newContext({
    baseURL: "http://localhost:3101",
    colorScheme: "light",
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    locale: "vi-VN",
    reducedMotion: "reduce",
    timezoneId: "Asia/Ho_Chi_Minh",
    viewport: { height: 844, width: 390 },
  });
  const mobile = await phone.newPage();
  await login(mobile);
  await expect(mobile.getByRole("heading", { name: /^Chào buổi/ })).toBeVisible();
  await shot(mobile, `${IMG}-dien-thoai`, {
    marks: [{ n: 1, target: mobile.locator('[data-slot="sidebar-trigger"]'), at: "below" }],
  });
  await mobile.locator('[data-slot="sidebar-trigger"]').click();
  await expect(mobile.getByRole("dialog")).toBeVisible();
  await mobile.waitForTimeout(400);
  await shot(mobile, `${IMG}-dien-thoai-menu`);
  await phone.close();
});
