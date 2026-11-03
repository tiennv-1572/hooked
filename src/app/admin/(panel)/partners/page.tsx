import type { Metadata } from "next";

import { PartnersList } from "@/admin/modules/partners/partners-list";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Đối tác" };

export default function PartnersPage() {
  return <PartnersList />;
}
