import type { Metadata } from "next";

import { LeadsInbox } from "@/admin/modules/academy/leads-inbox";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Đăng ký tư vấn" };

/** Supports `?status=new` (header bell), `?course=<id>` (course editor) and `?lead=<id>` (detail sheet). */
export default function LeadsPage() {
  return <LeadsInbox />;
}
