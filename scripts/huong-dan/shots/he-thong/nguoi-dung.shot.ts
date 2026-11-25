/**
 * Ảnh của trang "Hệ thống › Người dùng" (content/huong-dan/he-thong/nguoi-dung.mdx).
 * Mời một người dùng mẫu (email @example.com, mật khẩu tạm gõ sẵn để ảnh không đổi giữa các lần chạy), cho người đó
 * đăng nhập lần đầu, đổi vai trò, khóa, mở khóa, đổi mật khẩu, rồi xóa. Các tài khoản seed không bị đụng tới.
 */
import { expect, test, type Page } from "@playwright/test";

import { dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "he-thong/nguoi-dung";
const NAME = "Đỗ Thanh Tú";
const EMAIL = "tu.do@example.com";
/** Typed rather than generated: the picture of the invite and of its message stay the same. */
const TEMPORARY = "hooked-mnpq2468";
const RESET = "hooked-wxyz3579";

test("Người dùng", async ({ browser, page }) => {
  localSql(`delete from users where email = '${EMAIL}'`);

  await login(page);
  await page.goto("/admin/users");
  const row = (name: string) => page.getByRole("row", { name: new RegExp(name) });
  await expect(row("Trần Minh Anh")).toBeVisible();

  // ── The list ─────────────────────────────────────────────────────────────────────────────────────────────
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Mời người dùng" }), at: "below" },
      { n: 2, target: page.getByRole("textbox", { name: "Tìm kiếm" }), at: "below" },
      // The filter (the column title "Vai trò" is a button too).
      { n: 3, target: page.locator('button[data-slot="popover-trigger"]', { hasText: "Vai trò" }), at: "below" },
      { n: 4, target: row("Trần Minh Anh").getByRole("combobox"), at: "right" },
      { n: 5, target: row("Phạm Quốc Huy").getByText("Đã mời", { exact: true }), at: "right" },
      { n: 6, target: row("Phạm Quốc Huy").getByText(/^Mời .* trước$/), at: "right", tight: true },
      { n: 7, target: row("Lê Thu Hà").getByRole("button", { name: "Thao tác" }), at: "left" },
      { n: 8, target: row("Hooked Admin").locator("svg.lucide-lock"), at: "right" },
    ],
  });

  // Your own row: locked, with the reason on hover.
  await row("Hooked Admin").locator("svg.lucide-lock").hover();
  const reason = page.getByRole("tooltip");
  await expect(reason).toContainText("Bạn không thể tự đổi vai trò");
  await shot(page, `${IMG}-cua-ban`, {
    area: row("Hooked Admin"),
    include: [reason],
    marks: [{ n: 1, target: row("Hooked Admin").locator("svg.lucide-lock"), at: "right" }],
    padding: 16,
  });
  await page.mouse.move(0, 0);

  // ── Invite: the messages first, then the sample ─────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Mời người dùng" }).click();
  const invite = dialog(page, "Mời người dùng");
  await invite.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(invite.getByText("Nhập họ tên (ít nhất 2 ký tự).")).toBeVisible();
  await invite.getByLabel("Họ tên").fill(NAME);
  await invite.getByLabel("Email").fill("content@hooked.vn");
  await invite.getByLabel("Email").blur();
  await expect(invite.getByText("Email này đã có trong danh sách người dùng.")).toBeVisible();
  await invite.getByLabel("Email").fill(EMAIL);
  await invite.locator("#invite-password").fill(TEMPORARY);
  // Biên tập is the default role of an invite.
  await expect(invite.getByRole("radio", { checked: true })).toContainText("Biên tập");
  await expect(invite.getByText("Email này đã có trong danh sách người dùng.")).toBeHidden();
  await shot(page, `${IMG}-moi`, {
    area: invite,
    marks: [
      { n: 1, target: invite.getByLabel("Họ tên"), at: "above" },
      { n: 2, target: invite.getByLabel("Email"), at: "above" },
      { n: 3, target: invite.getByRole("radiogroup", { name: "Vai trò" }), at: "left" },
      { n: 4, target: invite.locator("#invite-password"), at: "above" },
      { n: 5, target: invite.getByRole("button", { name: "Tạo mật khẩu khác" }), at: "above" },
      { n: 6, target: invite.getByRole("button", { name: "Sao chép mật khẩu" }), at: "above" },
      { n: 7, target: invite.getByRole("button", { name: "Tạo tài khoản" }), at: "below" },
    ],
    padding: 24,
  });
  await invite.getByRole("button", { name: "Tạo tài khoản" }).click();
  const credentials = page.locator("[data-sonner-toast]").filter({ hasText: `Đã tạo tài khoản cho ${NAME}` });
  await expect(credentials).toBeVisible();
  await expect(row(NAME)).toContainText("Đã mời");
  await shot(page, `${IMG}-moi-xong`, {
    marks: [
      { n: 1, target: credentials.getByRole("button", { name: "Sao chép" }), at: "below" },
      { n: 2, target: row(NAME).getByText("Đã mời", { exact: true }), at: "right" },
    ],
  });
  await credentials.getByRole("button", { name: "Close toast" }).click();
  await noToasts(page);

  // The menu of an invited account.
  await row(NAME).getByRole("button", { name: "Thao tác" }).click();
  const invitedMenu = page.getByRole("menu");
  await shot(page, `${IMG}-thao-tac-da-moi`, {
    area: page.locator("tbody tr").filter({ hasText: NAME }),
    include: [invitedMenu],
    marks: [
      { n: 1, target: invitedMenu.getByRole("menuitem", { name: "Tạo mật khẩu tạm mới" }), at: "left" },
      { n: 2, target: invitedMenu.getByRole("menuitem", { name: "Kích hoạt thủ công" }), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");

  // ── The invited person signs in for the first time: "Đang hoạt động" ────────────────────────────────────
  const theirs = await browser.newContext({ baseURL: test.info().project.use.baseURL, colorScheme: "light" });
  const them = await theirs.newPage();
  await signIn(them, TEMPORARY);
  await expect(them).toHaveURL(/\/admin$/);
  await page.reload();
  await expect(row(NAME)).toContainText("Đang hoạt động");

  // ── Change the role in the list ─────────────────────────────────────────────────────────────────────────
  await row(NAME).getByRole("combobox").click();
  const roles = page.getByRole("listbox");
  await expect(roles).toBeVisible();
  await shot(page, `${IMG}-doi-vai-tro`, {
    area: page.locator("tbody tr").filter({ hasText: NAME }),
    include: [roles],
    marks: [{ n: 1, target: roles.getByRole("option", { name: "Quản trị" }), at: "left" }],
    padding: 16,
  });
  await roles.getByRole("option", { name: "Quản trị" }).click();
  await expect(page.getByText(`${NAME} giờ là Quản trị.`)).toBeVisible();
  await noToasts(page);
  await row(NAME).getByRole("combobox").click();
  await page.getByRole("option", { name: "Biên tập" }).click();
  await noToasts(page);

  // ── The menu of an active account; locking ──────────────────────────────────────────────────────────────
  await row(NAME).getByRole("button", { name: "Thao tác" }).click();
  const activeMenu = page.getByRole("menu");
  await shot(page, `${IMG}-thao-tac`, {
    area: page.locator("tbody tr").filter({ hasText: NAME }),
    include: [activeMenu],
    marks: [
      { n: 1, target: activeMenu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "left" },
      { n: 2, target: activeMenu.getByRole("menuitem", { name: "Đổi mật khẩu" }), at: "left" },
      { n: 3, target: activeMenu.getByRole("menuitem", { name: "Khóa tài khoản" }), at: "left" },
      { n: 4, target: activeMenu.getByRole("menuitem", { name: "Xóa" }), at: "left" },
    ],
  });
  await activeMenu.getByRole("menuitem", { name: "Khóa tài khoản" }).click();
  const lock = dialog(page, `Khóa tài khoản của ${NAME}?`);
  await expect(lock).toBeVisible();
  await shot(page, `${IMG}-khoa`, {
    area: lock,
    marks: [{ n: 1, target: lock.getByRole("button", { name: "Khóa tài khoản" }), at: "below" }],
  });
  await lock.getByRole("button", { name: "Khóa tài khoản" }).click();
  await expect(page.getByText(`Đã khóa tài khoản ${NAME}.`)).toBeVisible();
  await expect(row(NAME)).toContainText("Đã khóa");
  // Their open session ends at once; signing in again is refused.
  await them.goto("/admin/courses");
  await expect(them).toHaveURL(/\/admin\/login/);
  await noToasts(page);
  await row(NAME).getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Mở khóa" }).click();
  await expect(page.getByText(`Đã mở khóa tài khoản ${NAME}.`)).toBeVisible();
  await noToasts(page);

  // ── A new password for someone who forgot theirs ────────────────────────────────────────────────────────
  await row(NAME).getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Đổi mật khẩu" }).click();
  const password = dialog(page, "Đổi mật khẩu");
  await password.getByLabel("Mật khẩu mới", { exact: true }).fill(RESET);
  await password.getByLabel("Nhập lại mật khẩu mới").fill(RESET);
  await password
    .getByRole("button", { name: /Hiện mật khẩu/ })
    .first()
    .click();
  await shot(page, `${IMG}-doi-mat-khau`, {
    area: password,
    marks: [
      { n: 1, target: password.getByLabel("Mật khẩu mới", { exact: true }), at: "above" },
      { n: 2, target: password.getByLabel("Nhập lại mật khẩu mới"), at: "above" },
      { n: 3, target: password.getByText("Hai lần nhập khớp nhau").locator(".."), at: "right" },
      { n: 4, target: password.getByRole("button", { name: "Tạo ngẫu nhiên" }), at: "below" },
      { n: 5, target: password.getByRole("button", { name: "Đổi mật khẩu" }), at: "below" },
    ],
    padding: 24,
  });
  await password.getByRole("button", { name: "Đổi mật khẩu" }).click();
  const changed = page.locator("[data-sonner-toast]").filter({ hasText: `Đã đổi mật khẩu cho ${NAME}.` });
  await expect(changed).toBeVisible();
  await shot(page, `${IMG}-doi-mat-khau-xong`, {
    area: changed,
    marks: [{ n: 1, target: changed.getByRole("button", { name: "Sao chép" }), at: "left" }],
    padding: 24,
  });
  await changed.getByRole("button", { name: "Close toast" }).click();
  await noToasts(page);

  // ── Details ─────────────────────────────────────────────────────────────────────────────────────────────
  await row(NAME)
    .getByRole("button", { name: new RegExp(NAME) })
    .click();
  const sheet = page.getByRole("dialog").filter({ hasText: EMAIL });
  await expect(sheet.getByRole("textbox", { name: /Họ tên/ })).toHaveValue(NAME);
  // The panel focuses (and selects) the first field when it opens.
  await page.evaluate(() => {
    window.getSelection()?.removeAllRanges();
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await shot(page, `${IMG}-chi-tiet`, {
    area: sheet,
    marks: [
      { n: 1, target: sheet.getByRole("textbox", { name: /Họ tên/ }), at: "left" },
      { n: 2, target: sheet.getByRole("textbox", { name: /Email đăng nhập/ }), at: "left" },
      { n: 3, target: sheet.getByRole("radiogroup", { name: "Vai trò" }), at: "left" },
      { n: 4, target: sheet.getByRole("combobox"), at: "left" },
      { n: 5, target: sheet.getByRole("button", { name: "Xóa" }), at: "above" },
      { n: 6, target: sheet.getByRole("button", { name: "Lưu thay đổi" }), at: "above" },
    ],
    padding: 0,
  });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  // ── Delete the sample ───────────────────────────────────────────────────────────────────────────────────
  await row(NAME).getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const remove = dialog(page, `Xóa người dùng ${NAME}?`);
  await expect(remove).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: remove,
    marks: [{ n: 1, target: remove.getByRole("button", { name: "Xóa người dùng" }), at: "below" }],
  });
  await remove.getByRole("button", { name: "Xóa người dùng" }).click();
  await expect(page.getByText(`Đã xóa ${NAME}.`)).toBeVisible();
  expect(localSql(`select count(*) from users where email = '${EMAIL}'`)).toBe("0");
  await theirs.close();
});

async function signIn(page: Page, password: string) {
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}
