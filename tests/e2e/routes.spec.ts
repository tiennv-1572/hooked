import { expect, test } from "@playwright/test";

/** Every page of the site. Keep in sync with src/app. */
export const ROUTES = [
  "/",
  "/academy",
  "/academy/students",
  "/projects",
  "/projects/devoid-music-festival",
  "/projects/spin-awards",
  "/projects/xom-huc",
  "/projects/frequency-arena",
  "/projects/vui-fest-cat-ba",
  "/about",
  "/blog",
  "/blog/vui-fest-cat-ba",
  "/blog/he-sinh-thai-hooked",
  "/blog/spin-awards-xom-huc",
  "/contact",
  "/partners",
];

for (const route of ROUTES) {
  test.describe(`page ${route}`, () => {
    test("renders without errors, overflow or broken links", async ({ page, request }) => {
      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(`console: ${message.text()}`);
      });
      page.on("response", (response) => {
        const url = new URL(response.url());
        // External embeds (YouTube…) are out of our control.
        if (url.origin === new URL(page.url() || "http://localhost").origin && response.status() >= 400) {
          problems.push(`${response.status()} ${url.pathname}`);
        }
      });

      const response = await page.goto(route, { waitUntil: "networkidle" });
      expect(response?.status(), "HTTP status").toBeLessThan(400);

      // Exactly one page title (h1) and a visible main landmark.
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("h1").first()).toBeAttached();

      // Lazy content: scroll through the whole page.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 40));
        }
      });

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(0);

      // Every internal link on the page must resolve.
      const hrefs = await page.$$eval("a[href^='/']", (links) =>
        Array.from(new Set(links.map((link) => link.getAttribute("href")!.split("#")[0]))).filter(Boolean),
      );
      for (const href of hrefs) {
        const linked = await request.get(href);
        expect(linked.status(), `link ${href} on ${route}`).toBeLessThan(400);
      }

      expect(problems, "console errors / failed requests").toEqual([]);
    });
  });
}

test("unknown routes show the 404 page", async ({ page }) => {
  const response = await page.goto("/khong-ton-tai");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Trang này không tồn tại" })).toBeVisible();
  await page.getByRole("link", { name: /Về trang chủ/ }).click();
  await expect(page).toHaveURL("/");
});
