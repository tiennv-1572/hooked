# 05 · Home — spec & trạng thái triển khai

Figma: section `01 · Home` (`2341:1601`) — Desktop `141:2` (1440 × 4547), Mobile `2818:4694` (390 × 4014).
Code: `src/app/page.tsx`, `src/components/home/*`, nội dung `src/data/home.ts`.
Trạng thái: **✅ đã dựng đủ 3 breakpoint** (desktop ≥1200, tablet 768–1199, mobile <768).

## Block (trên → dưới)

| #   | Block                                                         | Desktop node                                                                       | Mobile node                                | Component                                    | Trạng thái                    |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------- | ----------------------------- |
| 0   | Nền "Gradient + grain"                                        | `2357:1601`                                                                        | `2826:5187`                                | gradient trên từng section + utility `grain` | ✅                            |
| 1   | Navigation                                                    | `142:3` (gradient ember→đen→ember; kích thước đồng bộ trang con: 80px, mép 1192px) | `2818:4695` (72px, nhãn trang + hamburger) | `layout/site-header`                         | ✅                            |
| 2   | Hero carousel                                                 | `142:13` → `2484:4252` (5 slide)                                                   | `2824:5024` → `2820:4923`                  | `home/hero-carousel`                         | ✅                            |
| 2b  | Text marquee "SUPPORT LOCAL ARTISTS ∞ HOOKED ENTERTAINMENT ∞" | `2485:3981`                                                                        | —                                          | `home/hero-marquee`                          | ✅                            |
| 3   | Supporting local artists                                      | `142:35`                                                                           | `2824:5039`                                | `home/intro-section`                         | ✅ (font Young Display thiếu) |
| 4   | Highlight (Academy / Projects)                                | `147:84`                                                                           | `2824:5042`                                | `home/highlights-section`                    | ✅                            |
| 5   | Our service (kéo ngang)                                       | `142:50` → `2485:4025`                                                             | `2826:5038`                                | `home/services-section`                      | ✅                            |
| 6   | Blogpost (carousel cong 5 bài)                                | `2142:1193`                                                                        | `2826:5093`                                | `home/blog-carousel`                         | ✅                            |
| 7   | Partners + logo marquee                                       | `142:110`                                                                          | `2826:5125`                                | `home/partners-section`                      | ✅                            |
| 8   | Footer                                                        | `142:132`                                                                          | `2826:5151`                                | `layout/site-footer`                         | ✅                            |
| —   | Mobile menu overlay                                           | —                                                                                  | `2226:920`                                 | `layout/mobile-header`                       | ✅                            |

## Hành vi đã code

| Thành phần         | Hành vi                                                                                                                                                                                           | Ghi chú                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Hero               | Embla loop, **autoplay 5s**, kéo/vuốt, dừng khi hover, chevron ←/→ (desktop)                                                                                                                      | Tắt autoplay khi `prefers-reduced-motion`                     |
| Hero mobile/tablet | Gradient đọc chữ, logo 260px, "ENTERTAINMENT", 2 pill `Academy ↗` (cam) / `Projects ↗` (coal), counter `0N / 05 · SUPPORT LOCAL ARTISTS` cập nhật theo slide                                      | Lockup cố định, chỉ ảnh chạy                                  |
| Text marquee       | CSS marquee vô hạn, item cách 38px, chữ outline cam (`-webkit-text-stroke`)                                                                                                                       | Dừng khi hover                                                |
| Highlight          | Cả card là link → `/academy`, `/projects`; hover: viền cam 1px + zoom ảnh nhẹ; mobile tiêu đề chuyển cam                                                                                          | Theo pattern QA 90                                            |
| Services           | Embla `dragFree` (chuột kéo + vuốt), lộ mép card kế tiếp; desktop card đầu màu brand, **card đang hover lấy màu brand**                                                                           | Click card → `/academy` hoặc `/projects?service=…` (giả định) |
| Blog               | 5 bài vòng tròn; nút `→` (ring "HOOKED") = next; click preview trái/phải = prev/next; vuốt trên mobile; khung đứng yên, **chỉ ảnh trượt 380ms**, wrap liền mạch; caption cập nhật theo bài active | Mobile chỉ card giữa; tablet card 184px                       |
| Logo marquee       | 4 logo, cách 58px, mờ 2 mép (alpha mask 6.5%)                                                                                                                                                     |                                                               |
| Header             | Desktop: link hover cam, `aria-current`; Mobile: nhãn trang hiện tại (cam) + menu full-screen (Radix Dialog: focus trap, Esc, khóa scroll), link active cam                                       |                                                               |
| Footer             | mailto / tel / social (tab mới) / About; hover cam                                                                                                                                                |                                                               |

## Responsive

- **< 1200px** dùng bố cục mobile (theo cặp "hamburger < 1200"), tablet tăng margin 48px.
- Tablet: Highlight 2 cột (≥320px/card), Partners 2 cột, Footer chia cột, Blog hiện 3 card (184px), Services card 340px.
- **≥ 1200px** dùng bố cục desktop, cột nội dung 1192px (gutter 124px ở 1440). Hero cao `clamp(600px, 58.4vw, 841px)` (= 841px ở 1440).

## Nội dung / data (`src/data/home.ts`)

- `heroSlides` (5 ảnh), `intro`, `highlights` (2), `services` (4), `blogPreviews` (5) + `blogInitialIndex`, `partnersIntro`, `partners` (4 logo).
- Asset trong `public/images/**` export từ Figma, đã khử trùng lặp (logo dùng 1 file; ảnh hero dùng lại cho Services).

## Kiểm thử đã chạy

- `pnpm lint`, `pnpm typecheck`, `pnpm build` ✅ (Home prerender tĩnh).
- Playwright (Chrome) ở 1440 / 1024 / 390: không tràn ngang; chiều cao trang 4543px (Figma 4547) và 4023px (Figma 4014).
- Tương tác: blog next ×4 wrap đúng, prev qua preview đúng, hero next + autoplay chạy, marquee chạy, hover service đổi màu, menu mobile mở được; console không lỗi.

## Còn lệch so với Figma (đã biết)

1. Đoạn intro desktop dùng **Young Display Bold** — chưa có font → đang fallback Inter Bold nên xuống 4 dòng (Figma 3 dòng).
2. 3/5 caption blog là placeholder (Figma chỉ có caption Vui Fest Cát Bà và Hệ sinh thái Hooked).
3. Hover của highlight/blog/hero chevron là suy ra từ pattern QA chung (Figma không vẽ riêng cho Home).
