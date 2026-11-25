/**
 * Ảnh của trang "Hệ thống › Khôi phục dữ liệu mẫu" (content/huong-dan/he-thong/khoi-phuc-du-lieu-mau.mdx).
 * Chỉ chụp menu tài khoản và hộp hỏi lại, rồi bấm Hủy: KHÔNG bao giờ khôi phục thật trong kịch bản (mất bước chuẩn bị
 * dữ liệu của stack: ngày tháng, email mẫu — phải chạy lại `pnpm docs:stack up`).
 */
import { expect, test } from "@playwright/test";

import { dialog, login, shot } from "../kit";

const IMG = "he-thong/khoi-phuc-du-lieu-mau";

test("Khôi phục dữ liệu mẫu", async ({ page }) => {
  await login(page);
  await page.goto("/admin");
  const account = page.getByRole("button", { name: /Hooked Admin/ }).last();
  await expect(account).toBeVisible();

  // The account menu at the foot of the sidebar (owners only see the item).
  await account.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-menu`, {
    area: page.locator('button[aria-haspopup="menu"][data-state="open"]'),
    include: [menu],
    marks: [{ n: 1, target: menu.getByRole("menuitem", { name: "Khôi phục dữ liệu mẫu" }), at: "right" }],
    padding: 24,
  });

  await menu.getByRole("menuitem", { name: "Khôi phục dữ liệu mẫu" }).click();
  const confirm = dialog(page, "Khôi phục dữ liệu mẫu?");
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-hoi-lai`, {
    area: confirm,
    marks: [
      { n: 1, target: confirm.getByRole("button", { name: "Khôi phục" }), at: "below" },
      { n: 2, target: confirm.getByRole("button", { name: "Hủy" }), at: "below" },
    ],
  });
  await confirm.getByRole("button", { name: "Hủy" }).click();
  await expect(confirm).toBeHidden();
});
