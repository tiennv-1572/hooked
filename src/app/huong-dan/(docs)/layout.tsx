import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

import { requireGuideSession } from "@/lib/guide/session";
import { GUIDE_BASE_PATH, guideSource } from "@/lib/guide/source";

/** The guide's reading shell: sidebar with the page tree, search, link back to the CMS. */
export default async function GuideDocsLayout({ children }: { children: ReactNode }) {
  await requireGuideSession(); // see requireGuideSession: each segment checks for itself
  return (
    <DocsLayout
      links={[{ external: true, text: "Mở CMS", url: "/admin" }]}
      nav={{ title: "Hướng dẫn CMS Hooked", url: GUIDE_BASE_PATH }}
      // Light only (see the parent layout), so no light/dark switch either.
      themeSwitch={{ enabled: false }}
      tree={guideSource.getPageTree()}
    >
      {children}
    </DocsLayout>
  );
}
