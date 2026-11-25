import { ExternalLink, Globe } from "lucide-react";
import type { ReactNode } from "react";

import { GUIDE_SITE_URL } from "@/lib/guide/source";

type OnWebsiteProps = {
  /** Website pages this screen changes: a label and a path on the live site (`/phu-tung`). */
  pages: { label: string; path: string }[];
  /** Usually one or two `<Screenshot>` of those pages, marked where the data shows. */
  children?: ReactNode;
};

/** "Hiện trên website": where what is saved on this screen appears, with links to the live site. */
export function OnWebsite({ children, pages }: OnWebsiteProps) {
  return (
    <section className="not-prose border-fd-primary/25 bg-fd-primary/5 my-6 rounded-xl border p-4 md:p-5">
      <h3 className="text-fd-primary flex items-center gap-2 text-sm font-semibold">
        <Globe aria-hidden className="size-4" />
        Hiện trên website
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {pages.map((page) => (
          <li key={page.path}>
            <a
              className="border-fd-border bg-fd-background hover:border-fd-primary hover:text-fd-primary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm"
              href={`${GUIDE_SITE_URL}${page.path}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {page.label}
              <span className="text-fd-muted-foreground text-xs">{page.path}</span>
              <ExternalLink aria-hidden className="size-3" />
            </a>
          </li>
        ))}
      </ul>
      {children ? <div className="mt-2">{children}</div> : null}
    </section>
  );
}
