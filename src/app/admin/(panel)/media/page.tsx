import type { Metadata } from "next";

import { MediaLibrary } from "@/admin/modules/media/media-library";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Thư viện media" };

export default function MediaPage() {
  return <MediaLibrary />;
}
