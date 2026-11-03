import { expect, test } from "@playwright/test";

test.describe("projects", () => {
  test("filters narrow the gallery and sync with the URL", async ({ page }) => {
    await page.goto("/projects");
    const filters = page.getByRole("group", { name: "Lọc dự án theo dịch vụ" });
    await expect(filters.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "true");

    await filters.getByRole("button", { name: "Media", exact: true }).click();
    await expect(filters.getByRole("button", { name: "Media", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/service=/);
    await expect(page.locator("main a[href^='/projects/']").first()).toBeVisible();
  });

  test("a service link from Home preselects a filter", async ({ page }) => {
    await page.goto("/projects?service=event");
    const filters = page.getByRole("group", { name: "Lọc dự án theo dịch vụ" });
    await expect(filters.getByRole("button", { name: "Tất cả" })).toHaveAttribute("aria-pressed", "false");
  });

  test("project cards open their detail page", async ({ page }) => {
    await page.goto("/projects");
    const href = await page.locator("main a[href^='/projects/']").first().getAttribute("href");
    await page.locator(`main a[href='${href}']`).first().click();
    await expect(page).toHaveURL(href!);
    await expect(page.getByRole("link", { name: /Tất cả dự án/ }).first()).toBeVisible();
  });
});

test.describe("project detail", () => {
  test("photo lightbox navigates with buttons and keys, closes with Esc", async ({ page }) => {
    await page.goto("/projects/devoid-music-festival");
    const zoom = page.getByRole("button", { name: /^Phóng to ảnh/ }).first();
    await zoom.scrollIntoViewIfNeeded();
    await zoom.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const title = await dialog.getAttribute("aria-labelledby").then((id) => page.locator(`[id='${id}']`).textContent());
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => page.locator(`[id='${await dialog.getAttribute("aria-labelledby")}']`).textContent())
      .not.toBe(title);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("video lightbox embeds YouTube only after opening", async ({ page }) => {
    await page.goto("/projects/devoid-music-festival");
    await expect(page.locator("iframe[src*='youtube']")).toHaveCount(0);
    const play = page.getByRole("button", { name: /^(Phát|Xem) video/ }).first();
    await play.scrollIntoViewIfNeeded();
    await play.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // The dialog first shows the poster; the iframe is mounted only after pressing play inside it.
    await expect(dialog.locator("iframe")).toHaveCount(0);
    await dialog.getByRole("button", { name: /^Phát video/ }).click();
    await expect(dialog.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\//);
    // Focus now lives in the cross-origin player (it swallows Esc), so close with the button.
    await dialog.getByRole("button", { name: /^Đóng/ }).first().click();
    await expect(dialog).toBeHidden();
    await expect(page.locator("iframe[src*='youtube']")).toHaveCount(0);
  });

  test("back link returns to the overview", async ({ page }) => {
    await page.goto("/projects/xom-huc");
    await page
      .getByRole("link", { name: /Tất cả dự án/ })
      .filter({ visible: true })
      .first()
      .click();
    await expect(page).toHaveURL("/projects");
  });
});

test.describe("student stories", () => {
  test("opening a story card shows the reader and updates the URL", async ({ page }) => {
    await page.goto("/academy/students");
    await page
      .getByRole("link", { name: /Xem câu chuyện của/ })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\?story=/);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/\?story=/);
  });

  test("deep link opens the matching reader", async ({ page }) => {
    await page.goto("/academy/students?story=kimmy");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/KIMMY/i);
  });
});

test.describe("blog", () => {
  test("index lists the posts and opens one", async ({ page }) => {
    await page.goto("/blog");
    const posts = page.locator("main a[href^='/blog/']");
    await expect(posts.first()).toBeVisible();
    expect(await posts.count()).toBeGreaterThanOrEqual(3);
    const href = await posts.first().getAttribute("href");
    await posts.first().click();
    await expect(page).toHaveURL(href!);
    await page
      .getByRole("link", { name: /Blogpost/ })
      .first()
      .click();
    await expect(page).toHaveURL("/blog");
  });
});

test.describe("contact & partners", () => {
  test("contact exposes mailto and tel links", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("main a[href='mailto:hooked.vie@gmail.com']").first()).toBeVisible();
    await expect(page.locator("main a[href^='tel:']").first()).toBeAttached();
  });

  test("partner collaborations link to project pages", async ({ page }) => {
    await page.goto("/partners");
    await expect(page.locator("main a[href^='/projects/']").first()).toBeVisible();
  });
});
