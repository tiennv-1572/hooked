import { defineConfig } from "@playwright/test";

// Screenshots of the CMS guide (`/huong-dan`), taken on the local stack only: `pnpm docs:stack up`, then
// `pnpm docs:screenshots` (one page: `pnpm docs:screenshots danh-muc-khoa-hoc`). See docs/huong-dan/WRITING.md,
// "Chụp ảnh".
export default defineConfig({
  globalSetup: "./scripts/huong-dan/shots/global-setup.ts",
  reporter: [["list"]],
  testDir: "./scripts/huong-dan/shots",
  testMatch: "**/*.shot.ts",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  // The scripts write to one shared local database: one at a time keeps every picture predictable.
  workers: 1,
  use: {
    baseURL: process.env.HUONG_DAN_BASE_URL ?? "http://localhost:3101",
    actionTimeout: 15_000,
    channel: "chrome",
    // The CMS follows the system theme until a user picks one: pictures are always the light one.
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "vi-VN",
    // The website's reveals, Lenis scrolling and autoplaying carousels stand still: the same picture every run.
    reducedMotion: "reduce",
    timezoneId: "Asia/Ho_Chi_Minh",
    viewport: { height: 800, width: 1280 },
  },
});
