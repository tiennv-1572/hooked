# 06 · Câu hỏi mở & giả định đã chọn

Các mục dưới đây cần chủ dự án / designer xác nhận. Cột "Đang làm" là giả định đã áp dụng để không bị chặn; đổi lại đều dễ.
Câu hỏi riêng từng màn hình nằm ở mục "Open questions" trong `02-screens.md` và "Thiếu trong design" trong `03-states-behavior.md`.

## Ưu tiên cao (ảnh hưởng UI đang thấy)

| #   | Câu hỏi                                                                                                                          | Đang làm                                                                                                                                                         | Ở đâu                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | Font **Young Display Bold** (đoạn intro desktop, node `145:16`) — có file font + license không?                                  | Fallback Inter Bold qua token `--font-display`. Có file thì thêm `next/font/local`, không sửa component                                                          | `globals.css`, `intro-section.tsx` |
| 2   | Copy "SẼ LÀ **BỀ** PHÓNG" có phải lỗi chính tả của "**BỆ** PHÓNG"?                                                               | Giữ nguyên như Figma                                                                                                                                             | `data/home.ts`                     |
| 3   | Blog carousel thiết kế cho **5 bài** nhưng chỉ có **3 bài thật**. Hai slot còn lại hiển thị gì? Caption của Spin Awards, Devoid? | 5 item: 3 bài thật + Devoid (→ `/projects/devoid-music-festival`) + artwork "Static Surge" (→ `/projects`). Caption ngoài Vui Fest & Hệ sinh thái là placeholder | `data/home.ts`                     |
| 4   | Click card Service (Media / Artists management / Event) đi đâu?                                                                  | Academy → `/academy`; còn lại → `/projects?service=<id>` (gallery lọc theo dịch vụ)                                                                              | `services-section.tsx`             |
| 5   | Card Service đầu tiên màu cam là "featured" cố định hay là trạng thái hover?                                                     | Mặc định card đầu cam; khi rê chuột vào dải, card đang hover lấy màu cam                                                                                         | `services-section.tsx`             |
| 6   | Nav desktop Home cao **64px**, các trang khác **80px** + link active màu cam. Thống nhất 1 kiểu?                                 | Dùng 64px, link hiện tại cùng màu xám như Figma Home                                                                                                             | `site-header.tsx`                  |
| 7   | Tablet (768–1199) không có frame Home riêng.                                                                                     | Dùng bố cục mobile (hero có lockup + CTA), margin 48px, các khối 2 cột khi đủ ≥320px                                                                             | toàn bộ Home                       |
| 8   | Header có cần sticky khi cuộn không?                                                                                             | Không sticky (Figma không thể hiện)                                                                                                                              | `site-header.tsx`                  |

## Nội dung / tích hợp

| #   | Câu hỏi                                                                                                                                     | Đang làm                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 9   | Có CMS không (Sanity / Strapi / Payload / Notion…)? Ai cập nhật khóa học, dự án, blog?                                                      | Nội dung hard-code có type trong `src/data/*`, thay bằng fetch sau |
| 10  | Form đăng ký tư vấn gửi đi đâu (email, Google Sheet, CRM, API riêng)? Có cần chống spam?                                                    | Chưa làm (Sprint 1). Dự kiến Server Action + zod validate          |
| 11  | Trang Contact không có form — đúng ý đồ?                                                                                                    | Theo Figma                                                         |
| 12  | Link social trong Figma (`facebook.com/hookedvn`, `instagram.com/hooked.vn`, `youtube.com/@hookedvn`, `tiktok.com/@hookedvn`) đã chính xác? | Dùng như Figma                                                     |
| 13  | Logo đối tác có bản vector (SVG) không? Hiện là PNG export.                                                                                 | Dùng PNG (hiển thị @2x ổn)                                         |
| 14  | Không có trang Blog index — link "← Blogpost" ở trang bài viết đi đâu?                                                                      | Chưa quyết (đề xuất: về `/#blog`)                                  |
| 15  | Domain, hosting (Vercel?), analytics (GA4 / Meta Pixel)?                                                                                    | Chưa cấu hình                                                      |

## Thiếu trong design (đề xuất tự thiết kế theo style hiện có)

- Trang 404, loading/skeleton, lỗi gửi form (network error), nút đóng ở màn Success của form đăng ký.
- Hover cho chevron hero, highlight card, blog card — đang áp pattern QA chung (viền cam 1px, chữ cam).
- Hai hệ lưới khác nhau (1192px/gutter 124 vs 1344px/margin 48) giữa nhóm trang Academy/Projects và About/Contact/Partners/Blog — cần xác nhận là cố ý.
