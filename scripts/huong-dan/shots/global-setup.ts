/**
 * Refuses to take screenshots anywhere but the local stack (scripts/huong-dan/stack.sh): the scripts create, edit and
 * delete rows, and registrations must already be sample people (scripts/huong-dan/prepare-db.ts).
 */
import type { FullConfig } from "@playwright/test";

import { localSql } from "./kit";

/** Registrations whose e-mail is not a sample one. Must be 0. */
const REAL_EMAILS_SQL = "select count(*) from leads where coalesce(email, '') <> '' and email not like '%@example.com'";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "";
  if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baseURL)) {
    throw new Error(`Chỉ chụp trên máy (stack.sh), không chụp trên ${baseURL}.`);
  }

  let realEmails: string;
  try {
    realEmails = localSql(REAL_EMAILS_SQL);
  } catch {
    throw new Error("Chưa chạy DB chụp ảnh. Chạy: pnpm docs:stack up");
  }
  if (realEmails !== "0") {
    throw new Error(`DB chụp ảnh còn ${realEmails} email không phải dữ liệu mẫu. Chạy lại: pnpm docs:stack db`);
  }

  const response = await fetch(`${baseURL}/admin/login`).catch(() => null);
  if (!response?.ok) throw new Error(`Site chụp ảnh chưa chạy ở ${baseURL}. Chạy: pnpm docs:stack web`);
}
