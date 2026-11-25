import { ChevronRight, ExternalLink } from "lucide-react";

type AdminPathProps = {
  /** Menu labels exactly as the CMS sidebar shows them, e.g. `["Quản lý Academy", "Khóa học"]`. */
  trail: string[];
  /** The screen's address in the CMS, e.g. `/admin/courses` — opened on the same site as the guide. */
  href?: string;
};

/** "CMS › Quản lý Academy › Khóa học", where the screen lives in the menu, and a button that opens it. */
export function AdminPath({ href, trail }: AdminPathProps) {
  return (
    <div className="not-prose border-fd-border bg-fd-card my-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
      <span className="text-fd-muted-foreground flex flex-wrap items-center gap-1">
        <span className="text-fd-foreground font-medium">CMS</span>
        {trail.map((label) => (
          <span className="flex items-center gap-1" key={label}>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-fd-foreground font-medium">{label}</span>
          </span>
        ))}
      </span>
      {href ? (
        <a
          className="bg-fd-primary text-fd-primary-foreground inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90"
          href={href}
          rel="noopener"
          target="_blank"
        >
          Mở màn này
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      ) : null}
    </div>
  );
}
