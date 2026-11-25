/**
 * Ảnh của trang "Bắt đầu › Đăng nhập và đăng xuất" (content/huong-dan/bat-dau/dang-nhap.mdx).
 * Không sửa dữ liệu: chỉ điền form đăng nhập và mở menu tài khoản.
 */
import { expect, test } from "@playwright/test";

import { ACCOUNTS, login, shot } from "../kit";

const IMG = "bat-dau/dang-nhap";

test("Đăng nhập và đăng xuất", async ({ page }) => {
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  const email = page.getByLabel("Email", { exact: true });
  const password = page.getByLabel("Mật khẩu", { exact: true });
  const submit = page.getByRole("button", { name: "Đăng nhập" });
  const form = page.locator("form");

  // ── The form, filled ────────────────────────────────────────────────────────────────────────────────────
  await email.fill(ACCOUNTS.owner);
  await password.fill("hooked2026");
  await shot(page, `${IMG}-form`, {
    marks: [
      { n: 1, target: email },
      { n: 2, target: password },
      { n: 3, target: page.getByRole("button", { name: "Hiện mật khẩu" }), at: "right" },
      { n: 4, target: page.locator("label").filter({ hasText: "Ghi nhớ đăng nhập" }), at: "left" },
      { n: 5, target: submit },
      { n: 6, target: page.getByRole("button", { name: "Quên mật khẩu?" }), at: "right" },
    ],
  });

  // ── Errors ──────────────────────────────────────────────────────────────────────────────────────────────
  await email.fill("");
  await password.fill("");
  await submit.click();
  await expect(page.getByText("Email không hợp lệ.")).toBeVisible();
  await expect(page.getByText("Vui lòng nhập mật khẩu.")).toBeVisible();
  await shot(page, `${IMG}-bo-trong`, {
    area: form,
    marks: [
      { n: 1, target: page.getByText("Email không hợp lệ."), at: "right", tight: true },
      { n: 2, target: page.getByText("Vui lòng nhập mật khẩu."), at: "right", tight: true },
    ],
  });

  await email.fill(ACCOUNTS.owner);
  await password.fill("matkhausai1");
  await submit.click();
  const wrong = page.getByText("Email hoặc mật khẩu không đúng.");
  await expect(wrong).toBeVisible();
  await shot(page, `${IMG}-sai-mat-khau`, { area: form, marks: [{ n: 1, target: wrong, at: "right" }] });

  await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
  const forgot = page.getByText("Liên hệ quản trị viên để đặt lại mật khẩu.");
  await expect(forgot).toBeVisible();
  await shot(page, `${IMG}-quen-mat-khau`, {
    area: form,
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Quên mật khẩu?" }), at: "right" },
      { n: 2, target: forgot, at: "right" },
    ],
  });

  // ── Sign out: the account menu at the bottom of the sidebar (an editor: no owner-only item) ───────────────
  await login(page, "editor");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const account = page.getByRole("button", { name: /Lê Thu Hà/ });
  await account.click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-dang-xuat`, {
    marks: [
      { n: 1, target: page.locator('[data-sidebar="menu-button"]').filter({ hasText: "Lê Thu Hà" }) },
      { n: 2, target: menu.getByRole("menuitem", { name: "Đăng xuất" }), at: "right" },
    ],
  });
  await menu.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
