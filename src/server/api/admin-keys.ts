import { collectionMeta, singletonMeta, type CollectionKey, type SingletonKey } from "@/admin/lib/cms/registry";

import { HttpError } from "./http";

export function collectionKey(value: string): CollectionKey {
  if (value in collectionMeta) return value as CollectionKey;
  throw new HttpError(404, "not_found", `Collection "${value}" không tồn tại.`);
}

export function singletonKey(value: string): SingletonKey {
  if (value in singletonMeta) return value as SingletonKey;
  throw new HttpError(404, "not_found", `Singleton "${value}" không tồn tại.`);
}

/** Collections only owners/admins may change (editors can read them). */
export const ADMIN_ONLY_COLLECTIONS: CollectionKey[] = ["users"];

/**
 * Public cache tags touched by a write to `key` — the website's content services tag their caches
 * with `cms:<key>` (see src/server/content/*). Collections that feed other pages invalidate those too.
 */
export function affectedKeys(key: CollectionKey | SingletonKey): string[] {
  switch (key) {
    case "partners":
      return ["partners", "home", "partnersPage"];
    case "posts":
      return ["posts", "home"];
    case "students":
      return ["students", "academyPage"];
    case "projectCategories":
      return ["projectCategories", "projects"];
    case "courseCategories":
      return ["courseCategories", "courses"];
    case "media":
      return [];
    default:
      return [key];
  }
}
