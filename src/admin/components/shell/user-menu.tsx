"use client";

import { ChevronsUpDown, ExternalLink, LogOut, RotateCcw, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { Avatar, AvatarFallback } from "@/admin/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/admin/components/ui/sidebar";
import { logout, useAuth } from "@/admin/lib/auth";
import { useResetCms } from "@/admin/lib/cms/hooks";

const ROLE_LABEL = { owner: "Chủ sở hữu", admin: "Quản trị", editor: "Biên tập" } as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const user = useAuth((state) => state.user);
  const { isMobile } = useSidebar();
  const router = useRouter();
  const confirm = useConfirm();
  const reset = useResetCms();
  if (!user) return null;

  const onReset = async () => {
    const ok = await confirm({
      title: "Khôi phục dữ liệu mẫu?",
      description:
        "Toàn bộ nội dung trong database bị thay bằng dữ liệu mẫu và website cập nhật ngay (tài khoản người dùng được giữ nguyên).",
      confirmLabel: "Khôi phục",
      destructive: true,
    });
    if (ok) reset.mutate();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="bg-primary/12 text-primary rounded-lg text-xs font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </span>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-60 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="grid text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{ROLE_LABEL[user.role]}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/admin/account">
                  <UserRound />
                  Tài khoản của tôi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/" target="_blank" rel="noreferrer">
                  <ExternalLink />
                  Xem website
                </a>
              </DropdownMenuItem>
              {user.role === "owner" ? (
                <DropdownMenuItem onSelect={onReset}>
                  <RotateCcw />
                  Khôi phục dữ liệu mẫu
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={async () => {
                await logout();
                router.replace("/admin/login");
              }}
            >
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
