"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side view of the admin session. The real session is the httpOnly `hooked_admin` cookie set by
 * POST /api/admin/auth/login; this store only caches the signed-in profile for the UI and is re-validated
 * against GET /api/admin/auth/me by <AuthGuard>.
 */

/** Seeded owner account (scripts/db-seed.ts, `ADMIN_DEMO_PASSWORD`) — prefilled on the login form in development only. */
export const DEMO_PASSWORD = "hooked2026";
export const DEMO_EMAIL = "admin@hooked.vn";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor";
  avatar?: string;
};

type AuthState = {
  user: SessionUser | null;
  hydrated: boolean;
  signIn: (user: SessionUser) => void;
  signOut: () => void;
  setHydrated: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      signIn: (user) => set({ user }),
      signOut: () => set({ user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "hooked-admin-session",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Ends the server session, then clears the cached profile. */
export async function logout() {
  await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => undefined);
  useAuth.getState().signOut();
}

/** Signed-in user's name, recorded as `by` in lead status history. */
export function currentUserName() {
  return useAuth.getState().user?.name ?? "Hệ thống";
}
