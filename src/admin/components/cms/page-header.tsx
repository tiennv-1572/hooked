import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/admin/components/ui/breadcrumb";
import { Button } from "@/admin/components/ui/button";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** "Dashboard / Khóa học / DJ CƠ BẢN" — the last crumb is the current page. */
  breadcrumbs?: Crumb[];
  /** Right-aligned buttons ("Tạo mới", "Xuất CSV"…). */
  actions?: ReactNode;
  /** Shows a back arrow before the title. */
  backHref?: string;
  /** Badges next to the title (status…). */
  meta?: ReactNode;
  className?: string;
};

/** Title block at the top of every admin page. */
export function PageHeader({ title, description, breadcrumbs, actions, backHref, meta, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs?.length ? (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem>
                    {crumb.href && !last ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="max-w-64 truncate">{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!last ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          {backHref ? (
            <Button variant="ghost" size="icon" asChild className="-ml-2 shrink-0">
              <Link href={backHref} aria-label="Quay lại">
                <ArrowLeft />
              </Link>
            </Button>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
              {meta}
            </div>
            {description ? <p className="text-muted-foreground mt-1 text-sm">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
