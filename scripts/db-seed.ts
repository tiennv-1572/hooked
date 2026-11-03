/**
 * Seed MySQL with the website's current content (src/data → CMS entities).
 *
 *   pnpm db:seed           insert seed data into empty tables (safe to re-run)
 *   pnpm db:reset          wipe all CMS tables, then seed again
 *
 * Admin accounts get the password from ADMIN_DEMO_PASSWORD (default "hooked2026").
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { seedDatabase } = await import("../src/server/cms/seed");
  const { password } = await seedDatabase({ reset: process.argv.includes("--reset"), log: console.log });
  console.log(`\nAdmin login: admin@hooked.vn / ${password}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
