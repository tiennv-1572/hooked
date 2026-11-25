/**
 * Ảnh của trang "Nội dung › Đối tác" (content/huong-dan/noi-dung/doi-tac.mdx).
 * Chụp trên các đối tác có sẵn (thư viện chỉ có logo của chúng, không bịa thương hiệu khác): ẩn Weeknd khỏi trang chủ
 * rồi hiện lại và trả lại cả mốc "Cập nhật" của nó; hộp xóa thì bấm Hủy; form trống thì Hoàn tác. Không còn gì thay đổi.
 */
import { expect, test } from "@playwright/test";

import { card, localSql, login, noToasts, shot } from "../kit";

const IMG = "noi-dung/doi-tac";

test("Đối tác", async ({ page }) => {
  await login(page);
  await page.goto("/admin/partners");
  const row = (name: string) => page.locator("tbody tr").filter({ hasText: name });
  await expect(row("Jägermeister")).toBeVisible();

  // ── The list ─────────────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Thêm đối tác" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Sắp xếp" }), at: "below" },
      { n: 3, target: page.getByRole("textbox", { name: "Tìm kiếm" }), at: "below" },
      { n: 4, target: page.getByRole("button", { exact: true, name: "Hiển thị" }), at: "below" },
      { n: 5, target: row("Notfun Media").locator("td").nth(2), at: "below" },
      { n: 6, target: row("Notfun Media").getByText("#1", { exact: true }), at: "below", tight: true },
      { n: 7, target: row("Notfun Media").getByRole("button", { name: "Thao tác" }), at: "below" },
    ],
  });

  // The row menu. While it is open the rest of the page is hidden from the accessibility tree: CSS locators.
  await row("Weeknd").getByRole("button", { name: "Thao tác" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-thao-tac`, {
    area: page.locator("tbody tr").filter({ hasText: "Weeknd" }),
    include: [menu],
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "left" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Ẩn khỏi trang chủ" }), at: "left" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Xem trang Partners" }), at: "left" },
      { n: 4, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "left" },
    ],
  });

  // Hidden from the home page: only the "Trang Partners" pill is left. Then back, "Cập nhật" included.
  const updatedAt = localSql("select updated_at from partners where id = 'weeknd'");
  await menu.getByRole("menuitem", { name: "Ẩn khỏi trang chủ" }).click();
  await expect(row("Weeknd").getByText("Trang chủ", { exact: true })).toBeHidden();
  await shot(page, `${IMG}-an-trang-chu`, {
    // Name and "Hiển thị" only: the "Cập nhật" column reads "0 giây trước" until it is put back below.
    area: row("Weeknd").locator("td").nth(1),
    include: [row("Weeknd").locator("td").nth(2)],
    marks: [{ n: 1, target: row("Weeknd").locator("td").nth(2), at: "below" }],
    padding: 24,
  });
  await row("Weeknd").getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Hiện trên trang chủ" }).click();
  await expect(row("Weeknd").getByText("Trang chủ", { exact: true })).toBeVisible();
  localSql(`update partners set updated_at = '${updatedAt}' where id = 'weeknd'`);

  // ── Delete: the question, then Hủy ──────────────────────────────────────────────────────────────────────
  await row("Jägermeister").getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: confirm,
    marks: [
      { n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }), at: "below" },
      { n: 2, target: confirm.getByRole("button", { name: "Hủy" }), at: "below" },
    ],
  });
  await confirm.getByRole("button", { name: "Hủy" }).click();
  await expect(confirm).toBeHidden();

  // ── One partner ──────────────────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/partners/sun-group");
  const name = page.getByRole("textbox", { name: "Tên đối tác *" });
  await expect(name).toHaveValue("Sun Group");
  const aside = page.getByRole("complementary");
  await shot(page, `${IMG}-sua`, {
    marks: [
      { n: 1, target: name, at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Website" }), at: "left" },
      { n: 3, target: card(name).getByRole("img", { name: "Sun Group" }), at: "left" },
      { n: 4, target: aside.getByRole("switch", { name: /Dải logo trang chủ/ }), at: "left" },
      { n: 5, target: aside.getByRole("switch", { name: "Trang Partners" }), at: "left" },
      { n: 6, target: card(aside.getByText("Xem trước", { exact: true })), at: "left" },
      { n: 7, target: page.getByRole("link", { name: "Xem trên website" }).last(), at: "below" },
    ],
  });

  // ── A new partner saved empty (with a website missing https://): the messages, then Hoàn tác ────────────
  await page.goto("/admin/partners/new");
  const website = page.getByRole("textbox", { name: "Website" });
  await website.fill("noxx.vn");
  await page.getByRole("button", { name: /Tạo mới/ }).click();
  await expect(page.getByText("Nhập tên đối tác.")).toBeVisible();
  await expect(page.getByText("Đường dẫn không hợp lệ.")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    fitHeight: true,
    area: card(page.getByRole("textbox", { name: "Tên đối tác *" })),
    marks: [
      { n: 1, target: page.getByText("Nhập tên đối tác."), at: "right", tight: true },
      { n: 2, target: page.getByText("Đường dẫn không hợp lệ."), at: "right", tight: true },
      { n: 3, target: page.getByText("Chọn logo."), at: "right", tight: true },
    ],
  });
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await noToasts(page);

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.goto("/");
  const homeLogos = site.getByRole("marquee", { name: "Đối tác của Hooked" });
  await homeLogos.scrollIntoViewIfNeeded();
  await shot(site, `${IMG}-website-trang-chu`, {
    area: homeLogos,
    padding: 48,
    marks: [{ n: 1, target: homeLogos, at: "above" }],
  });

  await site.goto("/partners");
  const pageLogos = site.getByRole("marquee", { name: "Các thương hiệu đồng hành cùng Hooked" });
  const collaborations = site.getByRole("region", { name: "Dự án hợp tác cùng đối tác" });
  await expect(pageLogos).toBeVisible();
  await shot(site, `${IMG}-website-partners`, {
    fitHeight: true,
    area: pageLogos,
    include: [collaborations],
    padding: 24,
    marks: [
      { n: 1, target: pageLogos, at: "above" },
      { n: 2, target: collaborations.getByRole("list"), at: "above" },
    ],
  });
  await site.close();
});
