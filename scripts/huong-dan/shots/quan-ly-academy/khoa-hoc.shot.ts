/**
 * Ảnh của trang "Quản lý Academy › Khóa học" (content/huong-dan/quan-ly-academy/khoa-hoc.mdx).
 * Tạo khóa học mẫu "MC sự kiện doanh nghiệp", chụp form, xuất bản để chụp trên website, rồi xóa nó qua giao diện:
 * chạy lại bao nhiêu lần cũng ra cùng ảnh.
 */
import { expect, test, type Page } from "@playwright/test";

import { card, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "quan-ly-academy/khoa-hoc";
const TITLE = "MC sự kiện doanh nghiệp";
const SAMPLE = {
  description:
    "Khoá học dành cho những bạn muốn dẫn chương trình sự kiện doanh nghiệp: hội nghị khách hàng, tiệc tất niên, lễ ra mắt sản phẩm. Học cách viết kịch bản, giữ nhịp chương trình và xử lý tình huống trên sân khấu.",
  modules: [
    "Kỹ năng giọng nói và phát âm",
    "Kịch bản hội nghị, gala, lễ ra mắt",
    "Dẫn song ngữ Việt – Anh",
    "Xử lý tình huống trên sân khấu",
  ],
  benefits: ["Học 1:1 cùng với giảng viên", "Thực hành tại sự kiện của Hooked", "Học lại miễn phí khi chưa tự tin"],
};

/** Fills a one-line-per-row list ("Chương trình học", "Quyền lợi"): the first row exists, more are added. */
async function fillLines(page: Page, placeholder: string, addLabel: string, lines: string[]) {
  for (const [index, line] of lines.entries()) {
    if (index > 0) await page.getByRole("button", { name: addLabel }).click();
    await page.getByPlaceholder(placeholder).nth(index).fill(line);
  }
}

test("Khóa học", async ({ page }) => {
  // A run that failed half-way may have left the sample (or a copy of it) behind.
  localSql(`delete from courses where json_unquote(json_extract(doc, '$.title')) like '${TITLE}%'`);

  await login(page);

  // ── The list: wider than 1280px, so taken at 1440px ─────────────────────────────────────────────────────
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto("/admin/courses");
  const firstRow = page.getByRole("row").filter({ hasText: "DJ cơ bản" });
  await expect(firstRow).toBeVisible();
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Thêm khóa học" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Sắp xếp" }), at: "below" },
      { n: 3, target: page.getByRole("textbox", { name: "Tìm kiếm" }) },
      { n: 4, target: page.getByRole("button", { exact: true, name: "Danh mục" }).first(), at: "below" },
      { n: 5, target: page.getByRole("button", { exact: true, name: "Trạng thái" }).first(), at: "below" },
      { n: 6, target: firstRow.getByRole("link", { name: /^17/ }) },
      { n: 7, target: firstRow.getByRole("button", { name: "Thao tác" }), at: "above" },
    ],
  });

  // The row menu. While it is open the rest of the page is hidden from the accessibility tree: CSS locators.
  await firstRow.getByRole("button", { name: "Thao tác" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-thao-tac`, {
    area: page.locator("table"),
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "right" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Chuyển về bản nháp" }), at: "right" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Xem đăng ký tư vấn" }), at: "right" },
      { n: 4, target: menu.getByRole("menuitem", { name: "Xem trang Academy" }), at: "right" },
      { n: 5, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "right" },
    ],
  });

  // Deleting a course that has registrations: they stay (shown, then cancelled).
  await menu.getByRole("menuitem", { name: "Xóa" }).click();
  const askDelete = dialog(page, 'Xóa khóa học "DJ cơ bản"?');
  await expect(askDelete).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: askDelete,
    marks: [
      {
        n: 1,
        target: askDelete.getByText(/đăng ký tư vấn đang gắn với khóa này vẫn được giữ lại/),
        at: "left",
        tight: true,
      },
    ],
  });
  await askDelete.getByRole("button", { name: "Hủy" }).click();
  await expect(askDelete).toBeHidden();

  // ── A new course ─────────────────────────────────────────────────────────────────────────────────────────
  await page.setViewportSize({ height: 800, width: 1280 });
  await page.goto("/admin/courses/new");
  await expect(page.getByRole("heading", { name: "Khóa học mới" })).toBeVisible();

  await page.getByRole("button", { name: "Chọn hoặc tải ảnh lên" }).click();
  const library = dialog(page, "Chọn một ảnh");
  await library.getByPlaceholder("Tìm theo tên…").fill("course-mc");
  await library.locator('button[title="course-mc.png"]').click();
  await library.getByRole("button", { name: "Chọn ảnh" }).click();
  await expect(library).toBeHidden();

  await page.getByRole("textbox", { name: "Tên khóa học *" }).fill(TITLE);
  await page.getByRole("textbox", { name: "Mô tả *" }).fill(SAMPLE.description);
  const tuition = page.getByRole("textbox", { name: "Học phí *" });
  await tuition.fill("18000000");
  await tuition.blur();
  await expect(tuition).toHaveValue("18.000.000 VND");

  await page.getByRole("textbox", { name: "Tên *" }).first().fill("Lil'Bee");
  await page.getByRole("button", { name: "Thêm giảng viên" }).click();
  await page.getByRole("textbox", { name: "Tên *" }).nth(1).fill("Mambo");
  await page.getByRole("textbox", { name: "Lộ trình *" }).fill("Từ 1 đến 2 tháng");
  await page.getByRole("textbox", { name: "Nhãn (không bắt buộc)" }).first().fill("Thời lượng");
  await page.getByRole("textbox", { name: "Nội dung *" }).first().fill("2h/ca, 3 buổi/tuần");
  await page.getByRole("button", { name: "Thêm dòng giờ học" }).click();
  await page.getByRole("textbox", { name: "Nội dung *" }).nth(1).fill("Linh động theo lịch của học viên");
  await fillLines(page, "Mixing cơ bản", "Thêm học phần", SAMPLE.modules);
  await fillLines(page, "Học 1:1 cùng với giảng viên", "Thêm quyền lợi", SAMPLE.benefits);
  await page.getByRole("combobox", { name: "Danh mục *" }).click();
  await page.getByRole("option", { exact: true, name: "MC" }).click();

  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${IMG}-form`, {
    marks: [
      { n: 1, target: card(page.getByText("Ảnh khóa học", { exact: true })) },
      { n: 2, target: page.getByRole("radiogroup", { name: "Trạng thái" }) },
      { n: 3, target: page.getByRole("combobox", { name: "Danh mục *" }) },
      { n: 4, target: page.getByRole("button", { name: /Tạo mới/ }), at: "above" },
    ],
  });
  const general = card(page.getByText("Thông tin chung", { exact: true }));
  await shot(page, `${IMG}-form-thong-tin-chung`, {
    area: general,
    fitHeight: true,
    marks: [
      { n: 1, target: page.getByRole("textbox", { name: "Tên khóa học *" }), at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Mô tả *" }), at: "left" },
      { n: 3, target: tuition, at: "left" },
    ],
  });
  await shot(page, `${IMG}-form-giang-vien`, {
    area: card(page.getByText("Giảng viên & lịch học", { exact: true })),
    fitHeight: true,
    marks: [
      { n: 1, target: page.getByRole("button", { name: "1. Giảng viên chính: Lil'Bee" }), at: "above" },
      { n: 2, target: page.getByRole("button", { name: "Thêm giảng viên" }), at: "right" },
      { n: 3, target: page.getByRole("textbox", { name: "Lộ trình *" }), at: "left" },
      { n: 4, target: page.getByRole("button", { name: "1. Thời lượng: 2h/ca, 3 buổi/tuần" }), at: "above" },
      { n: 5, target: page.getByRole("button", { name: "Thêm dòng giờ học" }), at: "right" },
    ],
  });
  const program = card(page.getByText("Chương trình học", { exact: true }));
  await shot(page, `${IMG}-form-chuong-trinh`, {
    area: program,
    fitHeight: true,
    marks: [
      { n: 1, target: program.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      { n: 2, target: page.getByPlaceholder("Mixing cơ bản").first(), at: "above" },
      { n: 3, target: program.getByRole("button", { name: "Xóa dòng" }).first(), at: "right" },
      { n: 4, target: page.getByRole("button", { name: "Thêm học phần" }), at: "right" },
    ],
  });

  // Create: the screen becomes the course's own page.
  await page.getByRole("button", { name: /Tạo mới/ }).click();
  await expect(page).toHaveURL(/\/admin\/courses\/(?!new)[^/]+$/);
  const created = page.locator("[data-sonner-toast]").filter({ hasText: "Đã tạo khóa học." });
  await expect(created).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${IMG}-da-tao`, {
    marks: [
      { n: 1, target: created, at: "left" },
      // The header's status pill (the aside's radio says "Bản nháp" too, later in the page).
      { n: 2, target: page.getByText("Bản nháp", { exact: true }).first(), at: "below" },
    ],
  });
  await noToasts(page);

  // Publish, so the website shows it.
  await page.getByRole("radio", { name: /Đã xuất bản/ }).click();
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "Đã lưu thay đổi." })).toBeVisible();
  await noToasts(page);

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  // Same context as the CMS page: baseURL, locale and reduced motion of the config.
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 900, width: 1280 });
  await site.goto("/academy");
  const carousel = site.getByRole("region", { name: "Các khóa học của Hooked Academy" });
  // The new course is the last one: one step back from the first slide.
  await carousel.getByRole("button", { name: `Khóa học trước: ${TITLE}` }).click();
  const slide = carousel.getByRole("group", { name: `08 / 08: ${TITLE}` });
  await expect(slide.getByRole("heading", { name: TITLE })).toBeInViewport();
  await shot(site, `${IMG}-website-carousel`, {
    area: carousel,
    marks: [
      { n: 1, target: slide.getByRole("heading", { name: TITLE }), at: "right", tight: true },
      { n: 2, target: slide.getByText(SAMPLE.description), at: "right", tight: true },
      { n: 3, target: slide.getByText("Giảng viên chính: Lil'Bee"), at: "left", tight: true },
      { n: 4, target: slide.getByText("Từ 1 đến 2 tháng"), at: "right", tight: true },
      { n: 5, target: slide.getByText("Thời lượng: 2h/ca, 3 buổi/tuần"), at: "right", tight: true },
      { n: 6, target: slide.getByRole("button", { name: "Đăng ký ngay" }), at: "right" },
    ],
  });

  const directory = site.getByRole("region", { name: "Tất cả khóa học" });
  const row = directory.getByRole("button", { name: new RegExp(`^${TITLE} — `) });
  await row.scrollIntoViewIfNeeded();
  // The mouse is still where the carousel button was: away from the rows, so none is highlighted.
  await site.mouse.move(0, 0);
  await shot(site, `${IMG}-website-danh-sach`, {
    area: directory,
    fitHeight: true,
    marks: [{ n: 1, target: row }],
  });

  await row.click();
  const programDialog = site.getByRole("dialog", { name: TITLE });
  await expect(programDialog.getByRole("heading", { name: "Chương trình học" })).toBeVisible();
  const summary = programDialog.getByRole("complementary", { name: "Thông tin khóa học" });
  await shot(site, `${IMG}-website-chuong-trinh`, {
    marks: [
      { n: 1, target: programDialog.getByText(SAMPLE.description), at: "right", tight: true },
      { n: 2, target: programDialog.getByRole("list").first(), at: "left" },
      { n: 3, target: programDialog.getByRole("list").nth(1), at: "left" },
      { n: 4, target: summary.getByText("18.000.000 VND"), at: "right", tight: true },
      { n: 5, target: summary.getByText("Giảng viên chính: Lil'Bee"), at: "right", tight: true },
      { n: 6, target: summary.getByText("Từ 1 đến 2 tháng"), at: "right", tight: true },
      { n: 7, target: summary.getByText("Thời lượng: 2h/ca, 3 buổi/tuần"), at: "right", tight: true },
      { n: 8, target: summary.getByRole("button", { name: "Đăng ký tư vấn" }), at: "above" },
    ],
  });
  await site.close();

  // ── Delete the sample ────────────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/courses");
  const sampleRow = page.getByRole("row").filter({ hasText: TITLE });
  await sampleRow.getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirmDelete = dialog(page, `Xóa khóa học "${TITLE}"?`);
  await confirmDelete.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(page.getByText("Đã xóa khóa học.")).toBeVisible();
  await expect(sampleRow).toBeHidden();
  expect(
    localSql(`select count(*) from courses where json_unquote(json_extract(doc, '$.title')) like '${TITLE}%'`),
  ).toBe("0");
});
