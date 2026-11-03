import type { Metadata } from "next";

import { HomePageEditor } from "@/admin/modules/site/home/home-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang chủ" };

export default function HomeEditorPage() {
  return <HomePageEditor />;
}
