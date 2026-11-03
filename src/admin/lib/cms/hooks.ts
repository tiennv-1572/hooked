"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CmsAdapter } from "./adapter";
import { httpAdapter } from "./http-adapter";
import { localAdapter } from "./local-adapter";
import {
  collectionMeta,
  singletonMeta,
  type CollectionItem,
  type CollectionKey,
  type NewItem,
  type SingletonKey,
  type SingletonMap,
} from "./registry";

/**
 * The active storage adapter: the admin REST API backed by MySQL (src/app/api/admin/**).
 * `NEXT_PUBLIC_CMS_ADAPTER=local` switches to the offline IndexedDB demo (no database needed).
 */
export const cms: CmsAdapter = process.env.NEXT_PUBLIC_CMS_ADAPTER === "local" ? localAdapter : httpAdapter;

export const cmsKeys = {
  all: ["cms"] as const,
  collection: (key: CollectionKey) => ["cms", "collection", key] as const,
  item: (key: CollectionKey, id: string) => ["cms", "collection", key, id] as const,
  singleton: (key: SingletonKey) => ["cms", "singleton", key] as const,
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.";
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

// ---------------------------------------------------------------------------------------------------------
// Collections

/** All items of a collection (ordered collections come sorted by `order`, others newest first). */
export function useCollection<K extends CollectionKey>(key: K) {
  return useQuery({ queryKey: cmsKeys.collection(key), queryFn: () => cms.list(key) });
}

/** One item; reads from the collection cache when available. Pass `undefined` id to skip. */
export function useItem<K extends CollectionKey>(key: K, id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: cmsKeys.item(key, id ?? "__none__"),
    queryFn: () => cms.get(key, id!),
    enabled: Boolean(id),
    initialData: () =>
      queryClient.getQueryData<CollectionItem<K>[]>(cmsKeys.collection(key))?.find((item) => item.id === id),
  });
}

type MutationOptions = { silent?: boolean };

export function useCreateItem<K extends CollectionKey>(key: K, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NewItem<K>) => cms.create(key, data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.collection(key) });
      queryClient.setQueryData(cmsKeys.item(key, item.id), item);
      if (!options.silent) toast.success(`Đã tạo ${collectionMeta[key].singular}.`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useUpdateItem<K extends CollectionKey>(key: K, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CollectionItem<K>> }) => cms.update(key, id, patch),
    onSuccess: (item) => {
      queryClient.setQueryData(cmsKeys.item(key, item.id), item);
      queryClient.setQueryData<CollectionItem<K>[]>(cmsKeys.collection(key), (items) =>
        items?.map((existing) => (existing.id === item.id ? item : existing)),
      );
      queryClient.invalidateQueries({ queryKey: cmsKeys.collection(key) });
      if (!options.silent) toast.success("Đã lưu thay đổi.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useDeleteItems<K extends CollectionKey>(key: K, options: MutationOptions = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => cms.remove(key, ids),
    onSuccess: (_, ids) => {
      queryClient.setQueryData<CollectionItem<K>[]>(cmsKeys.collection(key), (items) =>
        items?.filter((item) => !ids.includes(item.id)),
      );
      queryClient.invalidateQueries({ queryKey: cmsKeys.collection(key) });
      if (!options.silent) {
        toast.success(
          ids.length === 1
            ? `Đã xóa ${collectionMeta[key].singular}.`
            : `Đã xóa ${ids.length} ${collectionMeta[key].singular}.`,
        );
      }
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

/** Persist a drag & drop order. Optimistically reorders the cached list. */
export function useReorder<K extends CollectionKey>(key: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => cms.reorder(key, orderedIds),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: cmsKeys.collection(key) });
      const previous = queryClient.getQueryData<CollectionItem<K>[]>(cmsKeys.collection(key));
      if (previous) {
        const byId = new Map(previous.map((item) => [item.id, item]));
        queryClient.setQueryData(
          cmsKeys.collection(key),
          orderedIds.map((id, order) => ({ ...byId.get(id)!, order })),
        );
      }
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(cmsKeys.collection(key), context.previous);
      toast.error(errorMessage(error));
    },
    onSuccess: () => toast.success("Đã cập nhật thứ tự."),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.collection(key) });
    },
  });
}

// ---------------------------------------------------------------------------------------------------------
// Singletons

export function useSingleton<S extends SingletonKey>(key: S) {
  return useQuery({ queryKey: cmsKeys.singleton(key), queryFn: () => cms.getSingleton(key) });
}

export function useSaveSingleton<S extends SingletonKey>(key: S) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: SingletonMap[S]) => cms.saveSingleton(key, value),
    onSuccess: (value) => {
      queryClient.setQueryData(cmsKeys.singleton(key), value);
      toast.success(`Đã lưu ${capitalize(singletonMeta[key].label.toLowerCase())}.`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

// ---------------------------------------------------------------------------------------------------------
// Media & system

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) => cms.upload(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.collection("media") });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useResetCms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cms.reset(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cmsKeys.all });
      toast.success("Đã khôi phục dữ liệu mẫu.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
