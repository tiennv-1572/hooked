import { expect, test, type Page } from "@playwright/test";

/** Every CMS screen reachable from the sidebar (+ create forms). */
const ADMIN_ROUTES = [
  "/admin",
  "/admin/leads",
  "/admin/pages/home",
  "/admin/course-categories",
  "/admin/courses",
  "/admin/courses/new",
  "/admin/students",
  "/admin/students/new",
  "/admin/projects",
  "/admin/projects/new",
  "/admin/project-categories",
  "/admin/project-layout",
  "/admin/posts",
  "/admin/posts/new",
  "/admin/partners",
  "/admin/partners/new",
  "/admin/pages/academy",
  "/admin/pages/students",
  "/admin/pages/projects",
  "/admin/pages/blog",
  "/admin/pages/about",
  "/admin/pages/contact",
  "/admin/pages/partners",
  "/admin/media",
  "/admin/navigation",
  "/admin/settings",
  "/admin/users",
  "/admin/account",
];

/** Seeded owner (scripts/db-seed.ts). The production build does not prefill the form. */
const ADMIN = { email: "admin@hooked.vn", password: "hooked2026" };

async function signIn(page: Page, { email, password } = ADMIN) {
  await page.goto("/admin/login");
  // Wait for hydration + the session probe, otherwise a fast fill can race the form's default values.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("admin CMS", () => {
  test.skip(({ isMobile }) => isMobile, "CMS flows are covered on desktop and tablet");

  test("redirects to login and rejects a wrong password", async ({ page }) => {
    await page.goto("/admin/courses");
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
    await page.getByLabel("Email", { exact: true }).fill(ADMIN.email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill("sai-mat-khau");
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.getByText("Email hoặc mật khẩu không đúng.")).toBeVisible();
    await page.getByLabel("Mật khẩu", { exact: true }).fill(ADMIN.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page).toHaveURL(/\/admin\/courses$/);
  });

  test("every CMS screen renders without errors", async ({ page }) => {
    test.setTimeout(240_000);
    const problems: string[] = [];
    page.on("pageerror", (error) => problems.push(`${page.url()} pageerror: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") problems.push(`${page.url()} console: ${message.text()}`);
    });
    await signIn(page);
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await expect(page.locator("h1").first(), route).toBeVisible({ timeout: 15_000 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${route}`).toBeLessThanOrEqual(0);
    }
    expect(problems).toEqual([]);
  });

  test("partners: create with a logo from the media library, then delete", async ({ page }, testInfo) => {
    // Unique per run/project: the database is shared by the parallel desktop and tablet runs.
    const name = `Đối tác kiểm thử ${testInfo.project.name} ${Date.now()}`;
    await signIn(page);
    await page.goto("/admin/partners/new");
    await page.getByLabel("Tên đối tác").fill(name);
    await page.getByRole("button", { name: "Chọn hoặc tải ảnh lên" }).click();
    const picker = page.getByRole("dialog", { name: "Chọn một ảnh" });
    await picker.getByPlaceholder("Tìm theo tên…").fill("weeknd");
    await picker
      .getByRole("button", { name: /weeknd/i })
      .first()
      .click();
    await picker.getByRole("button", { name: "Chọn ảnh" }).click();
    await page.getByRole("button", { name: "Tạo mới" }).click();
    await expect(page).toHaveURL(/\/admin\/partners\/(?!new)[\w-]+$/);

    await page.goto("/admin/partners");
    const row = page.getByRole("row", { name: new RegExp(name) });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Thao tác" }).click();
    await page.getByRole("menuitem", { name: "Xóa" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xóa" }).click();
    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  });

  test("students: story rich text is saved from the editor and sanitized for the site", async ({ page }, testInfo) => {
    // One student per project: the database is shared by the parallel desktop and tablet runs.
    const id = testInfo.project.name === "tablet" ? "t14" : "tobi";
    await signIn(page);
    const item = `/api/admin/collections/students/${id}`;
    const original = ((await (await page.request.get(item)).json()) as { data: { story: string } }).data.story;
    const publicStory = async () =>
      ((await (await page.request.get(`/api/v1/students/${id}`)).json()) as { data: { story: string } }).data.story;

    try {
      await page.request.patch(item, {
        data: {
          story:
            '<p>A <a href="javascript:alert(1)">x</a> <a href="https://example.com">y</a></p>' +
            '<script>alert(1)</script><img src=x onerror=alert(1)><p onclick="x()">z</p><p></p>',
        },
      });
      expect(await publicStory()).toBe(
        '<p>A <a>x</a> <a href="https://example.com" target="_blank" rel="noopener noreferrer">y</a></p><p>z</p>',
      );

      await page.request.patch(item, { data: { story: original } });
      await page.goto(`/admin/students/${id}`);
      const editor = page.locator(".ProseMirror");
      await expect(editor).toContainText(/\S/);
      await editor.click();
      await page.keyboard.press("ControlOrMeta+End");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Đậm (Ctrl+B)" }).click();
      await page.keyboard.type("Resident DJ");
      await page.getByRole("button", { name: "Đậm (Ctrl+B)" }).click();
      await page.keyboard.type(" tại NOXX");
      const saved = page.waitForResponse(
        (response) => response.url().endsWith(item) && response.request().method() === "PATCH",
      );
      await page.getByRole("button", { name: /^Lưu thay đổi/ }).click();
      expect((await saved).ok()).toBe(true);
      expect(await publicStory()).toContain("<p><strong>Resident DJ</strong> tại NOXX</p>");
    } finally {
      await page.request.patch(item, { data: { story: original } });
    }
  });

  test("project layout: a project can fill a second cell and reaches the public page", async ({ page }, testInfo) => {
    // Both projects write the same singleton: run once.
    test.skip(testInfo.project.name !== "desktop", "Shared singleton, desktop only");
    await signIn(page);
    const singleton = "/api/admin/singletons/projectsLayout";
    const original = ((await (await page.request.get(singleton)).json()) as { data: unknown }).data;
    type Cell = { format: string; projectId: string };
    const cardLayout = async () =>
      ((await (await page.request.get("/api/v1/pages/projects")).json()) as { data: { cardLayout: Cell[] } }).data
        .cardLayout;
    const before = await cardLayout();
    const devoidCards = page.locator("main li a[href='/projects/devoid-music-festival']");

    try {
      await page.goto("/admin/project-layout");
      await page.getByRole("button", { name: "Thêm ô" }).click();
      await page.getByRole("menuitem", { name: /Compact/ }).click();
      const cell = before.length + 1;
      await page.getByRole("combobox", { name: `Dự án ô ${cell}` }).click();
      await page.getByRole("option", { name: /Devoid Music Festival/ }).click();
      const saved = page.waitForResponse(
        (response) => response.url().endsWith(singleton) && response.request().method() === "PUT",
      );
      await page.getByRole("button", { name: /^Lưu thay đổi/ }).click();
      expect((await saved).ok()).toBe(true);
      expect(await cardLayout()).toEqual([...before, { format: "compact", projectId: "devoid-music-festival" }]);

      await page.goto("/projects");
      await expect(devoidCards).toHaveCount(2);
    } finally {
      await page.request.put(singleton, { data: original });
    }
  });

  test("users: invite with a temporary password, first sign-in activates, then delete", async ({
    page,
    browser,
  }, testInfo) => {
    const stamp = `${testInfo.project.name}-${Date.now()}`;
    const name = `Kiểm thử ${stamp}`;
    const email = `e2e-${stamp}@hooked.vn`;
    await signIn(page);
    await page.goto("/admin/users");
    await page.getByRole("button", { name: "Mời người dùng" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Mời người dùng" });
    await dialog.getByLabel("Họ tên").fill(name);
    await dialog.getByPlaceholder("ten@hooked.vn").fill(email);
    const password = await dialog.getByLabel("Mật khẩu tạm").inputValue();
    expect(password).toMatch(/^hooked-[a-z]{4}\d{4}$/);
    await dialog.getByRole("button", { name: "Tạo tài khoản" }).click();
    const row = page.getByRole("row", { name: new RegExp(email) });
    await expect(row).toContainText("Đã mời");

    // The invitee signs in on another device → account becomes active.
    const invitee = await browser.newContext();
    const inviteePage = await invitee.newPage();
    await signIn(inviteePage, { email, password });
    await invitee.close();

    await page.reload();
    await expect(row).toContainText("Đang hoạt động");
    // The list can refetch while the menu is open (shared database, parallel projects) — retry the open + click.
    await expect(async () => {
      await row.getByRole("button", { name: "Thao tác" }).click();
      await page.getByRole("menuitem", { name: "Xóa" }).click({ timeout: 2_000 });
    }).toPass();
    await page.getByRole("alertdialog").getByRole("button", { name: "Xóa người dùng" }).click();
    await expect(page.getByRole("row", { name: new RegExp(email) })).toHaveCount(0);
  });

  test("sign-out ends the server session", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: /Hooked Admin/ }).click();
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
    const me = await page.request.get("/api/admin/auth/me");
    expect((await me.json()).user).toBeNull();
    await page.goto("/admin/courses");
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
  });

  test("editor validates required fields and warns about unsaved changes", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/partners/new");
    await page.getByRole("button", { name: "Tạo mới" }).click();
    await expect(page.getByText("Nhập tên đối tác.")).toBeVisible();
    await expect(page.getByText("Chọn logo.")).toBeVisible();
  });

  test("command palette navigates and the theme switches to dark", async ({ page }) => {
    await signIn(page);
    // The ⌘K listener is attached once the panel has mounted.
    await expect(page.getByRole("button", { name: /Tìm kiếm/ })).toBeVisible();
    await page.keyboard.press("ControlOrMeta+k");
    const palette = page.getByRole("dialog", { name: "Tìm kiếm" });
    await expect(palette).toBeVisible();
    await palette.getByPlaceholder(/Tìm trang/).fill("thư viện");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/admin\/media$/);

    await page.getByRole("button", { name: "Giao diện" }).click();
    await page.getByRole("menuitem", { name: "Tối", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
