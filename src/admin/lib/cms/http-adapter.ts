"use client";

import { useAuth } from "../auth";
import { CmsError, type CmsAdapter } from "./adapter";
import type { CollectionItem, CollectionKey, SingletonKey, SingletonMap } from "./registry";
import type { MediaAsset } from "./types/shared";

/*
 * CMS adapter backed by the admin REST API (MySQL). Endpoints: src/app/api/admin/**.
 * Errors come back as `{ error: { code, message, fields? } }` and surface as toasts through the hooks.
 */

const CODE_BY_STATUS: Record<number, CmsError["code"]> = { 404: "not_found", 409: "conflict", 422: "invalid" };

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/admin${path}`, {
      credentials: "same-origin",
      ...init,
      headers: init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new CmsError("Mất kết nối tới máy chủ. Kiểm tra mạng rồi thử lại.");
  }
  if (response.status === 401) {
    useAuth.getState().signOut();
    if (!window.location.pathname.startsWith("/admin/login")) {
      // Outside React (no router here): a full load also drops every cached query of the expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(
        `/admin/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
    }
    throw new CmsError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new CmsError(body?.error?.message ?? `Lỗi ${response.status}`, CODE_BY_STATUS[response.status] ?? "unknown");
  }
  if (response.status === 204) return undefined as T;
  return ((await response.json()) as { data: T }).data;
}

const json = (body: unknown) => JSON.stringify(body);

export const httpAdapter: CmsAdapter = {
  list: <K extends CollectionKey>(key: K) => call<CollectionItem<K>[]>(`/collections/${key}`),
  get: <K extends CollectionKey>(key: K, id: string) =>
    call<CollectionItem<K>>(`/collections/${key}/${encodeURIComponent(id)}`).catch((error) => {
      if (error instanceof CmsError && error.code === "not_found") return null;
      throw error;
    }),
  create: (key, data) => call(`/collections/${key}`, { method: "POST", body: json(data) }),
  update: (key, id, patch) =>
    call(`/collections/${key}/${encodeURIComponent(id)}`, { method: "PATCH", body: json(patch) }),
  remove: async (key, ids) => {
    if (ids.length === 1) await call(`/collections/${key}/${encodeURIComponent(ids[0])}`, { method: "DELETE" });
    else await call(`/collections/${key}/bulk-delete`, { method: "POST", body: json({ ids }) });
  },
  reorder: async (key, orderedIds) => {
    await call(`/collections/${key}/reorder`, { method: "POST", body: json({ ids: orderedIds }) });
  },
  getSingleton: <S extends SingletonKey>(key: S) => call<SingletonMap[S]>(`/singletons/${key}`),
  saveSingleton: <S extends SingletonKey>(key: S, value: SingletonMap[S]) =>
    call<SingletonMap[S]>(`/singletons/${key}`, { method: "PUT", body: json(value) }),
  upload: (file, folder = "uploads") => {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    return call<MediaAsset>("/media/upload", { method: "POST", body: form });
  },
  reset: async () => {
    await call("/reset", { method: "POST" });
  },
};

// ---------------------------------------------------------------------------------------------------------
// Auth endpoints

export type ApiUser = { id: string; name: string; email: string; role: "owner" | "admin" | "editor"; avatar?: string };

export const authApi = {
  login: (email: string, password: string, remember: boolean) =>
    fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json({ email, password, remember }),
    }).then(async (response) => {
      const body = (await response.json().catch(() => null)) as { user?: ApiUser; error?: { message?: string } } | null;
      if (!response.ok || !body?.user) throw new Error(body?.error?.message ?? "Không đăng nhập được.");
      return body.user;
    }),
  me: () =>
    fetch("/api/admin/auth/me", { credentials: "same-origin" }).then(async (response) =>
      response.ok ? ((await response.json()) as { user: ApiUser | null }).user : null,
    ),
  changePassword: (current: string, next: string) =>
    fetch("/api/admin/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json({ current, next }),
    }).then(async (response) => {
      if (response.ok) return;
      const body = (await response.json().catch(() => null)) as {
        error?: { message?: string; fields?: Record<string, string> };
      } | null;
      throw new Error(
        body?.error?.fields?.current ?? body?.error?.fields?.next ?? body?.error?.message ?? "Không đổi được mật khẩu.",
      );
    }),
};
