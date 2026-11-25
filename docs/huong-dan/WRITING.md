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
- Danh sách đứng ngay trước `</Step>` (hay `</Tab>`, `</Accordion>`): để một dòng trống trước thẻ đóng. Không có dòng trống,
  Prettier thụt thẻ đóng vào trong danh sách và trang hỏng khi build.
- Câu hỏi trong `<Accordion>` cần link tới được thì đặt `id` không dấu (`<Accordion id="quen-mat-khau" title="…">`); dấu
  nháy trong `title` viết `&quot;`.

## Kiểm tra

- `pnpm exec playwright test tests/e2e/guide.spec.ts` (trên bản build production): chặn đăng nhập, tìm kiếm, style
  website và CMS không đổi.
- Sau mỗi lần sửa MDX: kiểm frontmatter, thẻ trần, số trong tiêu đề, ảnh thiếu (script `scan-mdx.py` của skill
  `admin-guide-wiki`).

## Chụp ảnh

Ảnh chụp bằng Playwright trên một **stack chạy ở máy**, không bao giờ trên DB của bạn hay production: kịch bản tạo, sửa,
xóa dữ liệu để chụp từng bước.

```bash
colima start                               # (hoặc Docker Desktop) nếu Docker chưa chạy
pnpm docs:stack up                         # lần đầu, hoặc khi muốn DB mới tinh
pnpm docs:screenshots                      # chụp mọi trang
pnpm docs:screenshots quan-ly-academy/danh-muc-khoa-hoc.shot   # chụp một trang
pnpm docs:stack down                       # tắt khi xong (cổng 3101, 33307 trống)
```

`docs:stack` (`scripts/huong-dan/stack.sh`) dựng hai thứ:

| Phần | Ở đâu                                                       | Ghi chú                                                                                                                                                                                                                                                                |
| ---- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DB   | Docker `huong-dan-mysql`, cổng 33307, DB `hooked_huong_dan` | Dựng mới mỗi lần `db`/`up`: `db:migrate`, `db:seed` (dữ liệu seed cố định), rồi `scripts/huong-dan/prepare-db.ts`. Không đụng `hooked-mysql` của docker-compose                                                                                                        |
| Web  | cổng 3101                                                   | Build production từ bản sao thư mục làm việc (`.huong-dan-stack/web`), không đụng `.next` của repo hay `next dev` đang chạy. Chạy bằng biến môi trường riêng (DB của stack, `AUTH_SECRET` riêng, `NEXT_PUBLIC_SITE_URL=https://hooked.vn`), không dùng `.env` của repo |

`prepare-db.ts`:

- **dời mọi mốc thời gian** (cột `datetime` và ngày giờ trong `doc`) sao cho đăng ký tư vấn mới nhất là hôm nay. Seed neo vào
  một ngày cố định (`SEED_NOW`), nên càng về sau CMS càng hiện "45 ngày trước" và biểu đồ 30 ngày của Dashboard trống dần;
  dời xong thì chụp ngày nào ảnh cũng như nhau. Ngày không có giờ (ngày sự kiện…) là nội dung, giữ nguyên;
- **email, số điện thoại đăng ký tư vấn** thành `…@example.com`, `0900000…` (seed sinh ngẫu nhiên dạng gmail, có thể trùng
  người thật).

Sửa code website thì chạy lại `pnpm docs:stack web`. Dữ liệu stack bị một lần thử làm lệch thì `pnpm docs:stack up` (DB mới,
web build lại — web giữ bộ nhớ đệm của dữ liệu cũ nên không chỉ dựng lại DB).

Kịch bản cho một trang: `scripts/huong-dan/shots/<nhóm>/<trang>.shot.ts`. Mẫu: `quan-ly-academy/danh-muc-khoa-hoc.shot.ts`.
Chụp riêng một trang thì lọc bằng đường dẫn đủ riêng (`quan-ly-academy/khoa-hoc.shot`): Playwright lọc theo chuỗi con, nên
`khoa-hoc` khớp cả `danh-muc-khoa-hoc`, `du-an` khớp cả `danh-muc-du-an`.

- `login(page, role)` — `owner` (Chủ sở hữu, mặc định), `admin` (Quản trị), `editor` (Biên tập): tài khoản seed, mật khẩu
  `hooked2026` trên stack.
- `shot(page, "<nhóm>/<trang>-<mô-tả>", { marks, area, fitHeight, hide, allowEmails, padding })`:
  - `marks: [{ n: 1, target: locator }]` vẽ khung đỏ và số; hiện được cả trên hộp thoại. Mục tiêu chỉ là chữ (câu báo lỗi,
    tên trong danh sách) thì thêm `at: "right"` (số đặt bên phải, không đè chữ cái đầu) và `tight: true` (khung ôm sát chữ,
    không rộng hết khối). `at: "above"` / `"below"` cho hàng nút, hàng icon sát nhau; `at: "left"` khi bên phải không còn chỗ;
  - `shot()` chờ vùng chụp (hoặc mục tiêu của số ① nếu không có vùng) đứng yên rồi mới đo, nên hộp thoại đang mở dần, menu
    đang trượt ra không làm lệch khung;
  - `area` chỉ chụp một vùng: hộp thoại (`dialog(page, "Tên hộp")`), một thẻ (`card(locator)`), khối nhỏ nhất chứa đủ các
    phần (`container(page, …)`: truyền locator cấp `page`, không dùng `.first()` bên trong các phần). Vùng tự nở để chứa đủ
    mọi số; `include: [locator]` nở thêm cho phần thòng ra ngoài vùng (danh sách thả xuống, menu). `fitHeight` kéo cửa sổ
    cao bằng trang (form dài);
  - `hide` ẩn phần tử khi chụp;
  - địa chỉ localhost trong ô nhập, chữ, placeholder hiện thành `https://hooked.vn`.
- Chặn lộ dữ liệu: script dừng nếu DB stack còn email đăng ký không phải `@example.com`; `shot()` báo lỗi khi ảnh có email
  không phải `@example.com`, email nhân viên `@hooked.vn` hay email liên hệ của website (thêm ngoại lệ bằng `allowEmails`).
- `noToasts(page)` chờ thông báo góc màn hình tắt trước ảnh kế tiếp; `localSql("…")` chạy SQL trên DB stack (dọn bản ghi mẫu
  còn sót từ lần chạy hỏng).
- Mỗi kịch bản tự tạo dữ liệu mẫu (tên như thật, đúng nghiệp vụ) và tự xóa ở cuối, để chạy lại vẫn ra cùng ảnh.
- Mở trang website trong cùng context: `page.context().newPage()` (giữ `baseURL`, giảm chuyển động của cấu hình).
- Khi menu (Radix) đang mở, phần còn lại của trang bị ẩn khỏi cây trợ năng: tìm nút bằng `[aria-label="…"]` thay vì
  `getByRole`.
- Rê chuột làm dòng hay nút đổi màu: đưa chuột ra chỗ trống (`page.mouse.move(0, 0)`) trước khi chụp.

Sau mỗi lần chạy: ghép ảnh (`contact-sheet.py` của skill) và **xem bằng mắt** — đúng vùng, số không đè chữ, không lộ
localhost, không dữ liệu rác.

Trang mẫu đã viết đủ: [Danh mục khóa học](/huong-dan/quan-ly-academy/danh-muc-khoa-hoc)
(`content/huong-dan/quan-ly-academy/danh-muc-khoa-hoc.mdx`).

## Bản PDF

Chưa có — viết ở bước 4 (trang in `/huong-dan/ban-in` + lệnh tạo PDF).
