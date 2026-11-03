# 01 · Kiến trúc & quy ước

## Stack

| Hạng mục        | Lựa chọn                                                                                                                    | Lý do                                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework       | **Next.js 16.4** (App Router, Turbopack, `cacheComponents` + `partialPrefetching` bật sẵn từ template)                      | Trang chủ yếu tĩnh → prerender, SEO tốt                                                                        |
| UI              | React 19.3                                                                                                                  | Đi kèm Next 16                                                                                                 |
| Styling         | **Tailwind CSS v4** (CSS-first `@theme`)                                                                                    | Token khai báo 1 chỗ trong `globals.css`                                                                       |
| Font            | `next/font/google`: **Manrope** (UI chính), **Inter** (blog carousel + vài heading desktop) — subset `latin` + `vietnamese` | Theo Foundations; tự host, không layout shift                                                                  |
| Carousel        | **embla-carousel-react** + `embla-carousel-autoplay`                                                                        | Hero (autoplay 5s, drag, loop), Services (drag free). Nhẹ, headless                                            |
| Overlay         | **@radix-ui/react-dialog**                                                                                                  | Mobile menu; sẽ dùng cho Registration, Course program, Student reader, Lightbox (focus trap, Esc, scroll lock) |
| Form            | **react-hook-form** + **zod** + `@hookform/resolvers`                                                                       | Registration form (Họ và tên *, Số điện thoại *, Email, khóa học) — chưa dùng                                  |
| Variants        | **class-variance-authority** + `clsx` + `tailwind-merge` (`cn()`)                                                           | Button variants, gộp class an toàn                                                                             |
| Lint/format     | ESLint (next core-web-vitals + TS), Prettier + `prettier-plugin-tailwindcss`                                                | Sắp xếp class tự động                                                                                          |
| Package manager | pnpm 11                                                                                                                     |                                                                                                                |

> Next 16 khác bản cũ: `priority` của `<Image>` đã deprecated → dùng `loading="eager"` + `fetchPriority="high"`; `usePathname` cần `<Suspense>` khi bật `cacheComponents`; `LayoutProps` / `PageProps` là type global do `next typegen` sinh. Docs đi kèm ở `node_modules/next/dist/docs/`.

## Cấu trúc thư mục

```
src/
  app/
    layout.tsx            # font, metadata, SiteHeader + SiteFooter
    page.tsx              # Home
    globals.css           # design tokens (@theme), utilities: grain, edge-fade, scrollbar-none
    icon.svg              # favicon = Hooked mark
    academy/ projects/ about/ contact/ partners/ blog/[slug]/ projects/[slug]/ academy/students/
                          # placeholder pages (PagePlaceholder) — thay dần bằng màn hình thật
  components/
    brand/hooked-logo.tsx # HookedLogo, HookedMark, HookedVector
    layout/               # site-header, desktop-nav, mobile-header (+ menu overlay), site-footer, page-placeholder
    ui/                   # button (cva), container, section-heading, marquee, icon
    home/                 # hero-carousel, hero-marquee, intro-section, highlights-section,
                          # services-section, blog-carousel, partners-section
  data/
    home.ts               # nội dung Home (typed, sẵn sàng thay bằng CMS)
    catalog.ts            # danh sách project/blog để prerender placeholder
  hooks/
    use-prefers-reduced-motion.ts
  lib/
    site.ts               # routes, nav (desktop/mobile), thông tin công ty, social
    utils.ts              # cn, wrapIndex, pad2
public/
  images/{brand,photos,blog,partners}/   # asset export từ Figma (đã khử trùng lặp)
  icons/                                  # SVG icon export từ Figma
```

## Design tokens (Tailwind v4 `@theme`)

| Token             | Giá trị   | Figma         | Utility                                 |
| ----------------- | --------- | ------------- | --------------------------------------- |
| `--color-ink`     | `#050101` | color/bg      | `bg-ink`, `text-ink`                    |
| `--color-surface` | `#1A1A1A` | color/surface | `bg-surface`                            |
| `--color-warm`    | `#2A1F19` | color/warm    | `bg-warm`                               |
| `--color-brand`   | `#E55624` | color/brand   | `bg-brand`, `text-brand`                |
| `--color-accent`  | `#FF6B00` | color/accent  | `text-accent` (hover link, nhãn active) |
| `--color-muted`   | `#CCCCCC` | color/muted   | `text-muted`                            |
| `--color-line`    | `#3A3A3A` | color/border  | `border-line`                           |
| `--color-ivory`   | `#FFF4E9` | stage/ivory   | chữ overlay                             |
| `--color-coal`    | `#100C0A` | stage/coal    | pill phụ                                |
| `--color-copper`  | `#FF9C50` | stage/copper  | gradient CTA                            |
| `--color-peach`   | `#FB9A41` | —             | nhãn footer                             |
| `--color-ember`   | `#983A0F` | —             | gradient nav desktop                    |

- Spacing Figma `8/12/16/24/32/40/60/80/124` = Tailwind `2/3/4/6/8/10/15/20/31` (thang 4px mặc định).
- Font: `font-sans` (Manrope), `font-inter`, `font-display` (Young Display → fallback Inter, xem câu hỏi mở).
- Utilities: `grain` (film grain overlay), `edge-fade` (mask mờ 2 mép marquee), `scrollbar-none`, `animate-marquee`, `animate-fade-in/out`.
- Breakpoint: `tablet` = 48rem, `desktop` = 75rem.

## Quy ước

- Server Component mặc định; `"use client"` chỉ cho component có state/effect (carousel, header mobile, nav active).
- Một component cho cả 3 breakpoint, khác biệt viết bằng `tablet:` / `desktop:` (Figma mobile và desktop là 2 bố cục khác nhau nhưng cùng nội dung → tránh render 2 lần).
- Nội dung nằm trong `src/data/*` có type rõ ràng → sau này thay bằng fetch CMS mà không sửa component.
- Asset: chỉ dùng file export từ Figma, không vẽ lại; icon là SVG trong `public/icons`, dùng qua `<Icon name=… />`.
- Mỗi component có JSDoc ghi node Figma tương ứng để đối chiếu.
- A11y: `aria-current` cho nav, nhãn `aria-label` tiếng Việt cho nút icon, focus ring cam (`:focus-visible`), tôn trọng `prefers-reduced-motion` (tắt autoplay, marquee, chuyển động blog).
- Lệnh: `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm format`.
