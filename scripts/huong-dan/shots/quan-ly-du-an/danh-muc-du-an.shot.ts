/**
 * Ảnh của trang "Quản lý dự án › Danh mục dự án" (content/huong-dan/quan-ly-du-an/danh-muc-du-an.mdx).
 * Tạo danh mục mẫu "Lighting design", chụp từng bước, rồi xoá nó qua giao diện: chạy lại bao nhiêu lần cũng ra cùng ảnh.
 * Danh mục đang có dự án chỉ được mở hộp xóa rồi bấm Hủy.
 */
import { expect, test } from "@playwright/test";

import { card, container, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "quan-ly-du-an/danh-muc-du-an";
const SAMPLE = "Lighting design";
const SAMPLE_SLUG = "lighting-design";

test("Danh mục dự án", async ({ page }) => {
  // A run that failed half-way may have left the sample behind.
  localSql(`delete from project_categories where label = '${SAMPLE}' or slug = '${SAMPLE_SLUG}'`);

  await login(page);
  await page.goto("/admin/project-categories");
  const row = (label: string) =>
    container(
      page,
      page.getByRole("button", { exact: true, name: label }),
      page.getByRole("button", { name: `Thao tác cho ${label}` }),
    );
  await expect(row("DJ Contest")).toBeVisible();
  const filterCard = card(page.getByText("Thanh lọc trên website", { exact: true }));

  // ── The screen. Row marks on the last row: below it there is room for the numbers. ──────────────────────
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Thêm danh mục" }) },
      { n: 2, target: row("DJ Contest").getByRole("button", { name: "Kéo để sắp xếp" }) },
      { n: 3, target: page.getByRole("button", { exact: true, name: "DJ Contest" }), at: "below" },
      { n: 4, target: page.locator("code").filter({ hasText: /^dj-contest$/ }), at: "below" },
      { n: 5, target: page.getByRole("button", { name: "2 dự án dùng danh mục DJ Contest" }) },
      { n: 6, target: page.getByRole("button", { name: "Thao tác cho DJ Contest" }) },
      { n: 7, target: filterCard },
    ],
  });

  // ── Add: errors first, then the sample ──────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Thêm danh mục" }).click();
  const add = dialog(page, "Thêm danh mục");
  const name = add.getByRole("textbox", { name: "Tên danh mục" });
  const slug = add.getByRole("textbox", { name: "Đường dẫn (slug)" });
  const submit = add.getByRole("button", { name: "Thêm danh mục" });

  await name.fill("International artists booking & management");
  await submit.click();
  const tooLong = add.getByText("Tối đa 40 ký tự để nút lọc gọn gàng.");
  await expect(tooLong).toBeVisible();
  await shot(page, `${IMG}-loi-qua-dai`, { area: add, marks: [{ n: 1, target: tooLong, at: "right", tight: true }] });

  await name.fill("Media production");
  await slug.fill("media");
  await submit.click();
  const taken = add.getByText("Slug này đã được dùng.");
  await expect(taken).toBeVisible();
  await shot(page, `${IMG}-loi-slug-trung`, { area: add, marks: [{ n: 1, target: taken, at: "right", tight: true }] });

  // "Tạo lại từ tiêu đề" sets the slug without checking it again (the old error would stay): typed instead.
  await name.fill(SAMPLE);
  await slug.fill(SAMPLE_SLUG);
  await expect(taken).toBeHidden();
  await shot(page, `${IMG}-them-moi`, {
    area: add,
    marks: [
      { n: 1, target: name },
      // The whole slug row (its "?service=" prefix, the field and its two buttons).
      { n: 2, target: slug.locator("xpath=..") },
      { n: 3, target: add.getByRole("button", { name: "Tạo lại từ tiêu đề" }), at: "above" },
      { n: 4, target: submit, at: "right" },
    ],
  });
  await submit.click();
  await expect(add).toBeHidden();
  await expect(row(SAMPLE)).toBeVisible();
  await noToasts(page);
  await shot(page, `${IMG}-sau-khi-them`, {
    marks: [
      { n: 1, target: row(SAMPLE) },
      { n: 2, target: filterCard.getByText(SAMPLE, { exact: true }), at: "right" },
    ],
  });

  // ── The sample on the website: a chip, and an empty list when it is chosen ─────────────────────────────
  const site = await page.context().newPage();
  await site.goto(`/projects?service=${SAMPLE_SLUG}`);
  const chips = site.getByRole("group", { name: "Lọc dự án theo dịch vụ" });
  const empty = site.getByText("Chưa có dự án nào thuộc dịch vụ này. Xem tất cả dự án của Hooked.");
  await expect(empty).toBeVisible();
  await shot(site, `${IMG}-website-trong`, {
    area: container(site, chips, empty),
    marks: [
      { n: 1, target: chips.getByRole("button", { name: SAMPLE }), at: "below" },
      { n: 2, target: empty, at: "right", tight: true },
    ],
  });
  await site.close();

  // ── Courses of a category… projects of a category ─────────────────────────────────────────────────────
  const usage = page.getByRole("button", { name: "5 dự án dùng danh mục Media" });
  await usage.click();
  await expect(page.getByText("Dự án thuộc “Media”")).toBeVisible();
  await shot(page, `${IMG}-du-an-thuoc-danh-muc`, { area: card(usage), marks: [{ n: 1, target: usage }] });
  await page.keyboard.press("Escape");

  // ── The row menu, then "Sửa nhãn & slug" with a changed slug (shown, then cancelled) ───────────────────
  await page.getByRole("button", { name: `Thao tác cho ${SAMPLE}` }).click();
  const menu = page.getByRole("menu");
  await shot(page, `${IMG}-thao-tac`, {
    // The open menu hides the rest of the page from the accessibility tree: by its label instead.
    area: card(page.locator(`[aria-label="Thao tác cho ${SAMPLE}"]`)),
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Sửa nhãn & slug" }), at: "right" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Xem trên website" }), at: "right" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "right" },
    ],
  });
  await menu.getByRole("menuitem", { name: "Sửa nhãn & slug" }).click();
  const edit = dialog(page, "Sửa danh mục");
  const editSlug = edit.getByRole("textbox", { name: "Đường dẫn (slug)" });
  await editSlug.fill("lighting");
  // Out of the field, so its text is not shown selected.
  await edit.getByText("Nhãn hiển thị trên nút lọc và dưới tên thẻ dự án.").click();
  const warning = edit.getByText("Đổi đường dẫn sẽ làm các liên kết cũ không còn lọc đúng danh mục này.");
  await expect(warning).toBeVisible();
  await shot(page, `${IMG}-sua`, {
    area: edit,
    marks: [
      { n: 1, target: editSlug.locator("xpath=..") },
      { n: 2, target: warning, at: "right", tight: true },
      { n: 3, target: edit.getByText("Đang dùng bởi 0 dự án."), at: "right", tight: true },
    ],
  });
  await edit.getByRole("button", { name: "Hủy" }).click();
  await expect(edit).toBeHidden();

  // ── Delete a category in use: the projects lose it (shown, then cancelled) ─────────────────────────────
  await page.getByRole("button", { name: "Thao tác cho DJ Contest" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const inUse = dialog(page, "Danh mục “DJ Contest” đang được dùng");
  await expect(inUse).toBeVisible();
  await shot(page, `${IMG}-xoa-dang-dung`, {
    area: inUse,
    marks: [
      { n: 1, target: inUse.getByText(/2 dự án đang thuộc danh mục này/), at: "left" },
      { n: 2, target: inUse.getByRole("button", { name: "Gỡ khỏi 2 dự án & xóa" }), at: "right" },
    ],
  });
  await inUse.getByRole("button", { name: "Hủy" }).click();
  await expect(inUse).toBeHidden();

  // ── Delete the sample (no project: a plain confirmation) ───────────────────────────────────────────────
  await page.getByRole("button", { name: `Thao tác cho ${SAMPLE}` }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirm = dialog(page, `Xóa danh mục “${SAMPLE}”?`);
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa-xac-nhan`, {
    area: confirm,
    marks: [{ n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }) }],
  });
  await confirm.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(row(SAMPLE)).toBeHidden();
  expect(localSql(`select count(*) from project_categories where slug = '${SAMPLE_SLUG}'`)).toBe("0");

  // ── On the website: the chips, and the categories under each card ──────────────────────────────────────
  const website = await page.context().newPage();
  await website.goto("/projects");
  const filters = website.getByRole("group", { name: "Lọc dự án theo dịch vụ" });
  const firstCard = website.getByRole("article").filter({ hasText: "Devoid Music Festival" });
  await expect(firstCard).toBeVisible();
  await shot(website, `${IMG}-website`, {
    area: container(website, filters, firstCard),
    marks: [
      { n: 1, target: filters, at: "above" },
      {
        n: 2,
        target: firstCard.getByText("Event production · Artist management · Media · Music consultant", {
          exact: false,
        }),
        at: "right",
        tight: true,
      },
    ],
  });
  await website.close();
});
