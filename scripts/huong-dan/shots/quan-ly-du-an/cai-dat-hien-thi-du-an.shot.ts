/**
 * Ảnh của trang "Quản lý dự án › Cài đặt hiển thị dự án" (content/huong-dan/quan-ly-du-an/cai-dat-hien-thi-du-an.mdx).
 * Chụp lưới "Tất cả" trên website, thêm một ô thứ 6 (Panorama, dự án đã có ở ô 1), lưu, chụp lại, rồi xóa ô đó và lưu:
 * lưới trở về đúng 5 ô như cũ.
 */
import { expect, test, type Page } from "@playwright/test";

import { card, localSql, login, noToasts, shot } from "../kit";

const IMG = "quan-ly-du-an/cai-dat-hien-thi-du-an";
const CARDS = [
  "Devoid Music Festival",
  "SPIN Awards",
  "“Xóm Húc” DJ Contest",
  "Frequency Arena Face2Face EDM Battle",
  "Vui Fest Cát Bà",
];

const slotCount = () => localSql("select json_length(doc, '$.slots') from singletons where `key` = 'projectsLayout'");

async function save(page: Page) {
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "Đã lưu Cài đặt hiển thị dự án." })).toBeVisible();
  await noToasts(page);
}

test("Cài đặt hiển thị dự án", async ({ browser, page }) => {
  expect(slotCount(), "the seeded grid has 5 cells").toBe("5");
  await login(page);

  // ── The "Tất cả" grid on the website, each card numbered like its cell ─────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/projects");
  const list = site.getByRole("list").filter({ has: site.getByRole("article") });
  await expect(list.getByRole("article")).toHaveCount(5);
  await site.mouse.move(0, 0);
  await shot(site, `${IMG}-website`, {
    area: list,
    fitHeight: true,
    marks: CARDS.map((name, index) => ({
      n: index + 1,
      target: list.getByRole("article").filter({ hasText: name }).getByRole("img", { name }),
    })),
  });

  // ── The screen ─────────────────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/project-layout");
  await expect(page.getByRole("combobox", { name: "Dự án ô 5" })).toBeVisible();
  const cells = card(page.getByRole("button", { name: "Thêm ô" }));
  const preview = card(page.getByText("Desktop · bộ lọc “Tất cả”"));
  await shot(page, `${IMG}-man-hinh`, {
    marks: [
      { n: 1, target: cells.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      { n: 2, target: page.getByRole("combobox", { name: "Định dạng ô 1" }), at: "above" },
      { n: 3, target: page.getByRole("combobox", { name: "Dự án ô 1" }), at: "above" },
      { n: 4, target: page.getByRole("button", { name: "Xóa ô 1" }), at: "right" },
      { n: 5, target: page.getByRole("button", { name: "Thêm ô" }), at: "right" },
      { n: 6, target: preview },
    ],
  });

  // ── Add a cell: the formats ───────────────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Thêm ô" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-them-o`, {
    // The open menu hides the rest of the page from the accessibility tree: the card by CSS.
    area: page.locator('[data-slot="card"]').filter({ hasText: "Các ô" }).first(),
    marks: [{ n: 1, target: menu, at: "right" }],
  });
  await menu.getByRole("menuitem").filter({ hasText: "Panorama" }).click();

  // Every published project already has a cell: the new one waits for its project.
  const project6 = page.getByRole("combobox", { name: "Dự án ô 6" });
  await expect(project6).toHaveText(/Chọn dự án/);
  // Focus off the "Thêm ô" button (its ring would show), then save.
  await cells.getByText("Các ô", { exact: true }).click();
  await page.keyboard.press("ControlOrMeta+s");
  const missing = cells.getByText("Chọn dự án.", { exact: true });
  await expect(missing).toBeVisible();
  await noToasts(page);
  await shot(page, `${IMG}-loi-chua-chon`, {
    area: cells,
    marks: [
      { n: 1, target: project6, at: "above" },
      { n: 2, target: missing, at: "right", tight: true },
    ],
  });

  // The same project may sit in several cells: Devoid again, full width.
  await project6.click();
  const options = page.getByRole("listbox");
  await expect(options).toBeVisible();
  await shot(page, `${IMG}-chon-du-an`, {
    area: page.locator('[data-slot="card"]').filter({ hasText: "Các ô" }).first(),
    include: [options],
    marks: [{ n: 1, target: options.getByRole("option", { name: /Devoid Music Festival/ }), at: "right" }],
  });
  await options.getByRole("option", { name: /Devoid Music Festival/ }).click();
  await expect(project6).toHaveText(/Devoid Music Festival/);
  await expect(missing).toBeHidden();

  // The preview, with the new cell at the bottom.
  await shot(page, `${IMG}-xem-truoc`, {
    area: preview,
    fitHeight: true,
    marks: [
      { n: 1, target: preview.getByText("Ô 1 · Landscape", { exact: true }), at: "right", tight: true },
      { n: 2, target: preview.getByText("Ô 6 · Panorama", { exact: true }), at: "right", tight: true },
    ],
  });
  await save(page);
  expect(slotCount()).toBe("6");

  // On the website: the sixth card, under the others.
  await site.goto("/projects");
  await expect(list.getByRole("article")).toHaveCount(6);
  const sixth = list.getByRole("article").nth(5);
  await sixth.scrollIntoViewIfNeeded();
  await site.mouse.move(0, 0);
  await shot(site, `${IMG}-website-o-moi`, {
    area: sixth,
    marks: [{ n: 6, target: sixth.getByRole("img", { name: "Devoid Music Festival" }) }],
  });

  // ── Back to the 5 cells ───────────────────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Xóa ô 6" }).click();
  await save(page);
  expect(slotCount()).toBe("5");
  await site.goto("/projects");
  await expect(list.getByRole("article")).toHaveCount(5);
  await site.close();

  // ── On a phone: one column, in the cells' order ────────────────────────────────────────────────────────
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
  await mobile.goto("/projects");
  const mobileList = mobile.getByRole("list").filter({ has: mobile.getByRole("article") });
  // The first two cards whole, under the site's header.
  await mobileList
    .getByRole("article")
    .first()
    .evaluate((node) => window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 88));
  await shot(mobile, `${IMG}-website-dien-thoai`, {
    marks: CARDS.slice(0, 2).map((name, index) => ({
      n: index + 1,
      target: mobileList.getByRole("article").filter({ hasText: name }).getByRole("img", { name }),
    })),
  });
  await phone.close();
});
