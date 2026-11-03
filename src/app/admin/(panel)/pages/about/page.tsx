import type { Metadata } from "next";

import { AboutPageEditor } from "@/admin/modules/site/about-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang About" };

export default function AboutEditorPage() {
  return <AboutPageEditor />;
}
