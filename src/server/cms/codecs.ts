import type { MySqlTable } from "drizzle-orm/mysql-core";

import type { CollectionKey, CollectionMap } from "@/admin/lib/cms/registry";

import * as t from "../db/schema";

/*
 * Entity ⇄ row mapping for every CMS collection.
 * `doc` stores the whole entity (minus id/timestamps); relational columns are derived from it on write.
 */

type Row = Record<string, unknown> & { id: string; createdAt: Date; updatedAt: Date; doc?: Record<string, unknown> };

export type Codec<K extends CollectionKey> = {
  table: MySqlTable & Record<string, unknown>;
  /** Columns written on insert/update (besides id/doc/timestamps). */
  columns: (entity: CollectionMap[K]) => Record<string, unknown>;
  /** Sort: ordered collections by sort_order, others newest first. */
  ordered: boolean;
  /** Row → entity (default: doc + id + ISO timestamps). */
  fromRow?: (row: Row) => CollectionMap[K];
  /** Keep `doc` (false for tables whose columns are the whole entity). */
  hasDoc?: boolean;
};

const date = (value: unknown) => (value ? new Date(value as string) : null);
const str = (value: unknown, max = 255) => String(value ?? "").slice(0, max);

export function defaultFromRow<K extends CollectionKey>(row: Row): CollectionMap[K] {
  return {
    ...(row.doc ?? {}),
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  } as unknown as CollectionMap[K];
}

export const codecs: { [K in CollectionKey]: Codec<K> } = {
  courseCategories: {
    table: t.courseCategories as never,
    ordered: true,
    columns: (e) => ({ label: str(e.label, 120), sortOrder: e.order ?? 0 }),
  },
  courses: {
    table: t.courses as never,
    ordered: true,
    columns: (e) => ({
      title: str(e.title),
      categoryId: e.categoryId,
      status: e.status,
      sortOrder: e.order ?? 0,
    }),
  },
  students: {
    table: t.students as never,
    ordered: true,
    columns: (e) => ({
      slug: e.slug,
      name: str(e.name),
      role: e.role,
      featured: Boolean(e.featured),
      status: e.status,
      sortOrder: e.order ?? 0,
    }),
  },
  leads: {
    table: t.leads as never,
    ordered: false,
    columns: (e) => ({
      name: str(e.name),
      phone: str(e.phone, 32),
      email: e.email ? str(e.email) : null,
      courseId: e.courseId,
      status: e.status,
      source: str(e.source, 120),
    }),
  },
  projectCategories: {
    table: t.projectCategories as never,
    ordered: true,
    columns: (e) => ({ slug: e.slug, label: str(e.label, 120), sortOrder: e.order ?? 0 }),
  },
  projects: {
    table: t.projects as never,
    ordered: true,
    columns: (e) => ({
      slug: e.slug,
      name: str(e.name),
      status: e.status,
      sortOrder: e.order ?? 0,
    }),
  },
  posts: {
    table: t.posts as never,
    ordered: false,
    columns: (e) => ({ slug: e.slug, title: str(e.title), status: e.status, publishedAt: date(e.publishedAt) }),
  },
  partners: {
    table: t.partners as never,
    ordered: true,
    columns: (e) => ({
      name: str(e.name),
      showOnHome: Boolean(e.showOnHome),
      showOnPartnersPage: Boolean(e.showOnPartnersPage),
      sortOrder: e.order ?? 0,
    }),
  },
  media: {
    table: t.media as never,
    ordered: false,
    columns: (e) => ({
      url: str(e.url, 1024),
      name: str(e.name),
      folder: str(e.folder, 191),
      mime: str(e.mime, 64),
      size: e.size ?? 0,
      width: e.width ?? 0,
      height: e.height ?? 0,
      source: e.source,
    }),
  },
  users: {
    table: t.users as never,
    ordered: false,
    columns: (e) => ({
      email: str(e.email, 191).toLowerCase(),
      name: str(e.name),
      role: e.role,
      status: e.status,
      lastActiveAt: date(e.lastActiveAt),
    }),
  },
};

/** Entity fields that live only in columns (never duplicated into `doc`). */
export function toDoc(entity: Record<string, unknown>) {
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = entity;
  void _id;
  void _c;
  void _u;
  return rest;
}
