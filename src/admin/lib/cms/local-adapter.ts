"use client";

import { createStore, del, get, set } from "idb-keyval";

import { CmsError, type CmsAdapter } from "./adapter";
import { autoSlug, createId } from "./ids";
import {
  collectionMeta,
  type CollectionItem,
  type CollectionKey,
  type CollectionMap,
  type SingletonKey,
  type SingletonMap,
} from "./registry";
import {
  academyPageSeed,
  courseCategorySeed,
  courseSeed,
  leadSeed,
  studentSeed,
  studentsPageSeed,
} from "./seed/academy";
import { blogPageSeed, postSeed } from "./seed/blog";
import {
  aboutPageSeed,
  contactPageSeed,
  homeSeed,
  navigationSeed,
  partnerSeed,
  partnersPageSeed,
  settingsSeed,
} from "./seed/pages";
import { projectCategorySeed, projectSeed, projectsLayoutSeed, projectsPageSeed } from "./seed/projects";
import { mediaSeed, userSeed } from "./seed/system";
import type { MediaAsset } from "./types/shared";

/** Bump when the seed shape changes: stored data from an older version is replaced by the new seed. */
const SEED_VERSION = 14;

const collectionSeeds: { [K in CollectionKey]: CollectionMap[K][] } = {
  courseCategories: courseCategorySeed,
  courses: courseSeed,
  students: studentSeed,
  leads: leadSeed,
  projects: projectSeed,
  projectCategories: projectCategorySeed,
  posts: postSeed,
  partners: partnerSeed,
  media: mediaSeed,
  users: userSeed,
};

const singletonSeeds: SingletonMap = {
  settings: settingsSeed,
  navigation: navigationSeed,
  home: homeSeed,
  academyPage: academyPageSeed,
  studentsPage: studentsPageSeed,
  projectsPage: projectsPageSeed,
  projectsLayout: projectsLayoutSeed,
  blogPage: blogPageSeed,
  aboutPage: aboutPageSeed,
  contactPage: contactPageSeed,
  partnersPage: partnersPageSeed,
};

const store = typeof indexedDB === "undefined" ? undefined : createStore("hooked-cms", "documents");
const collectionKey = (key: string) => `collection:${key}`;
const singletonKey = (key: string) => `singleton:${key}`;

/** Simulated network latency so loading states are visible and realistic. */
const LATENCY = 180;
const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY));
const clone = <T>(value: T): T => structuredClone(value);
const now = () => new Date().toISOString();

async function ensureVersion() {
  if (!store) return;
  const version = await get<number>("meta:version", store);
  if (version === SEED_VERSION) return;
  await Promise.all([
    ...Object.keys(collectionSeeds).map((key) => del(collectionKey(key), store)),
    ...Object.keys(singletonSeeds).map((key) => del(singletonKey(key), store)),
  ]);
  await set("meta:version", SEED_VERSION, store);
}

let versionChecked: Promise<void> | null = null;
function ready() {
  versionChecked ??= ensureVersion();
  return versionChecked;
}

async function readCollection<K extends CollectionKey>(key: K): Promise<CollectionMap[K][]> {
  await ready();
  const stored = store ? await get<CollectionMap[K][]>(collectionKey(key), store) : undefined;
  return clone(stored ?? collectionSeeds[key]);
}

async function writeCollection<K extends CollectionKey>(key: K, items: CollectionMap[K][]) {
  if (store) await set(collectionKey(key), items, store);
}

function sortForList<K extends CollectionKey>(key: K, items: CollectionMap[K][]) {
  if (collectionMeta[key].ordered) {
    return items.sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0));
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function readImageSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = url;
  });
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const localAdapter: CmsAdapter = {
  async list(key) {
    await wait();
    return sortForList(key, await readCollection(key));
  },

  async get(key, id) {
    await wait();
    const items = await readCollection(key);
    return items.find((item) => item.id === id) ?? null;
  },

  async create(key, data) {
    await wait();
    const items = await readCollection(key);
    const id = data.id?.trim() || createId(key.slice(0, 4));
    if (items.some((item) => item.id === id)) throw new CmsError(`ID "${id}" đã tồn tại.`, "conflict");
    const stamp = now();
    const meta = collectionMeta[key];
    const order = meta.ordered
      ? ((data as { order?: number }).order ??
        items.reduce((max, item) => Math.max(max, (item as { order?: number }).order ?? -1), -1) + 1)
      : undefined;
    const fields = clone(data) as Record<string, unknown>;
    if (meta.autoSlug && !String(fields.slug ?? "").trim()) {
      const taken = items.map((other) => String((other as { slug?: string }).slug ?? ""));
      fields.slug = autoSlug(String(fields[meta.titleField] ?? ""), taken, key.slice(0, -1));
    }
    const item = {
      ...fields,
      ...(order === undefined ? {} : { order }),
      id,
      createdAt: stamp,
      updatedAt: stamp,
    } as unknown as CollectionItem<typeof key>;
    await writeCollection(key, [...items, item]);
    return clone(item);
  },

  async update(key, id, patch) {
    await wait();
    const items = await readCollection(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new CmsError("Không tìm thấy nội dung cần cập nhật.", "not_found");
    const next = { ...items[index], ...clone(patch), id, updatedAt: now() } as CollectionItem<typeof key>;
    items[index] = next;
    await writeCollection(key, items);
    return clone(next);
  },

  async remove(key, ids) {
    await wait();
    const items = await readCollection(key);
    await writeCollection(
      key,
      items.filter((item) => !ids.includes(item.id)),
    );
  },

  async reorder(key, orderedIds) {
    await wait();
    const items = await readCollection(key);
    const position = new Map(orderedIds.map((id, index) => [id, index]));
    const next = items.map((item) =>
      position.has(item.id) ? ({ ...item, order: position.get(item.id) } as CollectionItem<typeof key>) : item,
    );
    await writeCollection(key, next);
  },

  async getSingleton(key) {
    await wait();
    await ready();
    const stored = store ? await get<SingletonMap[typeof key]>(singletonKey(key), store) : undefined;
    return clone(stored ?? singletonSeeds[key]);
  },

  async saveSingleton(key, value) {
    await wait();
    await ready();
    if (store) await set(singletonKey(key), clone(value), store);
    return clone(value);
  },

  async upload(file, folder = "uploads") {
    await wait();
    if (!file.type.startsWith("image/")) throw new CmsError("Chỉ hỗ trợ tệp hình ảnh.", "invalid");
    if (file.size > 8 * 1024 * 1024) throw new CmsError("Ảnh tối đa 8 MB.", "invalid");
    const url = await readAsDataUrl(file);
    const { width, height } = await readImageSize(url);
    const stamp = now();
    const asset: MediaAsset = {
      id: createId("media"),
      createdAt: stamp,
      updatedAt: stamp,
      url,
      name: file.name,
      alt: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
      width,
      height,
      size: file.size,
      mime: file.type,
      folder,
      source: "upload",
    };
    const items = await readCollection("media");
    await writeCollection("media", [asset, ...items]);
    return clone(asset);
  },

  async reset() {
    await wait();
    if (store) {
      await Promise.all([
        ...Object.keys(collectionSeeds).map((key) => del(collectionKey(key), store)),
        ...Object.keys(singletonSeeds).map((key) => del(singletonKey(key), store)),
      ]);
    }
  },
};

/** Seed values (used by "Khôi phục mặc định" buttons on singleton editors). */
export function getSingletonSeed<S extends SingletonKey>(key: S): SingletonMap[S] {
  return clone(singletonSeeds[key]);
}
