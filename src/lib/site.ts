/**
 * Routes and pure helpers shared by the site components.
 * `siteConfig` and the nav arrays below are the original Figma copy (01 · Home, 07 · Footer, 75 · Mobile navigation);
 * they seed the CMS (src/admin/lib/cms/seed). The live header, footer and root metadata read `getSite()`.
 */

export type NavItem = {
  label: string;
  href: string;
  /** CMS menu option: open the link in a new tab. */
  newTab?: boolean;
};

export const routes = {
  home: "/",
  academy: "/academy",
  students: "/academy/students",
  projects: "/projects",
  contact: "/contact",
  about: "/about",
  partners: "/partners",
  blog: "/blog",
} as const;

/** `/projects/devoid-music-festival` */
export const projectHref = (slug: string) => `${routes.projects}/${slug}`;
/** `/blog/vui-fest-cat-ba` */
export const blogHref = (slug: string) => `${routes.blog}/${slug}`;

export const siteConfig = {
  name: "Hooked Entertainment",
  tagline: "Support Local Artists",
  description:
    "Hooked Entertainment sẽ là bệ phóng cho những nghệ sỹ âm nhạc điện tử có cơ hội phát huy tối đa tiềm năng của mình.",
  company: {
    legalName: "CÔNG TY TNHH HOOKED ENTERTAINMENT",
    address: "Số 142B phố Đê La Thành, phường Văn Miếu - Quốc Tử Giám, TP Hà Nội",
    email: "hooked.vie@gmail.com",
    phone: { display: "0966 609 807", href: "tel:+84966609807" },
  },
  socials: [
    { label: "Facebook", href: "https://www.facebook.com/hookedvn" },
    { label: "Instagram", href: "https://www.instagram.com/hooked.vn/" },
    { label: "YouTube", href: "https://www.youtube.com/@hookedvn" },
    { label: "TikTok", href: "https://www.tiktok.com/@hookedvn" },
  ],
} as const;

/** Desktop navigation order (Figma 01 · Navigation). */
export const desktopNav: NavItem[] = [
  { label: "Home", href: routes.home },
  { label: "Academy", href: routes.academy },
  { label: "Project", href: routes.projects },
  { label: "Contact", href: routes.contact },
  { label: "About", href: routes.about },
  { label: "Partners", href: routes.partners },
];

/** Mobile overlay order (Figma 75 · OVERLAYS / Mobile navigation). */
export const mobileNav: NavItem[] = [
  { label: "Home", href: routes.home },
  { label: "Academy", href: routes.academy },
  { label: "Project", href: routes.projects },
  { label: "About", href: routes.about },
  { label: "Partners", href: routes.partners },
  { label: "Contact", href: routes.contact },
];

/** Figma shows only "About"; the other entries were added so every page is reachable from the footer. */
export const footerCompanyLinks: NavItem[] = [
  { label: "About", href: routes.about },
  { label: "Academy", href: routes.academy },
  { label: "Student Stories", href: routes.students },
  { label: "Partners", href: routes.partners },
  { label: "Blogpost", href: routes.blog },
  { label: "Contact", href: routes.contact },
];

/** True when `href` is the current page or one of its children. */
export function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** `target` / `rel` for a menu item the CMS marks "open in a new tab". */
export function newTabProps(item: Pick<NavItem, "newTab">) {
  return item.newTab ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};
}

/** Orange label shown in the mobile header (Figma: "Academy", "Project", "Blogpost"…): the CMS menu item of the current section. */
export function currentPageLabel(pathname: string, items: NavItem[]) {
  if (isActivePath(pathname, routes.blog)) return "Blogpost";
  return items.find((item) => isActivePath(pathname, item.href))?.label;
}
