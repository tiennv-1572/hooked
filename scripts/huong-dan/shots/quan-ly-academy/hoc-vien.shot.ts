/**
 * Ảnh của trang "Quản lý Academy › Học viên" (content/huong-dan/quan-ly-academy/hoc-vien.mdx).
 * Chụp trên học viên có sẵn (không tạo người mẫu: ảnh chân dung là của học viên thật) và không đổi dữ liệu: hộp
 * "Đưa vào carousel" chỉ được mở rồi đóng.
 */
import { expect, test } from "@playwright/test";

import { card, container, dialog, login, shot } from "../kit";

const IMG = "quan-ly-academy/hoc-vien";

test("Học viên", async ({ browser, page }) => {
  await login(page);

  // ── The list (portrait grid) ─────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/students");
  const star = page.getByRole("button", { name: "Đưa JUSTWANG vào carousel" });
  await expect(star).toBeVisible();
  const justwang = container(page, page.getByRole("link", { name: "Chỉnh sửa JUSTWANG" }), star);
  await page.mouse.move(0, 0);
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Thêm học viên" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Sắp xếp" }), at: "below" },
      {
        n: 3,
        target: container(
          page,
          page.getByText(/học viên trong carousel “Học viên tiêu biểu”/),
          page.getByRole("button", { name: "Chỉ xem tiêu biểu" }),
        ),
      },
      {
        n: 4,
        target: page.getByRole("radiogroup").filter({ has: page.getByRole("radio", { name: "Dạng lưới" }) }),
        at: "below",
      },
      { n: 5, target: justwang },
      { n: 6, target: star, at: "below" },
      { n: 7, target: justwang.getByRole("button", { name: "Thao tác" }), at: "below" },
    ],
  });

  // The card menu. While it is open the rest of the page is hidden from the accessibility tree: CSS locators.
  await justwang.getByRole("button", { name: "Thao tác" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-thao-tac`, {
    area: page
      .locator('a[aria-label="Chỉnh sửa JUSTWANG"]')
      .locator("xpath=ancestor::div[contains(@class,'grid-cols-2')][1]"),
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "right" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Đưa vào carousel" }), at: "right" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Chuyển về bản nháp" }), at: "right" },
      { n: 4, target: menu.getByRole("menuitem", { name: "Xem trên website" }), at: "right" },
      { n: 5, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "right" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  // A student without a quote: the star first asks for one (shown, then cancelled).
  await star.click();
  const feature = dialog(page, "Đưa JUSTWANG vào carousel");
  await expect(feature).toBeVisible();
  await shot(page, `${IMG}-dua-vao-carousel`, {
    area: feature,
    marks: [
      { n: 1, target: feature.getByLabel("Câu trích dẫn"), at: "left" },
      { n: 2, target: feature.getByRole("button", { name: "Đưa vào carousel" }), at: "above" },
    ],
  });
  await feature.getByRole("button", { name: "Hủy" }).click();
  await expect(feature).toBeHidden();

  // ── A student's page ─────────────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/students/jgrayson");
  const name = page.getByRole("textbox", { name: "Tên / nghệ danh *" });
  await expect(name).toHaveValue("JGRAYSON");
  await shot(page, `${IMG}-form`, {
    fitHeight: true,
    marks: [
      { n: 1, target: name, at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Vai trò *" }), at: "left" },
      { n: 3, target: page.getByRole("textbox", { name: "Đơn vị *" }), at: "below" },
      { n: 4, target: card(page.getByText("Ảnh chân dung", { exact: true })) },
      { n: 5, target: card(page.getByText("Câu chuyện", { exact: true })) },
      { n: 6, target: page.getByRole("radiogroup", { name: "Trạng thái" }) },
      { n: 7, target: card(page.getByText("Thẻ câu chuyện trên trang Học viên tiêu biểu.")) },
    ],
  });
  const featured = card(page.getByText("Học viên tiêu biểu", { exact: true }));
  await shot(page, `${IMG}-form-tieu-bieu`, {
    area: featured,
    fitHeight: true,
    marks: [
      { n: 1, target: page.getByRole("switch", { name: /Đưa vào carousel Academy/ }), at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Câu trích dẫn *" }), at: "left" },
      { n: 3, target: container(page, page.getByText("Xem trước carousel Academy")), at: "left" },
    ],
  });

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  // Same context as the CMS page: baseURL, locale and reduced motion of the config.
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 1100, width: 1280 });
  await site.goto("/academy/students");
  const first = site.getByRole("link", { name: "Xem câu chuyện của JGRAYSON — DJ · Hooked Academy" });
  await expect(first).toBeVisible();
  await site.mouse.move(0, 0);
  await shot(site, `${IMG}-website-trang`, {
    marks: [
      {
        n: 1,
        target: site.getByText("13 HỌC VIÊN", { exact: true }).filter({ visible: true }),
        at: "left",
        tight: true,
      },
      { n: 2, target: first },
    ],
  });

  await site.goto("/academy/students?story=jgrayson");
  const story = site.getByRole("dialog", { name: "JGRAYSON — Học viên tiêu biểu" });
  await expect(story).toBeVisible();
  await shot(site, `${IMG}-website-cau-chuyen`, {
    marks: [
      { n: 1, target: story.getByRole("img", { name: "JGRAYSON" }) },
      { n: 2, target: story.getByText("JGRAYSON", { exact: true }), at: "right", tight: true },
      { n: 3, target: story.getByText("DJ · Hooked Academy", { exact: true }), at: "right", tight: true },
      { n: 4, target: story.getByText(/^Sau khóa học DJ Chuyên Nghiệp/), at: "left", tight: true },
    ],
  });

  await site.setViewportSize({ height: 900, width: 1280 });
  await site.goto("/academy");
  const carousel = site.getByRole("region", { name: "Câu chuyện học viên tiêu biểu" }).filter({ visible: true });
  const slide = carousel.getByRole("group", { name: "1 / 3: JGRAYSON" });
  await slide.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website-carousel`, {
    area: site.getByRole("region", { exact: true, name: "HỌC VIÊN TIÊU BIỂU" }),
    marks: [
      { n: 1, target: slide.getByRole("heading", { name: "JGRAYSON" }), at: "right", tight: true },
      { n: 2, target: slide.getByText("DJ · Hooked Academy", { exact: true }), at: "right", tight: true },
      { n: 3, target: slide.getByText(/^J Grayson bứt phá mạnh mẽ/), at: "right", tight: true },
      { n: 4, target: slide.getByRole("link", { name: "Xem câu chuyện →" }), at: "right" },
    ],
  });
  await site.close();

  // ── On a phone: the same featured students, one per slide ──────────────────────────────────────────────
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
  const section = mobile.getByRole("region", { exact: true, name: "HỌC VIÊN TIÊU BIỂU" });
  const mobileCarousel = mobile
    .getByRole("region", { name: "Câu chuyện học viên tiêu biểu" })
    .filter({ visible: true });
  await mobileCarousel.scrollIntoViewIfNeeded();
  await expect(mobileCarousel.getByRole("group", { name: "1 / 3: JGRAYSON" })).toBeInViewport();
  await shot(mobile, `${IMG}-website-carousel-dien-thoai`, {
    area: section,
    fitHeight: true,
    marks: [
      {
        n: 1,
        target: mobileCarousel.getByRole("button", { name: /^Học viên 1: / }).locator(".."),
        at: "right",
        tight: true,
      },
    ],
  });
  await phone.close();
});
