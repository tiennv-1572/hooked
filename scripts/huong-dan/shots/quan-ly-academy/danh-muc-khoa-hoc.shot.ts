/**
 * Ảnh của trang "Quản lý Academy › Danh mục khóa học" (content/huong-dan/quan-ly-academy/danh-muc-khoa-hoc.mdx).
 * Tạo danh mục mẫu "VJ", chụp từng bước, rồi xoá nó qua giao diện: chạy lại bao nhiêu lần cũng ra cùng ảnh.
 */
import { expect, test } from "@playwright/test";

import { card, container, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "quan-ly-academy/danh-muc-khoa-hoc";
const SAMPLE = "VJ";
const RENAMED = "VJ Visual";

test("Danh mục khóa học", async ({ page }) => {
  // A run that failed half-way may have left the sample behind.
  localSql(`delete from course_categories where label in ('${SAMPLE}', '${RENAMED}')`);

  await login(page);
  await page.goto("/admin/course-categories");
  const row = (label: string) =>
    container(
      page,
      page.getByRole("button", { exact: true, name: label }),
      page.getByRole("button", { name: `Thao tác cho ${label}` }),
    );
  await expect(row("Flip")).toBeVisible();

  // ── The screen ──────────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Thêm danh mục" }) },
      { n: 2, target: row("DJ").getByRole("button", { name: "Kéo để sắp xếp" }) },
      { n: 3, target: page.getByRole("button", { exact: true, name: "DJ" }), at: "right" },
      { n: 4, target: page.getByRole("button", { name: "2 khóa học thuộc danh mục DJ" }) },
      { n: 5, target: page.getByRole("button", { name: "Thao tác cho DJ" }) },
      { n: 6, target: card(page.getByText("Thanh lọc trên website", { exact: true })) },
    ],
  });

  // ── Add: errors first, then the sample ──────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Thêm danh mục" }).click();
  const add = dialog(page, "Thêm danh mục");
  const name = add.getByLabel("Tên danh mục");
  await add.getByRole("button", { name: "Thêm danh mục" }).click();
  await expect(add.getByText("Nhập tên danh mục.")).toBeVisible();
  await shot(page, `${IMG}-loi-de-trong`, {
    area: add,
    marks: [{ n: 1, target: add.getByText("Nhập tên danh mục."), at: "right", tight: true }],
  });

  await name.fill("dj");
  await add.getByRole("button", { name: "Thêm danh mục" }).click();
  await expect(add.getByText("Tên này đã tồn tại.")).toBeVisible();
  await shot(page, `${IMG}-loi-trung-ten`, {
    area: add,
    marks: [{ n: 1, target: add.getByText("Tên này đã tồn tại."), at: "right", tight: true }],
  });

  // The guide quotes this message: the field takes more than 24 characters, the save refuses them.
  await name.fill("Lighting & Stage Production");
  await add.getByRole("button", { name: "Thêm danh mục" }).click();
  await expect(add.getByText("Tối đa 24 ký tự để nút lọc gọn gàng.")).toBeVisible();

  await name.fill(SAMPLE);
  await expect(add.getByText("Tối đa 24 ký tự để nút lọc gọn gàng.")).toBeHidden();
  await shot(page, `${IMG}-them-moi`, {
    area: add,
    marks: [
      { n: 1, target: name },
      { n: 2, target: add.getByRole("button", { name: "Thêm danh mục" }) },
    ],
  });
  await add.getByRole("button", { name: "Thêm danh mục" }).click();
  await expect(add).toBeHidden();
  await expect(row(SAMPLE)).toBeVisible();
  await noToasts(page);
  const hiddenNote = page.getByText(`Ẩn vì chưa có khóa học đã xuất bản: ${SAMPLE}.`);
  await expect(hiddenNote).toBeVisible();
  await shot(page, `${IMG}-sau-khi-them`, {
    marks: [
      { n: 1, target: row(SAMPLE) },
      { n: 2, target: hiddenNote, at: "right", tight: true },
    ],
  });

  // ── Quick rename: click the name, type, Enter ────────────────────────────────────────────────────────────
  await page.getByRole("button", { exact: true, name: SAMPLE }).click();
  const input = page.getByRole("textbox", { name: "Tên danh mục" });
  await input.fill(RENAMED);
  await shot(page, `${IMG}-doi-ten-nhanh`, {
    area: card(input),
    marks: [{ n: 1, target: input }],
  });
  await input.press("Enter");
  await expect(page.getByText(`Đã đổi tên thành “${RENAMED}”.`)).toBeVisible();
  await noToasts(page);

  // ── Courses of a category ────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "2 khóa học thuộc danh mục DJ" }).click();
  const courses = page.getByRole("dialog").filter({ hasText: "Khóa học thuộc “DJ”" });
  await expect(courses).toBeVisible();
  await shot(page, `${IMG}-khoa-hoc-thuoc-danh-muc`, {
    area: card(page.getByRole("button", { name: "2 khóa học thuộc danh mục DJ" })),
    marks: [{ n: 1, target: page.getByRole("button", { name: "2 khóa học thuộc danh mục DJ" }) }],
  });
  await page.keyboard.press("Escape");

  // ── Delete a category that still has courses: they must move first (shown, then cancelled) ──────────────
  await page.getByRole("button", { name: "Thao tác cho Flip" }).click();
  const menu = page.getByRole("menu");
  await shot(page, `${IMG}-thao-tac`, {
    // The open menu hides the rest of the page from the accessibility tree: by its label instead.
    area: card(page.locator('[aria-label="Thao tác cho Flip"]')),
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Sửa" }) },
      { n: 2, target: menu.getByRole("menuitem", { name: "Xóa" }) },
    ],
  });
  await menu.getByRole("menuitem", { name: "Xóa" }).click();
  const move = dialog(page, "Xóa danh mục “Flip”");
  await expect(move).toBeVisible();
  await shot(page, `${IMG}-xoa-con-khoa-hoc`, {
    area: move,
    marks: [
      { n: 1, target: move.getByRole("combobox", { name: "Chuyển sang danh mục" }) },
      { n: 2, target: move.getByRole("button", { name: /Chuyển 1 khóa học & xóa/ }) },
    ],
  });
  await move.getByRole("button", { name: "Hủy" }).click();
  await expect(move).toBeHidden();

  // ── Delete the sample (no course: a plain confirmation) ─────────────────────────────────────────────────
  await page.getByRole("button", { name: `Thao tác cho ${RENAMED}` }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirm = dialog(page, `Xóa danh mục “${RENAMED}”?`);
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa-xac-nhan`, {
    area: confirm,
    marks: [{ n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }) }],
  });
  await confirm.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(row(RENAMED)).toBeHidden();
  expect(localSql(`select count(*) from course_categories where label in ('${SAMPLE}', '${RENAMED}')`)).toBe("0");

  // ── On the website: the course list's filter on /academy ───────────────────────────────────────────────
  // Same context as the CMS page: baseURL, locale and reduced motion of the config.
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 1000, width: 1280 });
  await site.goto("/academy");
  const list = site.getByRole("region", { name: "Tất cả khóa học" });
  await list.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website`, {
    area: list,
    marks: [
      { n: 1, target: list.getByRole("group", { name: "Lọc khóa học theo nhóm" }) },
      { n: 2, target: list.getByRole("listitem").first().getByText("DJ", { exact: true }), at: "right", tight: true },
    ],
  });
  await site.close();
});
