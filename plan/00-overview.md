# 00 · Tổng quan dự án Hooked

Website cho **Hooked Entertainment**: academy đào tạo DJ / MC Hype / Producer, tổ chức sự kiện, media và booking nghệ sĩ âm nhạc điện tử (Hà Nội).

- Figma: `a5ubAiUQAaKw76ja7OHdDA` (file "Hooked (Copy) (Copy)")
- Ngôn ngữ nội dung: tiếng Việt (một số nhãn UI giữ tiếng Anh: HOME, ACADEMY, PROJECT…)
- Stack: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript (chi tiết ở `01-architecture.md`)

## Cấu trúc file Figma

| Page                                | Node        | Nội dung                                                                   | Dùng để                     |
| ----------------------------------- | ----------- | -------------------------------------------------------------------------- | --------------------------- |
| 00 · START HERE                     | `2843:5158` | Developer handoff, Foundations (màu, spacing, typography), Component map   | Token + ranh giới component |
| 01 · WEBSITE / Screens & prototypes | `0:1`       | 15 màn hình (desktop 1440 + mobile 390), 6 nhóm overlay, 6 runtime section | Dựng màn hình               |
| 02 · LIBRARY / Components & assets  | `2039:435`  | Buttons, form fields, academy cards, blog posters, project cards, ảnh gốc  | Base component + asset      |
| 03 · BEHAVIOR / States & QA         | `2204:2495` | Story carousel, blog motion, QA hover                                      | State & motion              |
| 04 · RESPONSIVE / Layout rules      | `2204:2496` | Breakpoint & quy tắc reflow                                                | Responsive                  |
| 05 · REFERENCES                     | `2204:2497` | Ảnh tham khảo (Mobbin, Dpt., Büro…)                                        | Chỉ tham khảo               |

## Bộ tài liệu plan

| File                    | Nội dung                                                                     |
| ----------------------- | ---------------------------------------------------------------------------- |
| `00-overview.md`        | File này — tổng quan, quyết định chính, lộ trình                             |
| `01-architecture.md`    | Stack, thư viện, cấu trúc thư mục, design tokens, quy ước code               |
| `02-screens.md`         | Toàn bộ màn hình → route, block, data, câu hỏi mở                            |
| `03-states-behavior.md` | Overlay, state machine đăng ký, carousel, filter, hover/focus, loading/error |
| `04-components.md`      | Inventory component từ LIBRARY + ưu tiên P0/P1/P2                            |
| `05-home.md`            | Spec chi tiết màn hình Home (đã dựng)                                        |
| `06-open-questions.md`  | Câu hỏi cần chủ dự án / designer trả lời, giả định đã chọn                   |

## Sitemap

```
/                          Home                      ✅
/academy                   Academy                   ✅  (+ Registration, Course program ×7)
/academy/students          Student Stories           ✅  (+ Student reader ×13, ?story=<slug>)
/projects                  Projects overview         ✅  (filter, ?service=<id>)
/projects/[slug]           Project detail ×5         ✅  (+ Photo lightbox, Video lightbox)
/about                     About                     ✅
/blog                      Blog index                ✅  (không có trong Figma — tự thiết kế)
/blog/[slug]               Blog post ×3              ✅
/contact                   Contact                   ✅
/partners                  Partners                  ✅
404 / lỗi                  Not found, Error          ✅  (không có trong Figma — tự thiết kế)
Overlays: Registration · Course program · Student reader · Video/Photo lightbox · Mobile nav — ✅
```

## Breakpoints (Figma 04 · RESPONSIVE)

| Tên     | Khoảng     | Tailwind variant | Ghi chú                                      |
| ------- | ---------- | ---------------- | -------------------------------------------- |
| mobile  | 320–767px  | (mặc định)       | Frame tham chiếu 390px, margin 24px          |
| tablet  | 768–1199px | `tablet:`        | Margin 48px, header hamburger 72px           |
| desktop | ≥ 1200px   | `desktop:`       | Frame tham chiếu 1440px, cột nội dung 1192px |

## Lộ trình

1. **Sprint 0 — xong:** init dự án, tokens, base components, shell (header/footer/menu mobile), Home.
2. **Sprint 1–3 — xong:** Academy + Registration + Course program; Student Stories + reader; Projects overview + 5 trang chi tiết + lightbox ảnh/video; About, Contact, Partners; Blog index + 3 bài; 404/lỗi; responsive 320–1440; bộ test Playwright.
3. **Sprint 4 — tiếp theo:** nối form đăng ký với backend thật, CMS cho nội dung trong `src/data`, SEO/OG đầy đủ (cần domain), analytics, tối ưu dung lượng ảnh, deploy.
