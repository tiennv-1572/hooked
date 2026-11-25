# Viết tài liệu hướng dẫn CMS (`/huong-dan`)

Tài liệu cho **người quản trị nội dung website Hooked** (vai trò Chủ sở hữu, Quản trị, Biên tập): từng bước, nhiều ảnh,
lời lẽ đơn giản. Chỉ tài khoản CMS đã đăng nhập xem được, không index:

- `src/proxy.ts` chuyển người chưa có cookie phiên về `/admin/login?next=…`;
- `requireGuideSession()` (`src/lib/guide/session.ts`) kiểm phiên ở **mọi** segment (root layout, layout docs, trang) —
  với Cache Components, trang không đọc dữ liệu request sẽ được dựng sẵn và prefetch riêng được;
- API tìm kiếm `/api/huong-dan/search` trả 401.

## Cấu trúc

- Nội dung: `content/huong-dan/<nhóm>/<trang>.mdx` — một thư mục cho mỗi nhóm menu CMS
  (`src/admin/components/shell/nav-config.ts`), một trang cho mỗi màn, cùng tên và cùng thứ tự với menu.
- Thứ tự và tên nhóm: `meta.json` của từng thư mục (`title`, `icon` là tên icon Lucide, `pages`).
- Nhóm ngoài menu: **Bắt đầu** (đầu tiên) và **Tham khảo** (cuối cùng).
- Ảnh: `public/huong-dan/anh/<nhóm>/<trang>-<mô-tả>.png`, chụp bằng script, không chụp tay.
- Link tới website thật luôn qua `GUIDE_SITE_URL` (`https://hooked.vn`, `src/lib/guide/source.ts`) — các khối
  `OnWebsite` tự ghép. Link tới CMS viết đường dẫn tương đối (`/admin/...`), tới trang hướng dẫn khác `/huong-dan/...`.
- Khung hướng dẫn: `src/app/huong-dan/` (root layout riêng, CSS riêng `guide.css`), component trong
  `src/components/guide/`, Fumadocs đọc MDX qua `source.config.ts` → `.source/` (sinh khi `dev`/`build`).

## Mẫu một trang (màn CMS)

```mdx
---
title: "Tên màn đúng như menu CMS"
description: "Một câu: màn này để làm gì."
---

<AdminPath trail={["Nhóm", "Tên màn"]} href="/admin/..." />

## Màn này dùng để làm gì

## Hiện ở đâu trên website ← <OnWebsite pages={[...]}> + <Screenshot>

## Các bước thao tác ← <Steps><Step>…</Step></Steps>, mỗi bước một ảnh có đánh số

## Các trường thông tin ← <FieldTable fields={[...]} />

## Lưu ý và lỗi thường gặp ← trích nguyên văn câu báo lỗi trên màn hình

## Liên quan
```

Màn chỉ một vai trò dùng được (ví dụ **Khôi phục dữ liệu mẫu** chỉ Chủ sở hữu): đầu trang có
`<Callout type="warn" title="Ai dùng được màn này">`.

## Khối dùng được trong MDX (không cần import)

| Khối                                                                           | Dùng để                                                                 |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `<AdminPath trail={[…]} href="/admin/…" />`                                    | "CMS › Nhóm › Màn" + nút "Mở màn này" (tab mới)                         |
| `<OnWebsite pages={[{ label, path }]}>…</OnWebsite>`                           | Khung "Hiện trên website", link tới website thật                        |
| `<Screenshot src="/huong-dan/anh/…png" alt="…" caption="…" device="mobile" />` | Ảnh bấm để phóng to; chưa có file thì hiện khung chờ ghi tên file       |
| `<FieldTable fields={[{ name, required, description, example }]} />`           | Bảng các trường của form                                                |
| `<Steps><Step>…</Step></Steps>`                                                | Các bước đánh số                                                        |
| `<Callout type="warn" title="…">…</Callout>`                                   | Lưu ý (`info`), cảnh báo (`warn`), lỗi (`error`)                        |
| `<Tabs items={["Máy tính", "Điện thoại"]}><Tab>…</Tab></Tabs>`                 | Nội dung khác nhau theo thiết bị                                        |
| `<Accordions><Accordion title="…">…</Accordion></Accordions>`                  | Hỏi đáp, phần đọc thêm                                                  |
| `<Cards><Card title="…" href="…">…</Card></Cards>`                             | Ô dẫn tới trang khác                                                    |
| `<Draft />`                                                                    | Mục đang soạn (xoá khi viết xong; trước khi bàn giao không còn cái nào) |

## Cách viết

- Gọi đúng tên nút, tên trường, tên tab như trên màn hình, in đậm: bấm **Lưu thay đổi**.
- Mỗi bước một hành động. Câu ngắn, không thuật ngữ kỹ thuật (thuật ngữ bắt buộc thì giải thích ở trang Thuật ngữ).
- Lỗi thường gặp: chép đúng câu báo lỗi để người đọc tìm kiếm được.
- Số trong vòng tròn ở ảnh (①②③) và trong câu chữ phải khớp nhau: "bấm **Thêm khóa học** ②". Không đặt ①② trong tiêu
  đề (`##`): mục neo của tiêu đề sẽ hỏng.
- Điều chưa chắc thì thử trên bản chạy ở máy rồi mới viết. Hành vi lạ thì ghi đúng hành vi hiện tại kèm cách tránh.
- Frontmatter: luôn bọc `title`, `description` trong nháy kép (một dấu `:` không bọc làm hỏng YAML, cả build hỏng).
- Không viết `<chữ>` trần trong MDX (bị hiểu là thẻ và làm hỏng trang): bọc trong dấu \` hoặc viết khác đi.

## Kiểm tra

- `pnpm exec playwright test tests/e2e/guide.spec.ts` (trên bản build production): chặn đăng nhập, tìm kiếm, style
  website và CMS không đổi.
- Sau mỗi lần sửa MDX: kiểm frontmatter, thẻ trần, số trong tiêu đề, ảnh thiếu (script `scan-mdx.py` của skill
  `admin-guide-wiki`).

## Chụp ảnh

Chưa có — viết ở bước 2 (bộ chụp ảnh tự động trên một bản chạy ở máy với MySQL riêng và dữ liệu seed).

## Bản PDF

Chưa có — viết ở bước 4 (trang in `/huong-dan/ban-in` + lệnh tạo PDF).
