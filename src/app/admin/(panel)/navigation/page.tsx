import type { Metadata } from "next";

import { NavigationEditor } from "@/admin/modules/site/navigation-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Menu & điều hướng" };

export default function NavigationPage() {
  return <NavigationEditor />;
}
