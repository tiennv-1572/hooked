"use client";

import type { ReactNode } from "react";

import { AdminHeader } from "@/admin/components/shell/admin-header";
import { AdminSidebar } from "@/admin/components/shell/admin-sidebar";
import { AuthGuard } from "@/admin/components/shell/auth-guard";
import { SidebarInset, SidebarProvider } from "@/admin/components/ui/sidebar";

/** Sidebar + sticky header + content area (centered max 1440px or full width — see ThemeMenu). */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="min-w-0">
          <AdminHeader />
          <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6 [html[data-content-width=centered]_&]:mx-auto [html[data-content-width=centered]_&]:w-full [html[data-content-width=centered]_&]:max-w-[1440px]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
