import { asc, desc, eq, inArray, sql } from "drizzle-orm";

import { CmsError } from "@/admin/lib/cms/adapter";
import { autoSlug } from "@/admin/lib/cms/ids";
import {
  collectionMeta,
  type CollectionKey,
  type CollectionMap,
  type NewItem,
  type SingletonKey,
  type SingletonMap,
} from "@/admin/lib/cms/registry";

import { getDb } from "../db/client";
import * as schema from "../db/schema";
import { codecs, defaultFromRow, toDoc } from "./codecs";
import { singletonSeeds } from "./seed-data";

/*
 * Server-side CMS repository (MySQL via Drizzle). Same semantics as the browser `localAdapter`:
 * the admin HTTP API wraps these functions 1:1, and the public content services read through them.
 */

type AnyTable = (typeof codecs)[CollectionKey]["table"] & {
  id: never;
  createdAt: never;
  sortOrder?: never;
};

function table(key: CollectionKey) {
  return codecs[key].table as unknown as AnyTable;
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function fromRow<K extends CollectionKey>(key: K, row: Record<string, unknown>) {
  const codec = codecs[key];
  return (codec.fromRow ?? defaultFromRow<K>)(row as never) as CollectionMap[K];
}

function friendly(error: unknown): never {
  const code =
    (error as { code?: string; cause?: { code?: string } })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  if (code === "ER_DUP_ENTRY")
    throw new CmsError("Giá trị đã tồn tại (đường dẫn/slug hoặc email bị trùng).", "conflict");
  throw error;
}

async function syncProjectCategories(projectId: string, categoryIds: string[] | undefined) {
  const db = getDb();
  await db.delete(schema.projectCategoryLinks).where(eq(schema.projectCategoryLinks.projectId, projectId));
  const unique = [...new Set(categoryIds ?? [])];
  if (unique.length) {
    await db.insert(schema.projectCategoryLinks).values(unique.map((categoryId) => ({ projectId, categoryId })));
  }
}

// ---------------------------------------------------------------------------------------------------------
// Collections

export async function listItems<K extends CollectionKey>(key: K): Promise<CollectionMap[K][]> {
  const tbl = table(key);
  const order = codecs[key].ordered
    ? [asc((tbl as unknown as { sortOrder: never }).sortOrder), asc(tbl.createdAt)]
    : [desc(tbl.createdAt)];
  const rows = await getDb()
    .select()
    .from(tbl as never)
    .orderBy(...order);
  return rows.map((row) => fromRow(key, row as Record<string, unknown>));
}

export async function getItem<K extends CollectionKey>(key: K, id: string): Promise<CollectionMap[K] | null> {
  const tbl = table(key);
  const [row] = await getDb()
    .select()
    .from(tbl as never)
    .where(eq(tbl.id, id))
    .limit(1);
  return row ? fromRow(key, row as Record<string, unknown>) : null;
}

/** Insert items as-is (keeps ids/timestamps) — used by the seed. */
export async function insertItems<K extends CollectionKey>(key: K, items: CollectionMap[K][]) {
  if (!items.length) return;
  const codec = codecs[key];
  const rows = items.map((item) => {
    const entity = item as unknown as Record<string, unknown>;
    return {
      id: item.id,
      ...codec.columns(item),
      ...(codec.hasDoc === false ? {} : { doc: toDoc(entity) }),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    };
  });
  for (let i = 0; i < rows.length; i += 200) {
    await getDb()
      .insert(table(key) as never)
      .values(rows.slice(i, i + 200) as never);
  }
  if (key === "projects") {
    for (const item of items as CollectionMap["projects"][]) await syncProjectCategories(item.id, item.categoryIds);
  }
}

export async function createItem<K extends CollectionKey>(key: K, data: NewItem<K>): Promise<CollectionMap[K]> {
  const codec = codecs[key];
  const id = data.id?.trim() || newId(key.slice(0, 4));
  if (await getItem(key, id)) throw new CmsError(`ID "${id}" đã tồn tại.`, "conflict");
  let order: number | undefined;
  if (collectionMeta[key].ordered) {
    const given = (data as { order?: number }).order;
    if (given !== undefined && given !== Number.MAX_SAFE_INTEGER) order = given;
    else {
      const tbl = table(key) as unknown as { sortOrder: never };
      const [{ max }] = await getDb()
        .select({ max: sql<number>`coalesce(max(${tbl.sortOrder}), -1)` })
        .from(tbl as never);
      order = Number(max) + 1;
    }
  }
  const now = new Date();
  const meta = collectionMeta[key];
  const fields = data as Record<string, unknown>;
  const slug =
    meta.autoSlug && !String(fields.slug ?? "").trim()
      ? autoSlug(
          String(fields[meta.titleField] ?? ""),
          (await listItems(key)).map((item) => String((item as { slug?: string }).slug ?? "")),
          key.slice(0, -1),
        )
      : undefined;
  const entity = {
    ...fields,
    ...(slug ? { slug } : {}),
    ...(order === undefined ? {} : { order }),
    id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  } as unknown as CollectionMap[K];
  try {
    await getDb()
      .insert(table(key) as never)
      .values({
        id,
        ...codec.columns(entity),
        ...(codec.hasDoc === false ? {} : { doc: toDoc(entity as unknown as Record<string, unknown>) }),
        createdAt: now,
        updatedAt: now,
      } as never);
  } catch (error) {
    friendly(error);
  }
  if (key === "projects") await syncProjectCategories(id, (entity as unknown as CollectionMap["projects"]).categoryIds);
  return entity;
}

export async function updateItem<K extends CollectionKey>(
  key: K,
  id: string,
  patch: Partial<CollectionMap[K]>,
): Promise<CollectionMap[K]> {
  const current = await getItem(key, id);
  if (!current) throw new CmsError("Không tìm thấy nội dung cần cập nhật.", "not_found");
  const now = new Date();
  const next = {
    ...current,
    ...patch,
    id,
    createdAt: current.createdAt,
    updatedAt: now.toISOString(),
  } as CollectionMap[K];
  const codec = codecs[key];
  const tbl = table(key);
  try {
    await getDb()
      .update(tbl as never)
      .set({
        ...codec.columns(next),
        ...(codec.hasDoc === false ? {} : { doc: toDoc(next as unknown as Record<string, unknown>) }),
        updatedAt: now,
      } as never)
      .where(eq(tbl.id, id));
  } catch (error) {
    friendly(error);
  }
  if (key === "projects") await syncProjectCategories(id, (next as unknown as CollectionMap["projects"]).categoryIds);
  return next;
}

export async function removeItems<K extends CollectionKey>(key: K, ids: string[]) {
  if (!ids.length) return;
  const tbl = table(key);
  await getDb()
    .delete(tbl as never)
    .where(inArray(tbl.id, ids));
  if (key === "projects")
    await getDb().delete(schema.projectCategoryLinks).where(inArray(schema.projectCategoryLinks.projectId, ids));
  if (key === "projectCategories")
    await getDb().delete(schema.projectCategoryLinks).where(inArray(schema.projectCategoryLinks.categoryId, ids));
}

export async function reorderItems<K extends CollectionKey>(key: K, orderedIds: string[]) {
  if (!collectionMeta[key].ordered) throw new CmsError("Danh sách này không hỗ trợ sắp xếp.", "invalid");
  const tbl = table(key) as unknown as AnyTable & { sortOrder: never };
  const db = getDb();
  await db.transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx
        .update(tbl as never)
        .set({
          sortOrder: index,
          doc: sql`json_set(${(tbl as unknown as { doc: never }).doc}, '$.order', ${index})`,
        } as never)
        .where(eq(tbl.id, id));
    }
  });
}

// ---------------------------------------------------------------------------------------------------------
// Singletons

export async function getSingleton<S extends SingletonKey>(key: S): Promise<SingletonMap[S]> {
  const [row] = await getDb().select().from(schema.singletons).where(eq(schema.singletons.key, key)).limit(1);
  return (row?.doc as SingletonMap[S] | undefined) ?? structuredClone(singletonSeeds[key]);
}

export async function saveSingleton<S extends SingletonKey>(key: S, value: SingletonMap[S]) {
  const now = new Date();
  await getDb()
    .insert(schema.singletons)
    .values({ key, doc: value as Record<string, unknown>, updatedAt: now })
    .onDuplicateKeyUpdate({ set: { doc: value as Record<string, unknown>, updatedAt: now } });
  return value;
}

/** Last update time of a singleton (for "Cập nhật lúc…"). */
export async function singletonUpdatedAt(key: SingletonKey) {
  const [row] = await getDb()
    .select({ updatedAt: schema.singletons.updatedAt })
    .from(schema.singletons)
    .where(eq(schema.singletons.key, key))
    .limit(1);
  return row?.updatedAt ?? null;
}
