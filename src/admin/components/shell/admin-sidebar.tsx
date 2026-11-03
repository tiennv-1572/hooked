"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/admin/components/shell/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/admin/components/ui/sidebar";
import { useCollection } from "@/admin/lib/cms/hooks";

import { adminNav, findNavItem } from "./nav-config";

/** Hooked double-ring mark, drawn inline so it follows the theme colour. */
export function HookedMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 18" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="20.7" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const active = findNavItem(pathname);
  const { data: leads } = useCollection("leads");
  const newLeads = leads?.filter((lead) => lead.status === "new").length ?? 0;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <span className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HookedMark className="h-3 w-5" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-brand truncate text-sm font-extrabold tracking-wide">HOOKED</span>
                  <span className="text-muted-foreground truncate text-xs">Content Studio</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active?.href === item.href} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge === "newLeads" && newLeads > 0 ? (
                      <SidebarMenuBadge className="bg-primary/12 text-primary rounded-full px-1.5">
                        {newLeads}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
