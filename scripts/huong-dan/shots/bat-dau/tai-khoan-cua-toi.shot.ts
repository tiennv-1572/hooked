/**
 * Ảnh của trang "Bắt đầu › Tài khoản của tôi" (content/huong-dan/bat-dau/tai-khoan-cua-toi.mdx).
 * Đổi mật khẩu thật trên tài khoản Biên tập (content@hooked.vn) rồi đổi lại; hồ sơ chỉ sửa thử rồi Hoàn tác.
 */
import { expect, test, type Page } from "@playwright/test";

import { ACCOUNTS, card, container, localSql, login, noToasts, shot } from "../kit";

const IMG = "bat-dau/tai-khoan-cua-toi";
const SEEDED = "hooked2026";
const NEW_PASSWORD = "Hooked2027";

/** The editor's password back to the seeded one (a run that failed half-way may have left the new one). */
function resetEditorPassword() {
  localSql(
    "update users u join (select password_hash from users where email = 'admin@hooked.vn') o " +
      `set u.password_hash = o.password_hash where u.email = '${ACCOUNTS.editor}'`,
  );
}

async function changePassword(page: Page, current: string, next: string, confirm = next) {
  await page.getByLabel("Mật khẩu hiện tại").fill(current);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(next);
  await page.getByLabel("Nhập lại mật khẩu mới").fill(confirm);
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
}

test("Tài khoản của tôi", async ({ page }) => {
  resetEditorPassword();

  // ── Opening it: the account menu ────────────────────────────────────────────────────────────────────────
  await login(page);
  await expect(page.getByRole("heading", { name: /^Chào buổi/ })).toBeVisible();
  const account = page.locator('[data-sidebar="menu-button"]').filter({ hasText: ACCOUNTS.owner });
  await account.click();
  const menu = page.getByRole("menu");
  await shot(page, `${IMG}-mo`, {
    marks: [
      { n: 1, target: account },
      { n: 2, target: menu.getByRole("menuitem", { name: "Tài khoản của tôi" }), at: "right" },
    ],
  });
  await menu.getByRole("menuitem", { name: "Tài khoản của tôi" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tài khoản của tôi" })).toBeVisible();

  // ── The whole page ──────────────────────────────────────────────────────────────────────────────────────
  const section = (title: string) => card(page.locator('[data-slot="card-title"]').filter({ hasText: title }));
  await shot(page, `${IMG}-tong-the`, {
    fitHeight: true,
    marks: [
      { n: 1, target: section("Hồ sơ") },
      { n: 2, target: section("Đổi mật khẩu") },
      { n: 3, target: section("Giao diện") },
      { n: 4, target: section("Dữ liệu") },
      { n: 5, target: section("Phiên đăng nhập") },
    ],
  });

  // ── Profile: edited, then put back with Hoàn tác ────────────────────────────────────────────────────────
  const profile = section("Hồ sơ");
  await profile.getByLabel("Họ tên").fill("Hooked Admin Team");
  await shot(page, `${IMG}-ho-so`, {
    area: profile,
    marks: [
      { n: 1, target: profile.getByLabel("Họ tên") },
      { n: 2, target: profile.getByLabel("Email đăng nhập") },
      { n: 3, target: profile.getByRole("button", { name: "Hoàn tác" }), at: "below" },
      { n: 4, target: profile.getByRole("button", { name: "Lưu hồ sơ" }), at: "below" },
    ],
  });
  await profile.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(profile.getByLabel("Họ tên")).toHaveValue("Hooked Admin");

  // ── Preferences, data, session ──────────────────────────────────────────────────────────────────────────
  const prefs = section("Giao diện");
  await shot(page, `${IMG}-giao-dien`, {
    area: prefs,
    marks: [
      { n: 1, target: prefs.getByRole("group", { name: "Chế độ hiển thị" }) },
      { n: 2, target: prefs.getByRole("group", { name: "Màu chủ đạo" }) },
      { n: 3, target: prefs.getByRole("group", { name: "Độ rộng nội dung" }) },
    ],
  });
  await shot(page, `${IMG}-du-lieu-phien`, {
    area: container(page, section("Dữ liệu"), section("Phiên đăng nhập")),
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Khôi phục dữ liệu mẫu" }), at: "below" },
      { n: 2, target: section("Phiên đăng nhập").getByRole("button", { name: "Đăng xuất" }), at: "below" },
    ],
  });

  // ── Password, on the editor's account (changed, then changed back) ──────────────────────────────────────
  await page.context().clearCookies();
  await login(page, "editor");
  await page.goto("/admin/account");
  const password = section("Đổi mật khẩu");
  await expect(password).toBeVisible();

  await changePassword(page, "matkhausai1", NEW_PASSWORD);
  await expect(password.getByText("Mật khẩu hiện tại không đúng.")).toBeVisible();
  await shot(page, `${IMG}-sai-mat-khau-hien-tai`, {
    area: password,
    marks: [{ n: 1, target: password.getByText("Mật khẩu hiện tại không đúng."), at: "right", tight: true }],
  });

  await changePassword(page, SEEDED, "abc123", "abc124");
  await expect(password.getByText("Mật khẩu mới chưa đạt: ít nhất 8 ký tự.")).toBeVisible();
  await expect(password.getByText("Mật khẩu xác nhận không khớp.")).toBeVisible();
  await shot(page, `${IMG}-mat-khau-chua-dat`, {
    area: password,
    marks: [
      { n: 1, target: password.getByLabel("Mật khẩu mới", { exact: true }) },
      { n: 2, target: password.getByLabel("Nhập lại mật khẩu mới") },
    ],
  });

  await password.getByLabel("Mật khẩu hiện tại").fill(SEEDED);
  await password.getByLabel("Mật khẩu mới", { exact: true }).fill(NEW_PASSWORD);
  await password.getByLabel("Nhập lại mật khẩu mới").fill(NEW_PASSWORD);
  await expect(password.getByText("Mật khẩu mới chưa đạt: ít nhất 8 ký tự.")).toBeHidden();
  await shot(page, `${IMG}-doi-mat-khau`, {
    area: password,
    marks: [
      { n: 1, target: password.getByLabel("Mật khẩu hiện tại") },
      { n: 2, target: password.getByLabel("Mật khẩu mới", { exact: true }) },
      { n: 3, target: password.getByLabel("Nhập lại mật khẩu mới") },
      { n: 4, target: password.getByRole("list") },
      { n: 5, target: password.getByRole("button", { name: "Đổi mật khẩu" }), at: "left" },
    ],
  });
  await password.getByRole("button", { name: "Đổi mật khẩu" }).click();
  const done = page.locator("[data-sonner-toast]").filter({ hasText: "Đã đổi mật khẩu." });
  await expect(done).toBeVisible();
  await shot(page, `${IMG}-da-doi`, { area: done, padding: 12 });
  await noToasts(page);

  // The new password works, then back to the seeded one.
  await page.context().clearCookies();
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email", { exact: true }).fill(ACCOUNTS.editor);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/admin$/);
  await page.goto("/admin/account");
  await changePassword(page, NEW_PASSWORD, SEEDED);
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "Đã đổi mật khẩu." })).toBeVisible();
  resetEditorPassword();
});
