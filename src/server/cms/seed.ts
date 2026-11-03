import { sql } from "drizzle-orm";

import type { CollectionKey } from "@/admin/lib/cms/registry";

import { hashPassword } from "../auth/password";
import { getDb } from "../db/client";
import * as schema from "../db/schema";
import { insertItems } from "./repository";
import { collectionSeeds, singletonSeeds } from "./seed-data";

const TABLES = {
  courseCategories: schema.courseCategories,
  courses: schema.courses,
  students: schema.students,
  leads: schema.leads,
  projects: schema.projects,
  projectCategories: schema.projectCategories,
  posts: schema.posts,
  partners: schema.partners,
  media: schema.media,
  users: schema.users,
} as const satisfies Record<CollectionKey, unknown>;

/** Content tables restored by "Khôi phục dữ liệu mẫu" (admin accounts are kept). */
const CONTENT_KEYS: CollectionKey[] = [
  "courseCategories",
  "courses",
  "students",
  "leads",
  "projects",
  "projectCategories",
  "posts",
  "partners",
  "media",
];

type SeedOptions = { reset?: boolean; log?: (line: string) => void };

/** Insert seed data into empty tables; with `reset`, wipe every CMS table first. */
export async function seedDatabase({ reset = false, log = () => {} }: SeedOptions = {}) {
  const db = getDb();
  if (reset) {
    for (const tbl of [...Object.values(TABLES), schema.projectCategoryLinks, schema.singletons]) await db.delete(tbl);
    log("✔ cleared all CMS tables");
  }
  for (const key of Object.keys(TABLES) as CollectionKey[]) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(TABLES[key]);
    if (Number(count) > 0) {
      log(`• ${key}: ${count} rows already — skipped`);
      continue;
    }
    await insertItems(key, collectionSeeds[key] as never);
    log(`✔ ${key}: ${collectionSeeds[key].length} rows`);
  }
  const password = process.env.ADMIN_DEMO_PASSWORD ?? "hooked2026";
  await db
    .update(schema.users)
    .set({ passwordHash: await hashPassword(password) })
    .where(sql`${schema.users.status} <> 'invited' and ${schema.users.passwordHash} is null`);
  for (const [key, value] of Object.entries(singletonSeeds)) {
    await db
      .insert(schema.singletons)
      .values({ key, doc: value as Record<string, unknown>, updatedAt: new Date() })
      .onDuplicateKeyUpdate({ set: { key: sql`${schema.singletons.key}` } });
  }
  log(`✔ singletons: ${Object.keys(singletonSeeds).length} documents (existing ones kept)`);
  return { password };
}

/** Restore website content to the seed (CMS "Khôi phục dữ liệu mẫu"). */
export async function resetContent() {
  const db = getDb();
  for (const key of CONTENT_KEYS) await db.delete(TABLES[key]);
  await db.delete(schema.projectCategoryLinks);
  await db.delete(schema.singletons);
  for (const key of CONTENT_KEYS) await insertItems(key, collectionSeeds[key] as never);
  for (const [key, value] of Object.entries(singletonSeeds)) {
    await db.insert(schema.singletons).values({ key, doc: value as Record<string, unknown>, updatedAt: new Date() });
  }
}
