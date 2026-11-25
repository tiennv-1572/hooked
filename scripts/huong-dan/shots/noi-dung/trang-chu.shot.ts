/**
 * Ảnh của trang "Nội dung › Trang chủ" (content/huong-dan/noi-dung/trang-chu.mdx).
 * Chỉ mở từng tab và chụp; lỗi "quá dài" được tạo rồi bấm Hoàn tác — không lưu gì, trang chủ giữ nguyên.
 */
import { expect, test, type Page } from "@playwright/test";

import { card, login, shot } from "../kit";

const IMG = "noi-dung/trang-chu";

async function openTab(page: Page, name: RegExp) {
  await page.getByRole("tab", { name }).click();
  await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
}

test("Trang chủ", async ({ browser, page }) => {
  await login(page);
  await page.goto("/admin/pages/home");
  await expect(page.getByRole("button", { name: "Xem ảnh 1" })).toBeVisible();
  // The hero preview plays by itself: stop it on the first picture so the shot is the same every run.
  await page.getByRole("button", { name: "Tạm dừng" }).click();
  await page.getByRole("button", { exact: true, name: "Ảnh 1" }).click();

  // ── The screen: tabs, header buttons, preview, save bar ─────────────────────────────────────────────────
  await shot(page, `${IMG}-tong-quan`, {
    marks: [
      { n: 1, target: page.getByRole("tablist") },
      { n: 2, target: page.getByRole("link", { name: "Xem trang" }), at: "below" },
      { n: 3, target: page.getByRole("button", { name: "Khôi phục mặc định" }), at: "below" },
      { n: 4, target: page.getByRole("complementary") },
      { n: 5, target: page.getByRole("button", { name: /Lưu thay đổi/ }), at: "above" },
    ],
  });

  // ── Hero: the pictures, one tile hovered to show its buttons ────────────────────────────────────────────
  const hero = card(page.getByText("Ảnh trình chiếu", { exact: true }));
  await page.getByRole("button", { name: "Xem ảnh 2" }).hover();
  await shot(page, `${IMG}-hero`, {
    area: hero,
    padding: 32,
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Thêm ảnh" }), at: "above" },
      { n: 2, target: page.getByRole("button", { name: "Thêm video YouTube" }), at: "left" },
      { n: 3, target: page.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      // The two buttons a hovered picture shows: Thay ảnh, Gỡ ảnh.
      { n: 4, target: page.getByRole("button", { name: "Thay ảnh" }).nth(1).locator(".."), at: "below" },
    ],
  });
  await page.getByRole("button", { name: "Thêm video YouTube" }).click();
  const video = page.getByRole("dialog").filter({ hasText: "Link video YouTube" });
  await expect(video).toBeVisible();
  await shot(page, `${IMG}-hero-video`, {
    area: hero,
    include: [video],
    marks: [
      { n: 1, target: video.getByRole("textbox"), at: "left" },
      { n: 2, target: video.getByRole("button", { name: "Thêm video" }), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");

  // ── Giới thiệu ───────────────────────────────────────────────────────────────────────────────────────────
  await openTab(page, /^Giới thiệu/);
  const intro = page.getByRole("tabpanel");
  await shot(page, `${IMG}-gioi-thieu`, {
    area: intro,
    marks: [
      {
        n: 1,
        target: intro.locator("[data-slot=field-label]").filter({ hasText: /^Tiêu đề/ }),
        at: "right",
        tight: true,
      },
      { n: 2, target: intro.getByRole("button", { name: "Thêm dòng" }), at: "right" },
      { n: 3, target: intro.getByRole("textbox", { name: "Đoạn giới thiệu *" }), at: "left" },
      { n: 4, target: intro.getByText(/^Trên desktop:/), at: "right", tight: true },
      { n: 5, target: intro.getByRole("complementary") },
    ],
  });

  // Too long: the error, the red dot on the tab — then put back with Hoàn tác (nothing is saved).
  const body = intro.getByRole("textbox", { name: "Đoạn giới thiệu *" });
  const original = await body.inputValue();
  await body.fill(`${original} VÀ CỘNG ĐỒNG RAVER TRÊN CẢ NƯỚC`);
  await page.keyboard.press("Control+s");
  await expect(page.getByText("Tối đa 130 ký tự (3 dòng).")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    marks: [
      { n: 1, target: page.getByRole("tab", { name: /^Giới thiệu/ }).getByLabel("Có trường chưa hợp lệ"), at: "below" },
      { n: 2, target: page.getByText("Tối đa 130 ký tự (3 dòng)."), at: "right", tight: true },
      { n: 3, target: intro.getByText(/^Trên desktop:/), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(body).toHaveValue(original);

  // ── Highlight ────────────────────────────────────────────────────────────────────────────────────────────
  await openTab(page, /^Highlight/);
  const highlight = page.getByRole("tabpanel");
  const left = card(highlight.getByText("Thẻ trái", { exact: true }));
  await shot(page, `${IMG}-highlight`, {
    fitHeight: true,
    area: highlight,
    marks: [
      { n: 1, target: left.getByRole("textbox", { name: "Tiêu đề *" }), at: "left" },
      { n: 2, target: left.getByRole("textbox", { name: "Liên kết *" }), at: "left" },
      { n: 3, target: left.getByRole("button", { name: "Chọn trang" }), at: "right" },
      { n: 4, target: left.getByRole("radiogroup"), at: "right" },
      {
        n: 5,
        target: left.locator("[data-slot=field-label]").filter({ hasText: /^Ảnh nền/ }),
        at: "right",
        tight: true,
      },
      { n: 6, target: highlight.getByRole("button", { name: "Đổi vị trí 2 thẻ" }), at: "left" },
    ],
  });

  // ── Dịch vụ: the list, the first service opened ─────────────────────────────────────────────────────────
  await openTab(page, /^Dịch vụ/);
  const services = page.getByRole("tabpanel");
  await services.getByRole("button", { name: "1. ACADEMY" }).click();
  await expect(services.getByRole("textbox", { name: "Tên dịch vụ *" })).toBeVisible();
  await shot(page, `${IMG}-dich-vu`, {
    fitHeight: true,
    area: card(services.getByText("Danh sách dịch vụ", { exact: false }).first()),
    marks: [
      { n: 1, target: services.getByRole("button", { name: "1. ACADEMY" }), at: "above" },
      { n: 2, target: services.getByRole("textbox", { name: "Tên dịch vụ *" }), at: "left" },
      { n: 3, target: services.getByRole("textbox", { name: "Liên kết *" }), at: "above" },
      { n: 4, target: services.getByText("Xuống dòng trên desktop", { exact: true }), at: "right", tight: true },
      { n: 5, target: services.getByRole("textbox", { name: "Mô tả *" }), at: "left" },
      {
        n: 6,
        target: services.locator("[data-slot=field-label]").filter({ hasText: /^Ảnh\s*\*?$/ }),
        at: "right",
        tight: true,
      },
      { n: 7, target: services.getByRole("button", { name: "Thêm dịch vụ" }), at: "right" },
    ],
  });

  // ── Blog carousel ────────────────────────────────────────────────────────────────────────────────────────
  await openTab(page, /^Blog carousel/);
  const blog = page.getByRole("tabpanel");
  await blog.getByRole("button", { name: "2. VUI FEST CÁT BÀ" }).click();
  await expect(blog.getByRole("button", { name: "Điền từ bài viết" })).toBeVisible();
  await shot(page, `${IMG}-blog`, {
    fitHeight: true,
    area: card(blog.getByText("Thẻ bài viết", { exact: true })),
    marks: [
      { n: 1, target: blog.getByRole("button", { name: "Thêm từ bài viết" }), at: "left" },
      { n: 2, target: blog.getByRole("checkbox", { name: "Thẻ giữa" }).nth(1), at: "left" },
      { n: 3, target: blog.getByRole("button", { name: "Điền từ bài viết" }), at: "left" },
      { n: 4, target: blog.getByRole("textbox", { name: "Tiêu đề *" }), at: "left" },
      { n: 5, target: blog.getByRole("textbox", { name: "Liên kết *" }), at: "above" },
      { n: 6, target: blog.getByRole("textbox", { name: "Chú thích dòng 1 *" }), at: "left" },
      { n: 7, target: blog.getByRole("button", { name: "Thêm thẻ trống" }), at: "right" },
    ],
  });
  await blog.getByRole("button", { name: "Thêm từ bài viết" }).click();
  const picker = page.getByRole("dialog", { name: "Thêm thẻ từ bài viết" });
  await expect(picker.getByRole("option").first()).toBeVisible();
  await shot(page, `${IMG}-blog-chon-bai`, {
    area: picker,
    marks: [
      { n: 1, target: picker.getByPlaceholder("Tìm bài viết…"), at: "right" },
      { n: 2, target: picker.getByRole("option").first(), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();

  // ── Đối tác ──────────────────────────────────────────────────────────────────────────────────────────────
  await openTab(page, /^Đối tác/);
  const partners = page.getByRole("tabpanel");
  await shot(page, `${IMG}-doi-tac`, {
    fitHeight: true,
    area: partners,
    marks: [
      {
        n: 1,
        target: partners.locator("[data-slot=field-label]").filter({ hasText: /^Tiêu đề/ }),
        at: "right",
        tight: true,
      },
      { n: 2, target: partners.getByRole("textbox", { name: "Nội dung *" }), at: "left" },
      { n: 3, target: partners.getByRole("textbox", { name: "Nhãn nút *" }), at: "left" },
      { n: 4, target: partners.getByRole("textbox", { name: "Liên kết *" }), at: "above" },
    ],
  });
  await expect(page.getByText("Đã lưu mọi thay đổi")).toBeVisible();

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/");
  const slides = site.getByRole("region", { exact: true, name: "Hooked Entertainment" });
  await expect(slides).toBeVisible();
  await shot(site, `${IMG}-website-hero`, {
    marks: [
      { n: 1, target: slides.getByRole("group", { name: "1 / 5" }) },
      { n: 2, target: slides.getByRole("button", { name: "Ảnh tiếp theo" }), at: "left" },
      { n: 3, target: slides.getByRole("marquee"), at: "above" },
    ],
  });

  const introSite = site.getByRole("region", { name: "SUPPORTING LOCAL ARTISTS." });
  await introSite.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website-gioi-thieu`, {
    area: introSite,
    padding: 0,
    marks: [
      { n: 1, target: introSite.getByRole("heading", { level: 1 }), at: "left", tight: true },
      { n: 2, target: introSite.getByRole("paragraph"), at: "left", tight: true },
    ],
  });

  const highlightSite = site.getByRole("region", { name: "HIGHLIGHT" });
  await highlightSite.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website-highlight`, {
    area: highlightSite,
    padding: 0,
    marks: [
      { n: 1, target: highlightSite.getByRole("link", { name: /^ACADEMY/ }) },
      { n: 2, target: highlightSite.getByRole("link", { name: /^PROJECTS/ }) },
    ],
  });

  const servicesSite = site.getByRole("region", { name: "OUR SERVICE" });
  await servicesSite.scrollIntoViewIfNeeded();
  const firstService = servicesSite.getByRole("listitem").first();
  await shot(site, `${IMG}-website-dich-vu`, {
    area: servicesSite,
    padding: 0,
    marks: [
      { n: 1, target: firstService.getByRole("img") },
      { n: 2, target: firstService.getByRole("heading"), at: "above", tight: true },
      { n: 3, target: firstService.getByRole("paragraph"), at: "below", tight: true },
    ],
  });

  const blogSite = site.getByRole("region", { name: "Blogpost" });
  await blogSite.scrollIntoViewIfNeeded();
  const centre = blogSite.getByRole("link").first();
  await shot(site, `${IMG}-website-blog`, {
    area: blogSite,
    padding: 0,
    marks: [
      { n: 1, target: centre.getByRole("img"), at: "left" },
      { n: 2, target: centre.getByRole("heading"), at: "left", tight: true },
      { n: 3, target: centre.getByRole("paragraph"), at: "left", tight: true },
      { n: 4, target: blogSite.getByRole("button", { name: /^Bài tiếp theo:/ }), at: "right" },
    ],
  });

  const partnersSite = site.getByRole("region", { name: /ĐỒNG HÀNH CÙNG CÁC THƯƠNG HIỆU LỚN/ });
  await partnersSite.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website-doi-tac`, {
    area: partnersSite,
    padding: 0,
    marks: [
      { n: 1, target: partnersSite.getByRole("heading"), at: "above", tight: true },
      { n: 2, target: partnersSite.getByRole("paragraph"), at: "above", tight: true },
      { n: 3, target: partnersSite.getByRole("marquee"), at: "above" },
    ],
  });
  await site.close();

  // ── On a phone: the partners block ends with the button (no button on desktop) ──────────────────────────
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
  await mobile.goto("/");
  const partnersMobile = mobile.getByRole("region", { name: /ĐỒNG HÀNH CÙNG CÁC THƯƠNG HIỆU LỚN/ });
  const cta = partnersMobile.getByRole("link", { name: /Đối tác của Hooked/ });
  await cta.scrollIntoViewIfNeeded();
  await shot(mobile, `${IMG}-website-doi-tac-mobile`, {
    area: partnersMobile,
    padding: 0,
    marks: [{ n: 1, target: cta, at: "above" }],
  });
  await phone.close();
});
