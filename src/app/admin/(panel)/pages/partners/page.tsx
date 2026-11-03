import type { Metadata } from "next";

import { PartnersPageEditor } from "@/admin/modules/site/partners-page-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Partners" };

export default function PartnersPageEditorPage() {
  return <PartnersPageEditor />;
}
