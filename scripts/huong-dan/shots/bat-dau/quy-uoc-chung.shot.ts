/**
 * Ảnh của trang "Bắt đầu › Quy ước dùng chung" (content/huong-dan/bat-dau/quy-uoc-chung.mdx).
 * Chỉ mở, chọn, sửa thử rồi Hoàn tác / Hủy: không lưu gì vào DB.
 */
import { expect, test } from "@playwright/test";

import { card, container, dialog, login, noToasts, shot } from "../kit";

const IMG = "bat-dau/quy-uoc-chung";

test("Quy ước dùng chung", async ({ page }) => {
  await login(page);

  // ── A list (wide table: 1440px) ─────────────────────────────────────────────────────────────────────────
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto("/admin/courses");
  const firstRow = page.getByRole("row").filter({ hasText: "DJ cơ bản" }).first();
  await expect(firstRow).toBeVisible();
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("textbox", { name: "Tìm kiếm" }) },
      { n: 2, target: page.getByRole("button", { exact: true, name: "Danh mục" }).first(), at: "below" },
      { n: 3, target: page.getByRole("button", { exact: true, name: "Cột" }), at: "left" },
      { n: 4, target: page.getByRole("columnheader", { name: "Khóa học" }).getByRole("button"), at: "right" },
      { n: 5, target: firstRow.getByRole("checkbox"), at: "left" },
      { n: 6, target: firstRow.getByRole("button", { name: "Thao tác" }), at: "below" },
      { n: 7, target: page.getByRole("button", { exact: true, name: "Sắp xếp" }), at: "below" },
    ],
  });

  // Row menu
  await firstRow.getByRole("button", { name: "Thao tác" }).click();
  const rowMenu = page.getByRole("menu");
  await expect(rowMenu).toBeVisible();
  // The open menu hides the page from the accessibility tree: the table by its tag.
  await shot(page, `${IMG}-thao-tac-dong`, { area: page.locator("table") });
  await page.keyboard.press("Escape");

  // Several rows selected
  await firstRow.getByRole("checkbox").check();
  await page.getByRole("row").filter({ hasText: "DJ toàn diện" }).getByRole("checkbox").check();
  const selected = page.getByText("Đã chọn 2", { exact: true });
  await expect(selected).toBeVisible();
  await shot(page, `${IMG}-chon-nhieu`, {
    area: container(page, selected, page.getByRole("table")),
    marks: [
      { n: 1, target: selected, at: "left", tight: true },
      { n: 2, target: page.getByRole("button", { exact: true, name: "Xuất bản" }), at: "below" },
      { n: 3, target: page.getByRole("button", { exact: true, name: "Bỏ chọn" }), at: "below" },
    ],
  });
  await firstRow.getByRole("checkbox").uncheck();
  await page.getByRole("row").filter({ hasText: "DJ toàn diện" }).getByRole("checkbox").uncheck();

  // Reorder sheet
  await page.getByRole("button", { exact: true, name: "Sắp xếp" }).click();
  const sheet = dialog(page, "Sắp xếp thứ tự");
  await expect(sheet).toBeVisible();
  await shot(page, `${IMG}-sap-xep`, {
    area: sheet,
    padding: 0,
    marks: [
      { n: 1, target: sheet.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "right" },
      { n: 2, target: sheet.getByRole("button", { name: "Lưu thứ tự" }), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  // Paging: a list longer than one page (registrations, 20 a page)
  await page.goto("/admin/leads");
  const count = page.getByText(/^\d+–\d+ trên \d+ mục$/);
  const pager = container(page, count, page.getByRole("button", { name: "Trang sau" }));
  await expect(pager).toBeVisible();
  await pager.scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-phan-trang`, {
    area: pager,
    padding: 12,
    marks: [
      { n: 1, target: count, at: "below", tight: true },
      { n: 2, target: pager.getByRole("combobox"), at: "below" },
      { n: 3, target: page.getByRole("button", { name: "Trang sau" }), at: "below" },
    ],
  });

  // ── An editor ───────────────────────────────────────────────────────────────────────────────────────────
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/admin/courses/dj-co-ban");
  const tuition = page.getByRole("textbox", { name: /^Học phí/ });
  await expect(tuition).toHaveValue("15.000.000 VND");
  await tuition.fill("16.000.000 VND");
  const status = page.getByText("Có thay đổi chưa lưu");
  await expect(status).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${IMG}-sua`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Xem trên website" }).last(), at: "below" },
      { n: 2, target: page.getByRole("button", { exact: true, name: "Nhân bản" }), at: "below" },
      { n: 3, target: page.getByRole("button", { exact: true, name: "Xóa" }).first(), at: "below" },
      { n: 4, target: status, at: "above", tight: true },
      { n: 5, target: page.getByRole("button", { name: "Hoàn tác" }), at: "above" },
      { n: 6, target: page.getByRole("button", { name: /^Lưu thay đổi/ }), at: "above" },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(tuition).toHaveValue("15.000.000 VND");

  // A required field left empty, then saved
  const title = page.getByRole("textbox", { name: /^Tên khóa học/ });
  await title.fill("");
  await page.getByRole("button", { name: /^Lưu thay đổi/ }).click();
  const fieldError = page.getByText("Nhập tên khóa học.");
  await expect(fieldError).toBeVisible();
  const toast = page.locator("[data-sonner-toast]").filter({ hasText: "Vui lòng kiểm tra các trường được đánh dấu." });
  await expect(toast).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 260));
  await shot(page, `${IMG}-loi-truong`, {
    marks: [
      { n: 1, target: fieldError, at: "right", tight: true },
      { n: 2, target: page.getByText("Còn 1 trường chưa hợp lệ"), at: "right", tight: true },
      { n: 3, target: toast, at: "left" },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(title).toHaveValue("DJ cơ bản");
  await noToasts(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  // Publish state
  const publish = card(page.getByText("Xuất bản", { exact: true }));
  await shot(page, `${IMG}-xuat-ban`, {
    area: publish,
    marks: [
      { n: 1, target: publish.getByRole("radio", { name: /Đã xuất bản/ }), at: "right" },
      { n: 2, target: publish.getByRole("radio", { name: /Bản nháp/ }), at: "right" },
    ],
  });

  // Picture field, then the picture library (closed without choosing)
  const picture = card(page.getByText("Ảnh khóa học", { exact: true }));
  await picture.getByRole("group").first().hover();
  await expect(picture.getByRole("button", { name: "Thay ảnh" })).toBeVisible();
  await shot(page, `${IMG}-o-anh`, {
    area: picture,
    marks: [
      { n: 1, target: picture.getByRole("button", { name: "Thay ảnh" }), at: "below" },
      { n: 2, target: picture.getByRole("button", { name: "Gỡ" }), at: "below" },
    ],
  });
  await picture.getByRole("button", { name: "Thay ảnh" }).click();
  const library = dialog(page, "Chọn một ảnh");
  await expect(library.getByRole("img").first()).toBeVisible();
  await shot(page, `${IMG}-thu-vien-anh`, {
    area: library,
    padding: 0,
    marks: [
      { n: 1, target: library.getByRole("tablist"), at: "right" },
      { n: 2, target: library.getByPlaceholder("Tìm theo tên…"), at: "left" },
      { n: 3, target: library.getByRole("button", { name: "Hủy" }), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(library).toBeHidden();

  // A list inside a form (instructors)
  const instructors = container(
    page,
    page.getByText(/^Giảng viên \(\d+\)$/),
    page.getByRole("button", { name: "Thêm giảng viên" }),
  );
  await instructors.scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-danh-sach-con`, {
    area: instructors,
    marks: [
      { n: 1, target: instructors.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      { n: 2, target: instructors.getByRole("button", { name: /^1\. / }), at: "above", tight: true },
      { n: 3, target: instructors.getByRole("button", { name: "Xóa mục" }).first(), at: "right" },
      { n: 4, target: instructors.getByRole("button", { name: "Thêm giảng viên" }), at: "right" },
      { n: 5, target: instructors.getByRole("button", { name: "Thu gọn tất cả" }), at: "left" },
    ],
  });

  // Delete: the confirmation (cancelled)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { exact: true, name: "Xóa" }).first().click();
  const confirm = dialog(page, "Xóa khóa học này?");
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: confirm,
    marks: [
      { n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }), at: "right" },
      { n: 2, target: confirm.getByRole("button", { name: "Hủy" }), at: "below" },
    ],
  });
  await confirm.getByRole("button", { name: "Hủy" }).click();
  await expect(confirm).toBeHidden();

  // ── Rich text (a student's story) ───────────────────────────────────────────────────────────────────────
  await page.goto("/admin/students/jgrayson");
  const story = card(page.getByText("Câu chuyện", { exact: true }));
  await expect(story.getByRole("button", { name: "Đậm (Ctrl+B)" })).toBeVisible();
  await story.scrollIntoViewIfNeeded();
  const toolbar = container(
    page,
    // Page-level parts: `filter({ has })` needs locators that do not start from another element.
    page.getByRole("button", { name: "Đậm (Ctrl+B)" }),
    page.getByRole("button", { name: "Liên kết" }),
  );
  await shot(page, `${IMG}-o-soan-thao`, {
    area: story,
    marks: [{ n: 1, target: toolbar }],
  });

  // ── A page's content (singleton): Xem trang, Khôi phục mặc định ─────────────────────────────────────────
  await page.goto("/admin/pages/contact");
  await expect(page.getByRole("heading", { level: 1, name: "Trang Contact" })).toBeVisible();
  await shot(page, `${IMG}-trang-noi-dung`, {
    marks: [
      { n: 1, target: page.getByRole("link", { exact: true, name: "Xem trang" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Khôi phục mặc định" }), at: "below" },
      { n: 3, target: page.getByText("Đã lưu mọi thay đổi"), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Khôi phục mặc định" }).click();
  const restore = dialog(page, "Khôi phục nội dung mặc định?");
  await expect(restore).toBeVisible();
  await shot(page, `${IMG}-khoi-phuc-mac-dinh`, { area: restore });
  await restore.getByRole("button", { name: "Hủy" }).click();
});
