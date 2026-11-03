import {
  BookOpenText,
  FileText,
  FolderKanban,
  GraduationCap,
  Handshake,
  Home,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  type LucideIcon,
  Menu,
  Newspaper,
  Settings,
  Shapes,
  Tags,
  UserCog,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Extra words for the ⌘K palette. */
  keywords?: string[];
  /** "Tạo mới" target shown in the ⌘K palette. */
  createHref?: string;
  /** Matching public page, used by "Xem trên website". */
  publicHref?: string;
  /** Shows the number of new registrations. */
  badge?: "newLeads";
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

/** Sidebar + command palette structure of the CMS. */
export const adminNav: AdminNavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        keywords: ["tổng quan", "thống kê"],
        publicHref: "/",
      },
      {
        title: "Đăng ký tư vấn",
        href: "/admin/leads",
        icon: Inbox,
        keywords: ["leads", "học viên mới", "form"],
        badge: "newLeads",
        publicHref: "/academy",
      },
    ],
  },
  {
    label: "Quản lý Academy",
    items: [
      {
        title: "Danh mục khóa học",
        href: "/admin/course-categories",
        icon: Shapes,
        keywords: ["category", "nhóm", "dj", "mc", "producer", "flip", "bộ lọc"],
        publicHref: "/academy",
      },
      {
        title: "Khóa học",
        href: "/admin/courses",
        icon: GraduationCap,
        keywords: ["academy", "course", "dj", "mc"],
        createHref: "/admin/courses/new",
        publicHref: "/academy",
      },
      {
        title: "Học viên",
        href: "/admin/students",
        icon: Users,
        keywords: ["student", "câu chuyện"],
        createHref: "/admin/students/new",
        publicHref: "/academy/students",
      },
    ],
  },
  {
    label: "Quản lý dự án",
    items: [
      {
        title: "Danh mục dự án",
        href: "/admin/project-categories",
        icon: Tags,
        keywords: ["dịch vụ", "filter"],
        publicHref: "/projects",
      },
      {
        title: "Dự án",
        href: "/admin/projects",
        icon: FolderKanban,
        keywords: ["project", "sự kiện", "event"],
        createHref: "/admin/projects/new",
        publicHref: "/projects",
      },
      {
        title: "Cài đặt hiển thị dự án",
        href: "/admin/project-layout",
        icon: LayoutTemplate,
        keywords: ["bố cục", "layout", "lưới", "định dạng thẻ", "landscape", "portrait"],
        publicHref: "/projects",
      },
    ],
  },
  {
    label: "Nội dung",
    items: [
      {
        title: "Trang chủ",
        href: "/admin/pages/home",
        icon: Home,
        keywords: ["home", "hero", "banner"],
        publicHref: "/",
      },
      {
        title: "Bài viết",
        href: "/admin/posts",
        icon: Newspaper,
        keywords: ["blog", "post", "tin tức"],
        createHref: "/admin/posts/new",
        publicHref: "/blog",
      },
      {
        title: "Đối tác",
        href: "/admin/partners",
        icon: Handshake,
        keywords: ["partner", "logo", "thương hiệu"],
        createHref: "/admin/partners/new",
        publicHref: "/partners",
      },
    ],
  },
  {
    label: "Trang",
    items: [
      { title: "Academy", href: "/admin/pages/academy", icon: BookOpenText, publicHref: "/academy" },
      { title: "Học viên tiêu biểu", href: "/admin/pages/students", icon: FileText, publicHref: "/academy/students" },
      { title: "Projects", href: "/admin/pages/projects", icon: FileText, publicHref: "/projects" },
      { title: "Blog", href: "/admin/pages/blog", icon: FileText, publicHref: "/blog" },
      { title: "About", href: "/admin/pages/about", icon: FileText, publicHref: "/about" },
      { title: "Contact", href: "/admin/pages/contact", icon: FileText, publicHref: "/contact" },
      { title: "Partners", href: "/admin/pages/partners", icon: FileText, publicHref: "/partners" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { title: "Thư viện media", href: "/admin/media", icon: ImageIcon, keywords: ["ảnh", "upload", "hình"] },
      {
        title: "Menu & điều hướng",
        href: "/admin/navigation",
        icon: Menu,
        keywords: ["header", "footer", "nav"],
      },
      {
        title: "Cài đặt website",
        href: "/admin/settings",
        icon: Settings,
        keywords: ["seo", "social", "liên hệ", "công ty"],
      },
      { title: "Người dùng", href: "/admin/users", icon: UserCog, keywords: ["user", "phân quyền"] },
    ],
  },
];

export const adminNavItems = adminNav.flatMap((group) => group.items);

/** Longest-prefix match of the current admin path. */
export function findNavItem(pathname: string) {
  return [...adminNavItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)));
}
