import type { Metadata } from "next";

import { UsersPage } from "@/admin/modules/system/users-page";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Người dùng" };

export default function AdminUsersPage() {
  return <UsersPage />;
}
