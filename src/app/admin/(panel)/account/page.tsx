import type { Metadata } from "next";

import { AccountPage } from "@/admin/modules/system/account-page";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Tài khoản của tôi" };

export default function MyAccountPage() {
  return <AccountPage />;
}
