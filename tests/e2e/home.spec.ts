import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("hero carousel moves to the next slide", async ({ page }, testInfo) => {
    await page.goto("/");
    const hero = page.locator("section[aria-roledescription='carousel']").first();
    if (testInfo.project.name === "desktop") {
      const track = hero.locator(".overflow-hidden > div").first();
      const before = await track.evaluate((element) => getComputedStyle(element).transform);
      await hero.getByRole("button", { name: "Ảnh tiếp theo" }).click();
      await expect.poll(() => track.evaluate((element) => getComputedStyle(element).transform)).not.toBe(before);
    } else {
      await expect(hero.getByText(/01 \/ 05/)).toBeVisible();
      await expect(hero.getByRole("link", { name: "Academy" })).toHaveAttribute("href", "/academy");
      await expect(hero.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    }
  });

  test("blog carousel cycles through posts and wraps", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.locator("#blog-title") });
    const caption = section.locator("h3").first();
    await expect(caption).toHaveText("VUI FEST CÁT BÀ");
    const next = section.getByRole("button", { name: "Bài viết tiếp theo" });
    const seen = new Set<string>();
    for (let step = 0; step < 5; step += 1) {
      seen.add((await caption.textContent()) ?? "");
      await next.click();
      await page.waitForTimeout(500);
    }
    expect(seen.size).toBe(5);
    await expect(caption).toHaveText("VUI FEST CÁT BÀ");
  });

  test("blog center card opens the post", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("section", { has: page.locator("#blog-title") })
      .getByRole("link")
      .first()
      .click();
    await expect(page).toHaveURL("/blog/vui-fest-cat-ba");
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("highlight cards lead to Academy and Projects", async ({ page }) => {
    await page.goto("/");
    const highlight = page.locator("section", { has: page.locator("#highlight-title") });
    await highlight.getByRole("link", { name: /ACADEMY/ }).click();
    await expect(page).toHaveURL("/academy");
    await page.goBack();
    await page
      .locator("section", { has: page.locator("#highlight-title") })
      .getByRole("link", { name: /PROJECTS/ })
      .click();
    await expect(page).toHaveURL("/projects");
  });
});
