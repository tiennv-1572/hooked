"use client";

import { Bell, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CommandPalette } from "@/admin/components/shell/command-palette";
import { ThemeMenu } from "@/admin/components/shell/theme-menu";
import { Button } from "@/admin/components/ui/button";
import { Separator } from "@/admin/components/ui/separator";
import { SidebarTrigger } from "@/admin/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import { useCollection } from "@/admin/lib/cms/hooks";

import { findNavItem } from "./nav-config";

export function AdminHeader() {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const { data: leads } = useCollection("leads");
  const newLeads = leads?.filter((lead) => lead.status === "new").length ?? 0;

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 rounded-t-[inherit] border-b backdrop-blur-md">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 data-[orientation=vertical]:h-4" />
        <CommandPalette />
        <div className="ml-auto flex items-center gap-1.5">
          {current?.publicHref ? (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <a href={current.publicHref} target="_blank" rel="noreferrer">
                <ExternalLink />
                Xem trên website
              </a>
            </Button>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/admin/leads?status=new" aria-label={`${newLeads} đăng ký mới`}>
                  <Bell />
                  {newLeads > 0 ? (
                    <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                      {newLeads > 9 ? "9+" : newLeads}
                    </span>
                  ) : null}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Đăng ký tư vấn mới</TooltipContent>
          </Tooltip>
          <ThemeMenu />
        </div>
      </div>
    </header>
  );
}
