import { expect, test, type Page } from "@playwright/test";

import { foldVietnamese, tokenizeGuideText } from "../../src/lib/guide/search-tokenizer";

/** Seeded owner (scripts/db-seed.ts). */
const ADMIN = { email: "admin@hooked.vn", password: "hooked2026" };

/** A sentence of content/huong-dan/index.mdx: shown to a signed-in account, and to no one else. */
const CONTENT_MARKER = "Mỗi màn hình trong CMS có một trang hướng dẫn riêng";

/** Sign in on the login page the browser is on, and wait for where it sends us. */
async function signInHere(page: Page) {
  // Wait for hydration + the session probe, otherwise a fast fill can race the form's default values.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email", { exact: true }).fill(ADMIN.email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(ADMIN.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

/** Stylesheets a page loads, concatenated. */
async function cssOf(page: Page, path: string) {
  await page.goto(path);
  const hrefs = await page
    .locator('link[rel="stylesheet"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  const sheets = await Promise.all(hrefs.map(async (href) => (await page.request.get(href)).text()));
  return sheets.join("\n");
}

test.describe("CMS guide (/huong-dan)", () => {
  test("is only for signed-in CMS accounts, and comes back to the page asked for", async ({ page }) => {
    const search = await page.request.get("/api/huong-dan/search?query=cms");
    expect(search.status()).toBe(401);

    await page.goto("/huong-dan");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fhuong-dan$/);
    await signInHere(page);
    await expect(page).toHaveURL(/\/huong-dan$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hướng dẫn sử dụng CMS Hooked" })).toBeVisible();
    await expect(page.getByText(CONTENT_MARKER)).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("a cookie that is not a valid session gets no content", async ({ page, context, baseURL }) => {
    // Gets past the proxy (it only looks for the cookie); every segment then checks the session itself.
    await context.addCookies([{ name: "hooked_admin", value: "not-a-token", url: baseURL! }]);
    await page.goto("/huong-dan");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fhuong-dan$/);
    expect((await page.request.get("/api/huong-dan/search?query=cms")).status()).toBe(401);

    // Neither the page nor its segment alone (Cache Components prefetch) carries the guide's text.
    const full = await page.request.get("/huong-dan", { maxRedirects: 0 });
    expect(await full.text()).not.toContain(CONTENT_MARKER);
    const segment = await page.request.get("/huong-dan", {
      headers: {
        rsc: "1",
        "next-router-prefetch": "1",
        "next-router-segment-prefetch": "/huong-dan/!KGRvY3Mp/$oc$slug/__PAGE__",
      },
      maxRedirects: 0,
    });
    expect(await segment.text()).not.toContain(CONTENT_MARKER);
  });

  test("search finds accented text typed without accents", async ({ page }) => {
    await page.goto("/admin/login");
    await signInHere(page);
    await expect(page).toHaveURL(/\/admin$/);
    for (const query of ["quan tri", "dang nhap", "khoa hoc"]) {
      const response = await page.request.get(`/api/huong-dan/search?query=${encodeURIComponent(query)}`);
      expect(response.status(), query).toBe(200);
      expect((await response.json()).length, query).toBeGreaterThan(0);
    }
  });

  test.describe("from the CMS", () => {
    test.skip(({ isMobile }) => isMobile, "CMS flows are covered on desktop and tablet");

    test("the header opens the guide in a new tab, and the CMS keeps its own styles", async ({ page, context }) => {
      await page.goto("/admin/login");
      await signInHere(page);
      await expect(page).toHaveURL(/\/admin$/);
      const cmsStyle = () =>
        page.evaluate(() => {
          const body = getComputedStyle(document.body);
          const h1 = document.querySelector("h1");
          return {
            background: body.backgroundColor,
            font: body.fontFamily,
            h1: h1 ? getComputedStyle(h1).fontSize : null,
          };
        });
      await expect(page.locator("h1").first()).toBeVisible();
      const before = await cmsStyle();

      const [guide] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: "Hướng dẫn sử dụng" }).click(),
      ]);
      await expect(guide).toHaveURL(/\/huong-dan$/);
      await expect(guide.getByRole("heading", { level: 1, name: "Hướng dẫn sử dụng CMS Hooked" })).toBeVisible();

      // Into the guide and back in the same tab: the CMS looks exactly as before.
      await page.goto("/huong-dan");
      await page.goBack();
      await expect(page.locator("h1").first()).toBeVisible();
      expect(await cmsStyle()).toEqual(before);
    });
  });

  test("the guide's styles reach neither the website nor the CMS", async ({ page }) => {
    for (const path of ["/", "/academy", "/admin/login"]) {
      const css = await cssOf(page, path);
      expect(css, path).not.toContain("--color-fd-");
      expect(css, path).not.toContain("#nd-sidebar");
    }
  });
});

test("guide search folds Vietnamese accents and splits words", () => {
  test.skip(test.info().project.name !== "desktop", "pure functions: once is enough");

  // Every accent and đ folded, so a search typed without them matches.
  expect(foldVietnamese("Quản trị · Đăng nhập · Khóa học · Lưu · Ưu đãi")).toBe(
    "quan tri · dang nhap · khoa hoc · luu · uu dai",
  );
  // Precomposed (NFC) and decomposed (NFD) input end up the same.
  expect(foldVietnamese("trị".normalize("NFD"))).toBe(foldVietnamese("trị".normalize("NFC")));
  // Anything that is not a letter or a digit separates words.
  expect(tokenizeGuideText("Mở trang “Quản trị” — bước 1/3, khóa 2,5 tháng")).toEqual([
    "mo",
    "trang",
    "quan",
    "tri",
    "buoc",
    "1",
    "3",
    "khoa",
    "2",
    "5",
    "thang",
  ]);
});
