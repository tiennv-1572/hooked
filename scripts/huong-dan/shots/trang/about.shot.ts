/**
 * Ảnh của trang "Trang › About" (content/huong-dan/trang/about.mdx): ba tab của màn CMS và các khối tương ứng trên
 * trang About (máy tính, điện thoại). Lỗi được tạo rồi bấm Hoàn tác — không lưu gì, trang About giữ nguyên.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";

import { card, container, login, shot } from "../kit";

const IMG = "trang/about";

async function openTab(page: Page, name: RegExp) {
  await page.getByRole("tab", { name }).click();
  await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
}

const label = (scope: Locator, text: RegExp) => scope.locator("[data-slot=field-label]").filter({ hasText: text });

test("Trang › About", async ({ browser, page }) => {
  await login(page);
  await page.goto("/admin/pages/about");
  const intro = page.getByRole("tabpanel");
  await expect(intro.getByRole("textbox", { name: "Tiêu đề trang *" })).not.toHaveValue("");

  // ── Mở đầu ───────────────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-mo-dau`, {
    fitHeight: true,
    area: intro,
    include: [page.getByRole("tablist")],
    marks: [
      { n: 1, target: intro.getByRole("textbox", { name: "Tiêu đề trang *" }), at: "left" },
      { n: 2, target: label(intro, /^Dòng nhãn cam/), at: "right", tight: true },
      { n: 3, target: intro.getByRole("textbox", { name: "Câu mở đầu *" }), at: "left" },
      {
        n: 4,
        target: container(
          page,
          page.getByRole("textbox", { name: "Tiêu đề nhỏ — dòng 1 *" }),
          page.getByRole("textbox", { name: "Tiêu đề nhỏ — dòng 2 *" }),
        ),
        at: "left",
      },
      { n: 5, target: intro.getByRole("textbox", { name: "Đoạn chính *" }), at: "left" },
      { n: 6, target: intro.getByRole("textbox", { name: "Đoạn phụ" }), at: "left" },
      { n: 7, target: intro.getByRole("complementary") },
    ],
  });

  // ── Hệ sinh thái: the block, then one capability opened ─────────────────────────────────────────────────
  await openTab(page, /^Hệ sinh thái/);
  const eco = page.getByRole("tabpanel");
  await shot(page, `${IMG}-he-sinh-thai`, {
    fitHeight: true,
    area: eco,
    marks: [
      { n: 1, target: label(eco, /^Tiêu đề nhỏ/), at: "right", tight: true },
      { n: 2, target: eco.getByRole("textbox", { name: "Câu tuyên bố *" }), at: "left" },
      { n: 3, target: eco.getByRole("textbox", { name: "Đoạn mô tả *" }), at: "left" },
      { n: 4, target: card(eco.getByRole("button", { name: "Thêm năng lực" })), at: "left" },
      { n: 5, target: card(eco.getByRole("textbox", { name: "Nhãn *" })), at: "left" },
    ],
  });
  const first = eco.getByRole("button", { name: /^1\. Đào tạo chuyên môn/ });
  await first.click();
  const lead = eco.getByRole("textbox", { name: "Phần in đậm *" });
  await expect(lead).toBeVisible();
  await shot(page, `${IMG}-nang-luc`, {
    fitHeight: true,
    area: card(lead),
    marks: [
      { n: 1, target: first, at: "above" },
      { n: 2, target: lead, at: "left" },
      { n: 3, target: eco.getByRole("textbox", { name: "Phần tiếp theo" }), at: "left" },
      { n: 4, target: eco.getByRole("textbox", { name: "Liên kết của phần in đậm" }), at: "left" },
      { n: 5, target: eco.getByRole("button", { name: "Thêm năng lực" }), at: "right" },
    ],
  });
  await first.click();

  // ── Hình ảnh: two blocks of four numbered slots ─────────────────────────────────────────────────────────
  await openTab(page, /^Hình ảnh/);
  const photos = page.getByRole("tabpanel");
  const top = card(photos.getByText("Khối ảnh trên", { exact: true }));
  const topFirst = top.getByRole("group").filter({ hasText: "1 · Ảnh lớn" });
  // A slot's buttons (Thay ảnh, Gỡ) show while the pointer is on its picture.
  await topFirst.getByRole("button", { name: "Thay ảnh" }).hover();
  await shot(page, `${IMG}-hinh-anh`, {
    fitHeight: true,
    area: photos,
    marks: [
      // The block's preview is a card inside the block's card.
      { n: 1, target: card(top.getByText("Xem trước", { exact: true })) },
      { n: 2, target: label(topFirst, /^1 · Ảnh lớn/), at: "right", tight: true },
      { n: 3, target: topFirst.getByRole("button", { name: "Thay ảnh" }), at: "above" },
      { n: 4, target: topFirst.getByRole("button", { name: "Gỡ" }), at: "below" },
      { n: 5, target: card(photos.getByText("Khối ảnh dưới", { exact: true })), at: "left" },
    ],
  });

  // A slot left empty: the error, the red dot on the tab — then put back with Hoàn tác (nothing is saved).
  await topFirst.getByRole("button", { name: "Gỡ" }).click();
  await page.keyboard.press("Control+s");
  await expect(topFirst.getByText("Chọn ảnh.")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    area: top,
    include: [page.getByRole("tablist")],
    marks: [
      { n: 1, target: page.getByRole("tab", { name: /^Hình ảnh/ }).getByLabel("Có trường chưa hợp lệ"), at: "below" },
      { n: 2, target: topFirst.getByText("Chọn ảnh."), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(topFirst.getByRole("img")).toBeVisible();

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 1100, width: 1280 });
  await site.goto("/about");
  const head = site.getByRole("region", { name: "ABOUT HOOKED" });
  await shot(site, `${IMG}-website-mo-dau`, {
    area: head,
    marks: [
      { n: 1, target: head.getByRole("heading", { level: 1 }), at: "right", tight: true },
      { n: 3, target: head.getByRole("paragraph").first(), at: "left" },
      { n: 4, target: head.getByRole("heading", { level: 2 }), at: "left", tight: true },
      { n: 5, target: head.getByRole("paragraph").nth(1), at: "left" },
      { n: 6, target: head.getByRole("paragraph").nth(2), at: "right" },
    ],
  });

  const stage = site.getByRole("region", { name: "Hình ảnh sân khấu và nghệ sĩ" });
  await shot(site, `${IMG}-website-anh-tren`, {
    area: stage,
    marks: [0, 1, 2, 3].map((index) => ({ n: index + 1, target: stage.getByRole("figure").nth(index) })),
  });

  const ecosystem = site.getByRole("region", { name: "MỘT HỆ SINH THÁI CHO NGHỆ SĨ VIỆT" });
  await shot(site, `${IMG}-website-he-sinh-thai`, {
    area: ecosystem,
    marks: [
      { n: 1, target: ecosystem.getByRole("heading", { level: 2 }), at: "left", tight: true },
      { n: 2, target: ecosystem.getByRole("paragraph").first(), at: "left" },
      { n: 3, target: ecosystem.getByRole("paragraph").nth(1), at: "left" },
      { n: 4, target: ecosystem.getByRole("list"), at: "right" },
      { n: 5, target: ecosystem.getByRole("link", { name: /Xem full portfolio/ }), at: "right", tight: true },
    ],
  });

  const live = site.getByRole("region", { name: "Hình ảnh trải nghiệm live" });
  await shot(site, `${IMG}-website-anh-duoi`, {
    area: live,
    marks: [0, 1, 2, 3].map((index) => ({ n: index + 1, target: live.getByRole("figure").nth(index) })),
  });
  await site.close();

  // ── On a phone: the orange label only shows there ───────────────────────────────────────────────────────
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
  await mobile.goto("/about");
  const mobileHead = mobile.getByRole("region", { name: "ABOUT HOOKED" });
  await shot(mobile, `${IMG}-website-mobile`, {
    marks: [
      { n: 1, target: mobileHead.getByRole("heading", { level: 1 }), at: "right", tight: true },
      {
        n: 2,
        target: mobileHead.getByText("SUPPORT LOCAL ARTIST", { exact: true }).filter({ visible: true }).first(),
        at: "right",
        tight: true,
      },
    ],
  });
  await phone.close();
});
