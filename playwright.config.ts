import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3300);
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end tests against the production build.
 * Uses the locally installed Google Chrome (`channel: "chrome"`) so no browser download is needed.
 *   pnpm build && pnpm test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1024, height: 768 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `pnpm start -p ${PORT}`,
        url: baseURL,
        // The registration tests submit the form repeatedly: disable the per-IP limiter (5 / 10 min by default).
        env: { REGISTRATION_RATE_LIMIT: "0" },
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
