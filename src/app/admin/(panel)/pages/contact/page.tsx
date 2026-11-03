import type { Metadata } from "next";

import { ContactPageEditor } from "@/admin/modules/site/contact-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Trang Contact" };

export default function ContactEditorPage() {
  return <ContactPageEditor />;
}
