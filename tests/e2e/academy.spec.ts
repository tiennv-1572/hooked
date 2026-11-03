import { expect, test } from "@playwright/test";

const REGISTRATIONS = "/api/v1/registrations";

test.describe("academy", () => {
  // The form creates real leads (POST /api/v1/registrations → 201): remember them and delete them after each test.
  let createdLeads: Promise<string | null>[] = [];
  test.beforeEach(({ page }) => {
    createdLeads = [];
    page.on("response", (response) => {
      if (response.url().endsWith(REGISTRATIONS) && response.status() === 201) {
        createdLeads.push(
          response
            .json()
            .then((body: { data: { id: string } }) => body.data.id)
            .catch(() => null),
        );
      }
    });
  });
  test.afterEach(async ({ request }) => {
    const ids = (await Promise.all(createdLeads)).filter(Boolean);
    if (!ids.length) return;
    await request.post("/api/admin/auth/login", { data: { email: "admin@hooked.vn", password: "hooked2026" } });
    await request.post("/api/admin/collections/leads/bulk-delete", { data: { ids } });
  });

  test("registration: validation errors → success", async ({ page }) => {
    await page.goto("/academy");
    await page
      .getByRole("button", { name: /Đăng ký ngay/ })
      .filter({ visible: true })
      .first()
      .click();

    const dialog = page.getByRole("dialog", { name: "Đăng ký tư vấn" });
    await expect(dialog).toBeVisible();

    // Error state: required fields.
    await dialog.getByRole("button", { name: "Gửi đăng ký tư vấn" }).click();
    await expect(dialog.getByText("Vui lòng nhập họ và tên.")).toBeVisible();
    await expect(dialog.getByText("Nhập số điện thoại để Hooked liên hệ.")).toBeVisible();

    // Ready → Loading → Success.
    await dialog.getByLabel("Họ và tên *").fill("Nguyễn Văn Test");
    await dialog.getByLabel("Số điện thoại *").fill("0912345678");
    await expect(dialog.getByText("Vui lòng nhập họ và tên.")).toBeHidden();
    await dialog.getByRole("button", { name: "Gửi đăng ký tư vấn" }).click();
    await expect(dialog.getByText("Đã nhận thông tin")).toBeVisible({ timeout: 10_000 });

    await dialog.getByRole("button", { name: "Tiếp tục khám phá Academy" }).click();
    await expect(dialog).toBeHidden();
  });

  test("registration: submitting the form sends it to the API and shows the success state", async ({ page }) => {
    await page.goto("/academy");
    await page
      .getByRole("button", { name: /Đăng ký ngay/ })
      .filter({ visible: true })
      .first()
      .click();

    const dialog = page.getByRole("dialog", { name: "Đăng ký tư vấn" });
    const course = (await dialog.getByRole("button", { name: "Khóa học quan tâm" }).innerText()).trim();
    await dialog.getByLabel("Họ và tên *").fill("Nguyễn Văn E2E");
    await dialog.getByLabel("Số điện thoại *").fill("0912 345 678");
    await dialog.getByLabel("Email (không bắt buộc)").fill("e2e@example.com");

    const [request, response] = await Promise.all([
      page.waitForRequest((req) => req.url().endsWith(REGISTRATIONS) && req.method() === "POST"),
      page.waitForResponse((res) => res.url().endsWith(REGISTRATIONS)),
      dialog.getByRole("button", { name: "Gửi đăng ký tư vấn" }).click(),
    ]);
    expect(request.postDataJSON()).toMatchObject({
      name: "Nguyễn Văn E2E",
      phone: "0912 345 678",
      email: "e2e@example.com",
      source: "Academy · carousel",
      website: "",
    });
    expect(response.status()).toBe(201);
    // The UI upper-cases course names with CSS; the API returns the name as typed in the CMS.
    const data = (await response.json()).data;
    expect(data).toMatchObject({ status: "new" });
    expect(data.course.title.toLocaleUpperCase("vi")).toBe(course.toLocaleUpperCase("vi"));

    const success = dialog.getByRole("status");
    await expect(success).toContainText("Đã nhận thông tin");
    await expect(success).toContainText(course, { ignoreCase: true });
    await dialog.getByRole("button", { name: "Tiếp tục khám phá Academy" }).click();
    await expect(dialog).toBeHidden();
  });

  test("course filter narrows the directory", async ({ page }) => {
    await page.goto("/academy");
    const filters = page.getByRole("group", { name: "Lọc khóa học theo nhóm" });
    await filters.scrollIntoViewIfNeeded();
    const rows = page.getByRole("button", { name: /Xem nội dung khóa học$/ }).filter({ visible: true });
    const all = await rows.count();
    expect(all).toBeGreaterThanOrEqual(7);
    await filters.getByRole("button", { name: /^Flip$/i }).click();
    await expect.poll(() => rows.count()).toBeLessThan(all);
  });

  test("course program modal leads into registration with the course selected", async ({ page }) => {
    await page.goto("/academy");
    const row = page
      .getByRole("button", { name: /Xem nội dung khóa học$/ })
      .filter({ visible: true })
      .first();
    await row.scrollIntoViewIfNeeded();
    await row.click();
    const program = page.getByRole("dialog");
    await expect(program).toBeVisible();
    await program
      .getByRole("button", { name: /Đăng ký/ })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page.getByRole("dialog", { name: "Đăng ký tư vấn" })).toBeVisible();
  });

  test("featured stories link to the student reader", async ({ page }) => {
    await page.goto("/academy");
    const story = page.locator("a[href^='/academy/students?story=']").first();
    await expect(story).toBeAttached();
    const href = await story.getAttribute("href");
    await page.goto(href!);
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
