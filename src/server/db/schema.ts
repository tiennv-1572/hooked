import { boolean, datetime, index, int, json, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/*
 * MySQL schema of the Hooked CMS (Drizzle ORM).
 *
 * Every content table = relational columns (what we filter, sort, join or constrain on) + `doc` JSON
 * holding the full entity as edited in the CMS (nested lists like course modules, project photos,
 * post blocks…). The columns are always written from the entity, so they never drift from `doc`.
 * Adding a field to an entity therefore needs no migration unless it must be queried.
 */

const id = () => varchar("id", { length: 64 }).primaryKey();
const timestamps = {
  createdAt: datetime("created_at", { mode: "date", fsp: 3 }).notNull(),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 3 }).notNull(),
};
const doc = () => json("doc").$type<Record<string, unknown>>().notNull();
const status = () => varchar("status", { length: 16 }).notNull().default("draft");
const sortOrder = () => int("sort_order").notNull().default(0);

export const courseCategories = mysqlTable("course_categories", {
  id: id(),
  label: varchar("label", { length: 120 }).notNull(),
  sortOrder: sortOrder(),
  doc: doc(),
  ...timestamps,
});

export const courses = mysqlTable(
  "courses",
  {
    id: id(),
    title: varchar("title", { length: 255 }).notNull(),
    categoryId: varchar("category_id", { length: 64 }).notNull(),
    status: status(),
    sortOrder: sortOrder(),
    doc: doc(),
    ...timestamps,
  },
  (t) => [index("courses_status_order_idx").on(t.status, t.sortOrder), index("courses_category_idx").on(t.categoryId)],
);

export const students = mysqlTable(
  "students",
  {
    id: id(),
    slug: varchar("slug", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).notNull(),
    featured: boolean("featured").notNull().default(false),
    status: status(),
    sortOrder: sortOrder(),
    doc: doc(),
    ...timestamps,
  },
  (t) => [uniqueIndex("students_slug_uq").on(t.slug), index("students_status_order_idx").on(t.status, t.sortOrder)],
);

/** Registrations from the "Đăng ký tư vấn" form. */
export const leads = mysqlTable(
  "leads",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 255 }),
    courseId: varchar("course_id", { length: 64 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("new"),
    source: varchar("source", { length: 120 }).notNull().default(""),
    doc: doc(),
    ...timestamps,
  },
  (t) => [
    index("leads_course_idx").on(t.courseId),
    index("leads_status_idx").on(t.status),
    index("leads_created_idx").on(t.createdAt),
  ],
);

export const projectCategories = mysqlTable(
  "project_categories",
  {
    id: id(),
    slug: varchar("slug", { length: 191 }).notNull(),
    label: varchar("label", { length: 120 }).notNull(),
    sortOrder: sortOrder(),
    doc: doc(),
    ...timestamps,
  },
  (t) => [uniqueIndex("project_categories_slug_uq").on(t.slug)],
);

export const projects = mysqlTable(
  "projects",
  {
    id: id(),
    slug: varchar("slug", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    status: status(),
    sortOrder: sortOrder(),
    doc: doc(),
    ...timestamps,
  },
  (t) => [uniqueIndex("projects_slug_uq").on(t.slug), index("projects_status_order_idx").on(t.status, t.sortOrder)],
);

/** Many-to-many project ↔ category (mirrors `doc.categoryIds`, used for filtering). */
export const projectCategoryLinks = mysqlTable(
  "project_category_links",
  {
    projectId: varchar("project_id", { length: 64 }).notNull(),
    categoryId: varchar("category_id", { length: 64 }).notNull(),
  },
  (t) => [
    uniqueIndex("project_category_links_uq").on(t.projectId, t.categoryId),
    index("project_category_links_category_idx").on(t.categoryId),
  ],
);

export const posts = mysqlTable(
  "posts",
  {
    id: id(),
    slug: varchar("slug", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    status: status(),
    publishedAt: datetime("published_at", { mode: "date", fsp: 3 }),
    doc: doc(),
    ...timestamps,
  },
  (t) => [uniqueIndex("posts_slug_uq").on(t.slug), index("posts_status_published_idx").on(t.status, t.publishedAt)],
);

export const partners = mysqlTable(
  "partners",
  {
    id: id(),
    name: varchar("name", { length: 255 }).notNull(),
    showOnHome: boolean("show_on_home").notNull().default(true),
    showOnPartnersPage: boolean("show_on_partners_page").notNull().default(true),
    sortOrder: sortOrder(),
    doc: doc(),
    ...timestamps,
  },
  (t) => [index("partners_order_idx").on(t.sortOrder)],
);

export const media = mysqlTable(
  "media",
  {
    id: id(),
    url: varchar("url", { length: 1024 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    folder: varchar("folder", { length: 191 }).notNull(),
    mime: varchar("mime", { length: 64 }).notNull(),
    size: int("size").notNull().default(0),
    width: int("width").notNull().default(0),
    height: int("height").notNull().default(0),
    source: varchar("source", { length: 16 }).notNull().default("seed"),
    doc: doc(),
    ...timestamps,
  },
  (t) => [index("media_folder_idx").on(t.folder), index("media_created_idx").on(t.createdAt)],
);

export const users = mysqlTable(
  "users",
  {
    id: id(),
    email: varchar("email", { length: 191 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 16 }).notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    /** scrypt hash ("scrypt$N$salt$hash"); null for invited users. */
    passwordHash: varchar("password_hash", { length: 255 }),
    lastActiveAt: datetime("last_active_at", { mode: "date", fsp: 3 }),
    doc: doc(),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

/** One document per page/settings key (home, settings, navigation, aboutPage…). */
export const singletons = mysqlTable("singletons", {
  key: varchar("key", { length: 64 }).primaryKey(),
  doc: doc(),
  updatedAt: datetime("updated_at", { mode: "date", fsp: 3 }).notNull(),
});
