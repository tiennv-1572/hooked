import type { Metadata } from "next";

import { SettingsEditor } from "@/admin/modules/site/settings-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Cài đặt website" };

export default function SettingsPage() {
  return <SettingsEditor />;
}
