/**
 * Known public routes of the website — used by link pickers ("Chọn trang") and the navigation editor ("Thêm trang").
 * `label` is the default menu label as written on the site (English, uppercase in the header), `title` the Vietnamese
 * description shown in the admin.
 */
export type SiteRoute = { href: string; label: string; title: string };

export const SITE_ROUTES: SiteRoute[] = [
  { href: "/", label: "Home", title: "Trang chủ" },
  { href: "/academy", label: "Academy", title: "Academy" },
  { href: "/academy/students", label: "Student Stories", title: "Học viên tiêu biểu" },
  { href: "/projects", label: "Project", title: "Dự án" },
  { href: "/blog", label: "Blogpost", title: "Blog" },
  { href: "/about", label: "About", title: "Giới thiệu" },
  { href: "/contact", label: "Contact", title: "Liên hệ" },
  { href: "/partners", label: "Partners", title: "Đối tác" },
];

export function findSiteRoute(href: string) {
  const path = href.split(/[?#]/)[0] || "/";
  return SITE_ROUTES.find((route) => route.href === path);
}

export function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || /^(mailto|tel):/.test(href);
}

/** "0966 609 807" → "tel:+84966609807" (Vietnamese numbers get the +84 country code). */
export function phoneToHref(display: string) {
  const digits = display.replace(/[^\d+]/g, "");
  if (!digits.replace(/\+/g, "")) return "";
  if (digits.startsWith("+")) return `tel:+${digits.slice(1).replace(/\+/g, "")}`;
  if (digits.startsWith("84")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+84${digits.slice(1)}`;
  return `tel:${digits}`;
}

/** Host without "www." for previews ("instagram.com"). */
export function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}
