import { Suspense } from "react";

import { AdminShell } from "@/admin/components/shell/admin-shell";
import { Spinner } from "@/admin/components/ui/spinner";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

/** Authenticated CMS area: sidebar + header + page. */
export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Spinner className="text-primary size-6" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
