/**
 * Ảnh của trang "Trang › Partners" (content/huong-dan/trang/partners.mdx): phần giới thiệu và lưới logo, mục Dự án hợp
 * tác, hộp chọn dự án, câu báo lỗi của một thẻ trống, và trang Partners trên website. Thẻ thêm vào và lỗi đều được bỏ
 * bằng Hoàn tác — không lưu gì, trang Partners giữ nguyên.
 */
import { expect, test } from "@playwright/test";

import { card, dialog, login, noToasts, shot } from "../kit";

const IMG = "trang/partners";

test("Trang › Partners", async ({ page }) => {
  await login(page);
  await page.goto("/admin/pages/partners");
  const title = page.getByRole("textbox", { name: "Tiêu đề *" });
  await expect(title).not.toHaveValue("");
  const intro = card(title);
  const logos = card(page.getByText("Lưới logo", { exact: true }));
  await expect(logos.getByRole("img").first()).toBeVisible();

  // ── Giới thiệu + Lưới logo ───────────────────────────────────────────────────────────────────────────────
  await shot(page, IMG, {
    fitHeight: true,
    area: intro,
    include: [logos],
    marks: [
      { n: 1, target: title, at: "left" },
      { n: 2, target: intro.locator("[contenteditable=true]"), at: "left" },
      { n: 3, target: logos, at: "left" },
      { n: 4, target: page.getByRole("link", { name: "Quản lý đối tác" }), at: "left" },
    ],
  });

  // ── Dự án hợp tác: the first card opened ───────────────────────────────────────────────────────────────
  const collabs = card(page.getByText("Dự án hợp tác", { exact: true }));
  const first = collabs.getByRole("button", { name: "1. Vui Fest Cát Bà" });
  await first.click();
  const name = collabs.getByRole("textbox", { name: "Tên dự án *" });
  await expect(name).toBeVisible();
  await shot(page, `${IMG}-du-an-hop-tac`, {
    fitHeight: true,
    area: collabs,
    marks: [
      { n: 1, target: first, at: "above" },
      { n: 2, target: collabs.getByRole("button", { name: "Điền từ dự án" }), at: "right" },
      { n: 3, target: name, at: "left" },
      { n: 4, target: collabs.getByRole("textbox", { name: "Đối tác *" }), at: "above" },
      { n: 5, target: collabs.getByRole("textbox", { name: "Liên kết *" }), at: "left" },
      {
        n: 6,
        target: collabs.locator("[data-slot=field-label]").filter({ hasText: /^Ảnh/ }),
        at: "right",
        tight: true,
      },
      { n: 7, target: collabs.getByRole("button", { name: "Thêm thẻ trống" }), at: "right" },
      { n: 8, target: collabs.getByRole("button", { name: "Thêm từ dự án" }), at: "right" },
    ],
  });
  await first.click();

  // ── Thêm từ dự án: the picker, then a card added (kept out with Hoàn tác) ──────────────────────────────
  await collabs.getByRole("button", { name: "Thêm từ dự án" }).click();
  const picker = dialog(page, "Chọn dự án");
  await expect(picker.getByRole("option").first()).toBeVisible();
  await shot(page, `${IMG}-chon-du-an`, {
    area: picker,
    marks: [
      { n: 1, target: picker.getByRole("combobox").or(picker.getByRole("textbox")).first(), at: "left" },
      { n: 2, target: picker.getByRole("option").filter({ hasText: "SPIN Awards" }), at: "left" },
    ],
  });
  await picker.getByRole("option").filter({ hasText: "SPIN Awards" }).click();
  await expect(page.getByText(/^Đã thêm “SPIN Awards” vào cuối danh sách\.$/)).toBeVisible();
  await expect(collabs.getByRole("button", { name: "3. SPIN Awards" })).toBeVisible();
  await page.getByRole("button", { exact: true, name: "Hoàn tác" }).click();
  await expect(collabs.getByRole("button", { name: /^3\./ })).toHaveCount(0);
  await noToasts(page);

  // ── An empty card saved: its messages (kept out with Hoàn tác) ──────────────────────────────────────────
  await collabs.getByRole("button", { name: "Thêm thẻ trống" }).click();
  await page.keyboard.press("Control+s");
  const empty = collabs.getByRole("textbox", { name: "Tên dự án *" });
  await expect(page.getByText("Nhập tên dự án.")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    fitHeight: true,
    area: card(empty),
    marks: [
      { n: 1, target: page.getByText("Nhập tên dự án."), at: "right", tight: true },
      { n: 2, target: page.getByText("Nhập tên đối tác."), at: "right", tight: true },
      { n: 3, target: page.getByText("Nhập đường dẫn."), at: "right", tight: true },
      { n: 4, target: page.getByText("Chọn ảnh."), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { exact: true, name: "Hoàn tác" }).click();
  await expect(collabs.getByRole("button", { name: /^3\./ })).toHaveCount(0);

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 1700, width: 1280 });
  await site.goto("/partners");
  const head = site.getByRole("region", { name: /ĐỒNG HÀNH CÙNG CÁC THƯƠNG HIỆU LỚN/ });
  const cards = site.getByRole("region", { name: "Dự án hợp tác cùng đối tác" });
  const firstCard = cards.getByRole("listitem").first();
  await shot(site, `${IMG}-website`, {
    marks: [
      { n: 1, target: head.getByRole("heading", { level: 1 }), at: "left" },
      { n: 2, target: head.getByRole("paragraph").nth(1), at: "left" },
      { n: 3, target: site.getByRole("marquee"), at: "above" },
      { n: 4, target: firstCard.getByRole("img"), at: "left" },
      { n: 5, target: firstCard.getByRole("heading", { level: 3 }), at: "right", tight: true },
      { n: 6, target: firstCard.getByRole("paragraph"), at: "right", tight: true },
      { n: 7, target: site.getByRole("region", { name: "Trở thành đối tác của Hooked Entertainment" }), at: "left" },
    ],
  });
  await site.close();
});
