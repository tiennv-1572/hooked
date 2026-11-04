import { Crown, PenLine, ShieldCheck, type LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/admin/components/ui/avatar";
import type { AdminRole, AdminUser } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

export const ROLE_ORDER: AdminRole[] = ["owner", "admin", "editor"];

export const ROLE_META: Record<AdminRole, { label: string; description: string; icon: LucideIcon; tone: string }> = {
  owner: {
    label: "Chủ sở hữu",
    description: "Toàn quyền, gồm phân quyền người dùng và khôi phục dữ liệu. Luôn cần ít nhất một chủ sở hữu.",
    icon: Crown,
    tone: "bg-primary/12 text-primary",
  },
  admin: {
    label: "Quản trị",
    description: "Quản lý toàn bộ nội dung, đăng ký tư vấn, cài đặt website và mời biên tập viên.",
    icon: ShieldCheck,
    tone: "bg-chart-3/12 text-chart-3",
  },
  editor: {
    label: "Biên tập",
    description: "Soạn và cập nhật nội dung: bài viết, khóa học, dự án, học viên, ảnh.",
    icon: PenLine,
    tone: "bg-muted text-muted-foreground",
  },
};

export type UserStatus = AdminUser["status"];

export const STATUS_META: Record<UserStatus, { label: string; tone: "success" | "warning" | "muted" }> = {
  active: { label: "Đang hoạt động", tone: "success" },
  invited: { label: "Đã mời", tone: "warning" },
  disabled: { label: "Đã khóa", tone: "muted" },
};

/** "yes" | "no" | short note for a partial permission. */
export type Permission = true | false | string;

/** Informational permissions matrix (enforced once the API lands). */
export const PERMISSIONS: {
  group: string;
  rows: { label: string; owner: Permission; admin: Permission; editor: Permission }[];
}[] = [
  {
    group: "Nội dung",
    rows: [
      { label: "Xem dashboard và toàn bộ nội dung", owner: true, admin: true, editor: true },
      { label: "Tạo, sửa khóa học, dự án, bài viết, học viên", owner: true, admin: true, editor: true },
      { label: "Xuất bản / ẩn nội dung", owner: true, admin: true, editor: "Chỉ bản nháp" },
      { label: "Xóa nội dung", owner: true, admin: true, editor: false },
      { label: "Sửa nội dung các trang, menu điều hướng", owner: true, admin: true, editor: true },
      { label: "Tải ảnh lên thư viện media", owner: true, admin: true, editor: true },
    ],
  },
  {
    group: "Vận hành",
    rows: [
      { label: "Xử lý đăng ký tư vấn", owner: true, admin: true, editor: "Chỉ xem" },
      { label: "Cài đặt website (SEO, liên hệ, mạng xã hội)", owner: true, admin: true, editor: false },
    ],
  },
  {
    group: "Hệ thống",
    rows: [
      { label: "Mời & quản lý người dùng", owner: true, admin: "Trừ chủ sở hữu", editor: false },
      { label: "Đổi mật khẩu người dùng khác", owner: true, admin: "Trừ chủ sở hữu", editor: false },
      { label: "Chỉ định chủ sở hữu", owner: true, admin: false, editor: false },
      { label: "Khôi phục dữ liệu mẫu", owner: true, admin: false, editor: false },
    ],
  },
];

export function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const AVATAR_TONES = [
  "bg-primary/12 text-primary",
  "bg-chart-3/12 text-chart-3",
  "bg-chart-4/15 text-[color-mix(in_oklch,var(--chart-4),black_25%)] dark:text-chart-4",
  "bg-chart-2/20 text-[color-mix(in_oklch,var(--chart-2),black_45%)] dark:text-chart-2",
  "bg-chart-5/15 text-chart-5 dark:text-foreground",
];

/** Stable colour per name so the same person is easy to spot across lists. */
export function avatarTone(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/** Initials avatar (no photo upload for admin users yet). */
export function UserAvatar({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn("font-semibold", avatarTone(name || "?"), size === "sm" ? "text-[10px]" : "text-xs")}
      >
        {initialsOf(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export function RoleBadge({ role, className }: { role: AdminRole; className?: string }) {
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.tone,
        className,
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}
