import { expect, test } from "@playwright/test";

const SECTIONS = [
  { label: "Academy", path: "/academy" },
  { label: "Project", path: "/projects" },
  { label: "Contact", path: "/contact" },
  { label: "About", path: "/about" },
  { label: "Partners", path: "/partners" },
];

test("desktop navigation reaches every section and marks it active", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop bar only renders ≥ 1200px");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  for (const section of SECTIONS) {
    await nav.getByRole("link", { name: section.label, exact: true }).click();
    await expect(page).toHaveURL(section.path);
    await expect(nav.getByRole("link", { name: section.label, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await nav.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL("/");
});

test("mobile menu opens, navigates and closes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "hamburger only renders < 1200px");
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu" }).click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Partners", exact: true }).click();
  await expect(page).toHaveURL("/partners");
  await expect(dialog).toBeHidden();
  await expect(page.locator("header")).toContainText("Partners");

  // Esc closes the menu.
  await page.getByRole("button", { name: "Mở menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
});

test("footer links reach the company pages", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer");
  for (const [label, path] of [
    ["About", "/about"],
    ["Blogpost", "/blog"],
    ["Contact", "/contact"],
  ] as const) {
    await footer.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
  }
  await expect(footer.getByRole("link", { name: "hooked.vie@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:hooked.vie@gmail.com",
  );
});
