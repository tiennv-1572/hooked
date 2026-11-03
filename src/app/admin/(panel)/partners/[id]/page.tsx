import type { Metadata } from "next";

import { PartnerEditor } from "@/admin/modules/partners/partner-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Đối tác" };

/** `/admin/partners/new` creates; `/admin/partners/<id>` edits. The id is read client-side (useParams). */
export default function PartnerEditorPage() {
  return <PartnerEditor />;
}
