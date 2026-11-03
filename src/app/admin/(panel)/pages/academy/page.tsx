import type { Metadata } from "next";

import { AcademyPageEditor } from "@/admin/modules/academy/academy-page-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Academy" };

export default function AcademyPageEditorPage() {
  return <AcademyPageEditor />;
}
