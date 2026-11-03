import type { CollectionItem, CollectionKey, NewItem, SingletonKey, SingletonMap } from "./registry";
import type { MediaAsset } from "./types/shared";

/**
 * Storage contract of the CMS. UI code never talks to storage directly — only through the hooks in
 * `./hooks.ts`, which call the active adapter.
 *
 * Active: `httpAdapter` → admin REST API (src/app/api/admin/**) → MySQL.
 * Offline demo: `localAdapter` (IndexedDB in the browser, seeded from the site's src/data), `NEXT_PUBLIC_CMS_ADAPTER=local`.
 */
export interface CmsAdapter {
  list<K extends CollectionKey>(key: K): Promise<CollectionItem<K>[]>;
  get<K extends CollectionKey>(key: K, id: string): Promise<CollectionItem<K> | null>;
  create<K extends CollectionKey>(key: K, data: NewItem<K>): Promise<CollectionItem<K>>;
  update<K extends CollectionKey>(key: K, id: string, patch: Partial<CollectionItem<K>>): Promise<CollectionItem<K>>;
  remove<K extends CollectionKey>(key: K, ids: string[]): Promise<void>;
  /** Persist a new order for ordered collections (writes `order` = index). */
  reorder<K extends CollectionKey>(key: K, orderedIds: string[]): Promise<void>;

  getSingleton<S extends SingletonKey>(key: S): Promise<SingletonMap[S]>;
  saveSingleton<S extends SingletonKey>(key: S, value: SingletonMap[S]): Promise<SingletonMap[S]>;

  /** Store a file and register it in the media library. */
  upload(file: File, folder?: string): Promise<MediaAsset>;

  /** Replace all content with the seed (owner only on the API; users are kept). */
  reset(): Promise<void>;
}

export class CmsError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "conflict" | "invalid" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "CmsError";
  }
}
