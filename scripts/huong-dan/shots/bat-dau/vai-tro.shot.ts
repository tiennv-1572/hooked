/**
 * Ảnh của trang "Bắt đầu › Vai trò và quyền truy cập" (content/huong-dan/bat-dau/vai-tro.mdx).
 * Không sửa dữ liệu: đăng nhập bằng tài khoản Biên tập để thấy giới hạn của vai trò này.
 */
import { expect, test } from "@playwright/test";

import { login, shot } from "../kit";

const IMG = "bat-dau/vai-tro";

test("Vai trò và quyền truy cập", async ({ page }) => {
  await login(page, "editor");

  // Your own role: next to your name in Tài khoản của tôi
  await page.goto("/admin/account");
  const role = page.getByText("Biên tập", { exact: true }).first();
  await expect(role).toBeVisible();
  await shot(page, `${IMG}-cua-toi`, {
    area: page.locator('[data-slot="card"]').first(),
    marks: [{ n: 1, target: role, at: "right" }],
  });

  // An editor on Người dùng: cannot invite or change anyone
  await page.goto("/admin/users");
  const notice = page.getByText("Bạn đang xem với quyền Biên tập");
  await expect(notice).toBeVisible();
  await shot(page, `${IMG}-bien-tap-nguoi-dung`, {
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Mời người dùng" }), at: "below" },
      { n: 2, target: page.getByRole("alert").filter({ hasText: "Bạn đang xem với quyền Biên tập" }) },
    ],
  });
});
