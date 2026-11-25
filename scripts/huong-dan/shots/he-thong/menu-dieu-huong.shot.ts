/**
 * Ảnh của trang "Hệ thống › Menu & điều hướng" (content/huong-dan/he-thong/menu-dieu-huong.mdx).
 * Không lưu gì: mục ẩn thử, mục thêm thử và lỗi đều bỏ bằng Hoàn tác. Menu trên website chụp như đang có.
 */
import { expect, test } from "@playwright/test";

import { card, login, noToasts, shot } from "../kit";

const IMG = "he-thong/menu-dieu-huong";

test("Menu & điều hướng", async ({ browser, page }) => {
  await login(page);
  await page.goto("/admin/navigation");
  const panel = page.getByRole("tabpanel");
  await expect(panel.getByRole("textbox", { name: "Nhãn" }).first()).toHaveValue("Home");

  // ── The screen: tabs, live preview, the list of the Desktop menu ─────────────────────────────────────────
  await shot(page, `${IMG}-desktop`, {
    marks: [
      { n: 1, target: page.getByRole("tablist"), at: "right" },
      { n: 2, target: card(panel.getByText("Header desktop", { exact: true })), at: "left" },
      { n: 3, target: panel.getByRole("combobox", { name: "Trang đang xem" }), at: "right" },
      { n: 4, target: panel.getByRole("button", { name: "Thêm mục" }), at: "below" },
      { n: 5, target: page.getByRole("button", { name: "Khôi phục mặc định" }), at: "below" },
    ],
  });

  // One item of the list.
  const rows = panel.locator("div.rounded-lg.border").filter({ has: page.getByRole("textbox", { name: "Nhãn" }) });
  const about = rows.nth(4);
  await expect(about.getByRole("textbox", { name: "Nhãn" })).toHaveValue("About");
  await about.scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-mot-muc`, {
    area: about,
    padding: 32,
    marks: [
      { n: 1, target: about.getByRole("button", { name: "Kéo để sắp xếp" }), at: "above" },
      { n: 2, target: about.getByRole("textbox", { name: "Nhãn" }), at: "above" },
      { n: 3, target: about.getByRole("textbox", { name: "/academy hoặc https://…" }), at: "above" },
      { n: 4, target: about.getByRole("button", { name: "Chọn trang" }), at: "above" },
      { n: 5, target: about.getByRole("switch", { name: "Hiện trên website" }), at: "above" },
      { n: 6, target: about.getByRole("switch", { name: "Mở trong tab mới" }), at: "above" },
      { n: 7, target: about.getByRole("button", { name: "Xóa mục" }), at: "above" },
    ],
  });

  // "Thêm mục": a page of the website, or a link of your own.
  await panel.getByRole("button", { name: "Thêm mục" }).click();
  const addMenu = page.getByRole("menu");
  await expect(addMenu).toBeVisible();
  await shot(page, `${IMG}-them-muc`, {
    // The open menu hides the rest of the page from the accessibility tree: the button that opened it, by CSS.
    area: page.locator('button[aria-haspopup="menu"][data-state="open"]'),
    include: [addMenu],
    marks: [
      { n: 1, target: addMenu.getByRole("menuitem", { name: /Học viên tiêu biểu/ }), at: "left" },
      { n: 2, target: addMenu.getByRole("menuitem", { name: /^Academy/ }).getByLabel("Đã có trong menu"), at: "left" },
      { n: 3, target: addMenu.getByRole("menuitem", { name: "Liên kết tùy chỉnh" }), at: "left" },
    ],
    padding: 24,
  });
  // A link of your own, saved empty then with an address that is not one: the messages.
  await addMenu.getByRole("menuitem", { name: "Liên kết tùy chỉnh" }).click();
  const added = rows.last();
  await page.getByRole("button", { name: /Lưu thay đổi/ }).click();
  await expect(added.getByText("Nhập nhãn.")).toBeVisible();
  await added.getByRole("textbox", { name: "Nhãn" }).fill("Tuyển dụng");
  await added.getByRole("textbox", { name: "/academy hoặc https://…" }).fill("tuyen-dung");
  await page.getByRole("button", { name: /Lưu thay đổi/ }).click();
  await expect(added.getByText("Bắt đầu bằng / hoặc https://")).toBeVisible();
  await noToasts(page);
  await shot(page, `${IMG}-loi`, {
    area: added,
    padding: 32,
    marks: [{ n: 1, target: added.getByText("Bắt đầu bằng / hoặc https://"), at: "right", tight: true }],
  });

  // "Chọn": pages, projects and posts of the website.
  await added.getByRole("button", { name: "Chọn trang" }).click();
  const picker = page.getByRole("dialog").filter({ has: page.getByPlaceholder("Tìm trang, dự án, bài viết…") });
  await expect(picker).toBeVisible();
  await shot(page, `${IMG}-chon-trang`, {
    area: added,
    include: [picker],
    marks: [
      { n: 1, target: picker.getByPlaceholder("Tìm trang, dự án, bài viết…"), at: "right" },
      { n: 2, target: picker.locator("[cmdk-group-heading]", { hasText: /^Trang$/ }), at: "right", tight: true },
    ],
    padding: 16,
  });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(rows).toHaveCount(6);

  // Hidden for now: "Hiện" off, the preview and the count follow.
  await about.getByRole("switch", { name: "Hiện trên website" }).click();
  const hiddenNote = panel.getByText("1 mục đang ẩn không hiển thị.");
  await expect(hiddenNote).toBeVisible();
  await shot(page, `${IMG}-an-muc`, {
    fitHeight: true,
    area: panel,
    marks: [
      { n: 1, target: hiddenNote, at: "right", tight: true },
      { n: 2, target: about.getByRole("switch", { name: "Hiện trên website" }), at: "above" },
      { n: 3, target: panel.getByText("6 mục · 1 đang ẩn"), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(hiddenNote).toBeHidden();

  // The other two menus.
  await page.getByRole("tab", { name: /Mobile/ }).click();
  await expect(panel.getByText("Menu mobile", { exact: true }).first()).toBeVisible();
  await shot(page, `${IMG}-mobile`, {
    fitHeight: true,
    area: panel,
    marks: [{ n: 1, target: card(panel.getByText("Menu mobile", { exact: true }).last()), at: "left" }],
  });
  await page.getByRole("tab", { name: /Footer/ }).click();
  await expect(panel.getByText("Cột “Company” ở footer")).toBeVisible();
  await shot(page, `${IMG}-footer`, {
    fitHeight: true,
    area: panel,
    marks: [
      { n: 1, target: card(panel.getByText("Cột “Company” ở footer")), at: "left" },
      { n: 2, target: panel.getByRole("button", { name: "Sao chép từ menu khác" }), at: "left" },
    ],
  });

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/academy");
  const nav = site.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(nav).toBeVisible();
  await shot(site, `${IMG}-website`, {
    area: site.locator("header"),
    marks: [
      { n: 1, target: nav, at: "left" },
      { n: 2, target: nav.getByRole("link", { name: "Academy" }), at: "below" },
    ],
    padding: 0,
  });
  await site.locator("footer").scrollIntoViewIfNeeded();
  const company = site.locator("footer").getByText("Company", { exact: true }).locator("..");
  await shot(site, `${IMG}-website-footer`, {
    area: site.locator("footer"),
    marks: [{ n: 1, target: company, at: "left" }],
    padding: 0,
  });
  await site.close();

  // On a phone: "Mở menu".
  const phone = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
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
  await mobile.goto("/academy");
  const open = mobile.getByRole("button", { name: "Mở menu" });
  await shot(mobile, `${IMG}-website-mobile-nut`, {
    area: mobile.locator("header"),
    marks: [{ n: 1, target: open, at: "below" }],
    padding: 0,
  });
  await open.click();
  const mobileNav = mobile.getByRole("navigation", { name: "Điều hướng chính" }).filter({ visible: true });
  await expect(mobileNav).toBeVisible();
  // The overlay fades in.
  await mobile.waitForTimeout(800);
  await shot(mobile, `${IMG}-website-mobile`, { marks: [{ n: 1, target: mobileNav, at: "below" }] });
  await phone.close();
});
