# Báo cáo dự án Hooked

Cập nhật: 02/11/2026 — **Giai đoạn 4: MySQL, API công khai và tích hợp toàn bộ website**

## Giai đoạn 4: tóm tắt

- **MySQL 8.4 chạy bằng Docker Compose (chỉ MySQL).** Web vẫn chạy local bằng `pnpm dev`.
  - `pnpm db:setup` gồm: bật container, migrate, seed.
  - Dùng cổng 3307 vì 3306 trên máy đang bị chiếm. Adminer là tùy chọn (`--profile tools`).
- **CMS chạy thật trên database:**
  - Đăng nhập thật: mật khẩu scrypt, cookie httpOnly. Phân quyền kiểm tra ở server.
  - Mời người dùng bằng mật khẩu tạm; tài khoản tự kích hoạt ở lần đăng nhập đầu. Đổi mật khẩu thật.
  - Upload ảnh lưu ở `storage/uploads`.
  - Module Nhật ký hoạt động đã gỡ bỏ (03/11): route `/admin/activity`, khối "Hoạt động gần đây" ở Dashboard, bảng `activity` (migration `drizzle/0001_drop_activity.sql`).
  - Danh mục khóa học (03/11):
    - Thêm collection `courseCategories` và trang `/admin/course-categories`, nằm trong section menu mới "Quản lý khóa học" (Danh mục khóa học, Khóa học).
    - Khóa học lưu `categoryId`. Migration `drizzle/0002`–`0004` chuyển dữ liệu cũ sang.
    - Danh mục chỉ gồm tên và thứ tự (đã bỏ slug, mô tả và tham số `?category=`; migration `0005`–`0006`). Thêm API `GET /api/v1/course-categories`. Chip lọc trên `/academy` theo thứ tự danh mục trong CMS.
  - Khóa học (03/11):
    - Còn một ô "Tên khóa học" (website tự in hoa ở carousel, modal, form); bỏ slug, id khóa học mới tự sinh.
    - Trang sửa chỉ còn Xuất bản và Danh mục ở cột phải; bỏ vị trí carousel, tùy chọn phóng ảnh, xem trước và thống kê đăng ký.
    - API `GET /courses/{id}`. Migration `0007`–`0008`.
  - Học viên (03/11):
    - Slug tự tạo từ tên khi thêm mới (trùng thì thêm `-1`); vai trò nhập tự do.
    - "Ảnh chân dung" chỉ còn ô chọn ảnh (bỏ cắt ảnh thủ công; thông số cắt cũ vẫn giữ, đổi ảnh khác thì bỏ).
    - "Câu chuyện" là một ô soạn thảo (Tiptap): đậm, nghiêng, gạch chân, liên kết, danh sách, trích dẫn. Lưu dạng HTML, server lọc lại (`sanitize-html`) trước khi trả cho website và API. Migration `0009` chuyển các đoạn cũ sang HTML.
  - Dự án (03/11):
    - Một ô "Tên dự án" (website tự in hoa bằng CSS). Bỏ ngày diễn ra, dịch vụ cung cấp và kiểu ảnh hero.
    - Danh mục thay cho dịch vụ: dòng nhãn dưới tên (thẻ + trang chi tiết) và mục "Dịch vụ cung cấp" lấy từ danh mục, theo thứ tự chọn.
    - Mô tả dùng trình soạn thảo, không giới hạn độ dài. Đối tác là danh sách ô nhập. Ảnh hero trên trang chi tiết hiển thị nguyên ảnh, không cắt.
    - Cột phải chỉ còn Xuất bản và Xem trước thẻ. Migration `0010`–`0011`.
  - Section menu "Quản lý khóa học" đổi tên thành "Quản lý Academy" và gồm thêm Học viên (03/11).
  - Trang Academy (03/11): CMS chỉ còn SEO (full chiều ngang). Tiêu đề "ACADEMY", nhãn danh sách khóa học, mục Học viên tiêu biểu và nội dung form "Đăng ký tư vấn" (kể cả lời cảm ơn) là chữ cố định trên website, giữ đúng nội dung đang hiển thị. Migration `0016`–`0017`.
  - Trang Học viên tiêu biểu (03/11): CMS chỉ còn SEO. Tiêu đề, mô tả, nhãn lưới "Tất cả câu chuyện", nhãn thẻ "Xem câu chuyện" và nhãn trình đọc là chữ cố định trên website, giữ đúng nội dung đang hiển thị. Migration `0018`.
  - Trang Projects và Blog (03/11): CMS chỉ còn SEO. Tiêu đề "Hooked Projects", nút "Tất cả", trạng thái rỗng ("Chưa có dự án…") và phần đầu trang Blog ("BLOGPOST" + mô tả) là chữ cố định trên website, giữ đúng nội dung đang hiển thị. Migration `0019`.
  - Trang About (03/11): tab "Hình ảnh" chia thành "Khối ảnh trên" (sau phần mở đầu) và "Khối ảnh dưới" (sau phần hệ sinh thái), mỗi khối 4 ô ảnh đúng vị trí và tỉ lệ trên trang, có xem trước bố cục. Migration `0020` tách danh sách 8 ảnh cũ thành 2 khối.
  - Trang Contact và Partners (03/11): bỏ phần Nhãn các cột (Contact) và ô Dòng nhãn (Partners); "GỌI HOOKED / ĐỊA CHỈ / KẾT NỐI" và "PARTNERS" là chữ cố định trên website. Nội dung giới thiệu trang Partners dùng text editor (HTML, lọc lại trên server). Bỏ khung xem trước ở cả hai trang. Migration `0021`.
  - Dự án hợp tác (03/11): bỏ trang `/admin/collaborations`; thêm, sửa, kéo thả ngay trong Trang › Partners (có "Thêm từ dự án" và "Điền từ dự án"), lưu cùng trang. Dữ liệu chuyển vào `partnersPage.collaborations` (migration `0014`–`0015`); API giữ nguyên.
  - Bài viết (03/11):
    - Bỏ ô "Tóm tắt": thẻ ở `/blog` và mô tả SEO mặc định lấy ~160 ký tự đầu của đoạn mở đầu (API vẫn trả `excerpt`, tự sinh).
    - Khối "Đoạn văn" dùng trình soạn thảo, một khối chứa được nhiều đoạn; các đoạn liền nhau của bài cũ đã gộp lại (Vui Fest Cát Bà 8 → 5 khối). Chuyển dữ liệu bằng `scripts/db-data-migrate.ts`, chạy cùng `pnpm db:migrate`.
    - "Đoạn mở đầu" cũng dùng text editor (HTML, lọc lại trên server), giữ nguyên chữ và liên kết của 3 bài hiện có; `pnpm db:migrate` tự chuyển dữ liệu cũ. API: `intro{html, text}` trong `GET /posts/{slug}` (thay cho `intro{text, parts}`).
  - Section menu mới "Quản lý dự án" (03/11): Danh mục dự án, Dự án, Cài đặt hiển thị dự án.
    - Bỏ "Định dạng thẻ" ở từng dự án. Trang "Cài đặt hiển thị dự án" (`/admin/project-layout`) có danh sách ô (thêm không giới hạn, kéo thả); mỗi ô chọn định dạng và dự án, một dự án có thể nằm ở nhiều ô. Có xem trước lưới "Tất cả".
    - Mặc định giữ đúng bố cục cũ. API: `cardLayout[{format, projectId}]` trong `GET /pages/projects`. Migration `0012`–`0013`.
  - Trang chủ trong CMS (03/11):
    - Hero chỉ còn "Ảnh trình chiếu", thêm được video YouTube (tự phát, không tiếng, lặp lại; ảnh 5 giây, video 15 giây). Dải chữ "SUPPORT LOCAL ARTISTS" cố định.
    - Đoạn giới thiệu giới hạn 3 dòng, có bộ đếm dòng thật. Khung trên site nới lên 780px vì chưa có font Young Display.
    - Highlight và Dịch vụ: phần xem trước full chiều rộng. Đối tác: bỏ khối "Dải logo".
  - Đã sửa: ⌘K bị crash (thiếu root của cmdk).
- **API công khai `/api/v1`:** 14 endpoint, nhóm theo resource: Site, Pages, Courses, Students, Projects, Posts, Partners, Registrations.
  - **Swagger UI:** `/api-docs`. **OpenAPI 3.1:** `/api/v1/openapi.json`.
- **Tài liệu `plan/08-api.md`:** mỗi endpoint trả gì, **màn hình nào, vị trí nào** dùng, sửa ở mục CMS nào, cache tag nào được làm mới.
- **Toàn bộ website đọc từ MySQL:** header, menu mobile, footer, SEO, Home, Academy, Student Stories, Projects + chi tiết, Blog + bài viết, About, Contact, Partners, sitemap, robots.
  - Ảnh chụp trước và sau khi chuyển giống hệt nhau.
  - Lưu ở CMS thì website và API đổi ngay ở request kế tiếp (đã kiểm tra trên bản production).
- **Form "Đăng ký tư vấn"** gọi `POST /api/v1/registrations`:
  - Kiểm tra dữ liệu ở server (thông báo tiếng Việt từng ô), có honeypot chống spam và giới hạn 5 lần / 10 phút / IP.
  - Lead hiện ngay ở CMS → Đăng ký tư vấn, kèm nguồn (form được mở ở đâu).
- **Kiểm tra:**
  - `typecheck`, `format:check`, `build` sạch; `lint` 0 lỗi (3 cảnh báo cũ).
  - **Playwright 134 test đạt, 0 lỗi** (13 test bỏ qua có chủ đích theo viewport), chạy trên bản production, gồm cả luồng đăng nhập, mời người dùng, đăng xuất và đăng ký tư vấn thật.
- **Rà soát giao diện & dữ liệu (03/11):**
  - Dữ liệu trong MySQL khớp 100% với dữ liệu gốc (`pnpm db:seed` từ `src/data`). Hai chỗ seed lệch thiết kế đã sửa: tên dự án "“Xóm Húc” DJ Contest" (có ngoặc kép như Figma) và hai khóa Producer "Producer (HipHop / R&B / Ballad)", "Producer (EDM)" (như carousel, danh sách mobile, popup).
  - So từng trang với Figma (15 frame mobile 390, 7 frame desktop 1440, frame tablet 1024 của Student Stories): chiều cao lệch ≤ 10px, trừ phần đã đổi theo yêu cầu (ảnh hero dự án hiện full).
  - Sửa theo Figma: nút lọc `/projects` xuống nhiều dòng trên mobile (trang cao đúng 2886px như Figma); khối blog trang chủ mobile; khoảng cách hàng thẻ học viên trên tablet; footer tablet theo frame tablet (3 cột Liên hệ · Social · Company, chữ HOOKED full chiều ngang).
  - Quét responsive 24 độ rộng (320–2560px) × 19 trang và các popup (menu, đăng ký, chương trình học, reader, lightbox ảnh/video): không tràn ngang, không ảnh hỏng, không lỗi JS. Đã sửa: tràn 8px ở `/academy` khi màn 1200–1255px; giá học phí bị ngắt giữa số ở màn 320px; chữ "SUPPORTING" (Home) và "BLOGPOST" (Blog) bị ngắt giữa từ ở màn 320px.
  - Blog carousel trang chủ: khi độ rộng màn hình là số lẻ hoặc zoom 125%, mép khung lộ 1px ảnh của thẻ bên cạnh. Đã sửa: lúc đứng yên chỉ khung cắt ảnh hiện tại, ảnh bên cạnh ẩn; kiểm tra ở 15 cặp độ rộng × tỉ lệ màn hình, không còn pixel nào lọt.
  - Ảnh hero dự án nằm ngang luôn full chiều rộng cột (trước đó bị co lại, lộ viền tối hai bên trên màn thấp); ảnh dọc vẫn thu vừa màn hình.

### Chạy

```bash
pnpm install && cp .env.example .env
pnpm db:setup        # MySQL (Docker) + migrate + seed
pnpm dev             # web http://localhost:3000 · CMS /admin (admin@hooked.vn / hooked2026) · Swagger /api-docs
```

### Còn để ngỏ

- **Chưa có dịch vụ email:** lời mời người dùng dùng mật khẩu tạm, đăng ký tư vấn chưa gửi email báo.
- **Bố cục album vẽ tay theo Figma** và độ zoom poster video vẫn lấy từ `src/data/project-details.ts`, vì CMS chưa có trường cho chúng. Khi ảnh của dự án thay đổi, album tự chia cột cân bằng.
- **Slug không tồn tại** hiện trang 404 có `noindex` nhưng HTTP 200 (giới hạn khi stream của Next 16 Cache Components).
- **Giới hạn đăng ký theo IP** lưu trong bộ nhớ của một process. Khi chạy nhiều instance cần chuyển sang Redis.

---

# Giai đoạn 2: toàn bộ giao diện theo Figma

## Tóm tắt

- **Toàn bộ 15 màn hình trong Figma** đã được dựng, kèm đủ 6 nhóm overlay, cho cả desktop, tablet và mobile:
  - Home, Academy, Student Stories, Projects + 5 trang dự án, About, 3 bài blog, Contact, Partners.
  - Overlay: form đăng ký, chương trình khóa học, reader học viên, lightbox ảnh, lightbox video, menu mobile.
- Bố cục mobile dựng theo frame 390px đặt cạnh frame PC trong Figma. Tablet là bố cục trung gian theo quy tắc ở trang RESPONSIVE của Figma.
- Các trang **liên kết qua lại**, kể cả 2 trang Figma không có:
  - Menu: link của trang đang mở hiện màu cam.
  - Footer: thêm các link Academy, Student Stories, Partners, Blogpost, Contact.
  - Card và link trong nội dung bài viết dẫn sang trang dự án, học viên, blog.
  - 2 trang tự thiết kế (không có trong Figma): trang Blog tổng hợp và trang 404/lỗi.
- **Bộ test Playwright: 114 test đạt, 0 lỗi** trên 1440 / 1024 / 390px. Chạy bằng `pnpm build && pnpm test:e2e`.
- `lint`, `typecheck`, `build` đều sạch. 21 trang được prerender tĩnh.

## Xem ngay

```bash
cd ~/Desktop/Projects/Hooked
pnpm dev                 # http://localhost:3000
```

Ảnh chụp mọi trang (desktop + mobile) nằm ở `plan/screenshots/pages/`; ảnh các overlay ở `plan/screenshots/overlays/`.

## 1. Các trang

| Trang             | Route                      | Tương tác chính                                                                                          |
| ----------------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Home              | `/`                        | Hero tự chạy 5s, marquee, kéo ngang Services, blog carousel cong                                         |
| Academy           | `/academy`                 | Carousel 7 khóa học, lọc khóa học (DJ/MC/Producer/Flip), modal chương trình học, **form đăng ký tư vấn** |
| Student Stories   | `/academy/students`        | Lưới 13 học viên. Bấm vào mở reader; link `?story=<tên>` mở thẳng reader của học viên đó                 |
| Projects          | `/projects`                | Lọc theo dịch vụ, đồng bộ với URL (`?service=`). Nút play mở video                                       |
| Project detail ×5 | `/projects/<slug>`         | Album ảnh (lightbox lặp vòng, phím ←/→, vuốt), video YouTube (chỉ tải khi bấm play)                      |
| About             | `/about`                   | Câu chuyện Hooked, hệ sinh thái, ảnh                                                                     |
| Blog              | `/blog`, `/blog/<slug>` ×3 | Trang tổng hợp (tự thiết kế) + 3 bài viết đầy đủ nội dung                                                |
| Contact           | `/contact`                 | Email, điện thoại, địa chỉ, social                                                                       |
| Partners          | `/partners`                | Logo đối tác, các dự án hợp tác (link sang trang dự án)                                                  |
| 404 / lỗi         | mọi URL sai                | Tự thiết kế theo phong cách site, có link nhanh về các mục chính                                         |

**Form đăng ký** chạy đủ các trạng thái trong Figma:

- Mặc định → focus → báo lỗi (câu chữ đúng Figma) → sẵn sàng → đang gửi → thành công.
- Khóa học được chọn sẵn theo nút đã bấm.

Phần gửi hiện là **giả lập**: Server Action kiểm tra dữ liệu rồi trả thành công sau ~1 giây, chưa gửi về đâu (xem mục 4).

## 2. Kiểm thử

| Bộ test              | Nội dung                                                                                                                                                  | Kết quả |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `routes.spec.ts`     | 16 trang × 3 kích thước: status OK, có `h1`, không tràn ngang, không lỗi console, không request 404, **mọi link nội bộ đều mở được**; URL sai → trang 404 | ✅      |
| `navigation.spec.ts` | Menu desktop + trạng thái link đang mở, menu mobile (mở, chuyển trang, Esc), link footer                                                                  | ✅      |
| `home.spec.ts`       | Hero, blog carousel quay vòng, card highlight, mở bài blog                                                                                                | ✅      |
| `academy.spec.ts`    | Form đăng ký: lỗi → thành công; lọc khóa học; modal khóa học → đăng ký; story → reader                                                                    | ✅      |
| `features.spec.ts`   | Lọc dự án + `?service=`, lightbox ảnh/video, quay lại danh sách, reader học viên + deep link, blog, contact, partners                                     | ✅      |

Tổng: 114 đạt, 3 bỏ qua (các test chỉ áp dụng cho desktop hoặc mobile).

Ngoài ra em đã tự xem ảnh chụp từng trang và từng overlay ở cả desktop lẫn mobile. Theo đo đạc, chiều cao các trang lệch Figma trong khoảng 2px.

## 3. Quyết định em tự đưa ra (Figma chưa có)

- **Trang Blog tổng hợp `/blog` và trang 404/lỗi:** tự thiết kế, vì link "← Blogpost" trong bài viết cần có chỗ để quay về.
- **Footer:** thêm 5 link (Academy, Student Stories, Partners, Blogpost, Contact). Figma chỉ có "About".
- **Menu desktop:** mọi trang dùng chung một kích thước — cao 80px (+ viền 1px), logo và link thẳng mép cột nội dung 1192px, chữ ExtraBold — nên logo/menu không xê dịch khi chuyển trang. Figma Home (64px, thụt vào 48px, chữ Bold) đã được chỉnh theo các trang con theo yêu cầu; Home chỉ giữ nền gradient cam riêng và không tô màu link đang mở. Trang con tô cam link của trang đang mở.
- **Form đăng ký:** câu báo lỗi khi số điện thoại hoặc email sai định dạng, và khi gửi thất bại, là em tự viết.
- **Academy desktop:** bấm vào một dòng trong danh sách khóa học thì mở modal chương trình học (Figma không vẽ cách mở trên desktop).
- **Trang dự án:**
  - Bấm ảnh bìa mở lightbox ảnh. Riêng SPIN Awards mở video, vì dự án này không có album ảnh.
  - Nút "Xem toàn bộ album ảnh" mở lightbox.
- **Projects mobile:** các nút lọc xuống nhiều dòng như Figma (03/11; trước đó cuộn ngang).
- **About:** tên 5 năng lực của Hooked được gắn link sang Academy/Projects/Contact. Bỏ được trong `src/data/about.ts`.
- **About — "Xem full portfolio":** trỏ tới file PDF trên Google Drive, theo link có sẵn trong prototype Figma.
- **Bài blog:** em thêm link trong nội dung (tên dự án, đối tác, học viên). Nhãn và thời gian đọc trên trang Blog tổng hợp là em tự đặt.
- **Slug blog/dự án không tồn tại:** vẫn hiện trang 404 (có `noindex`), nhưng HTTP status là 200. Đây là hành vi của Next 16 khi bật `cacheComponents`; URL lạ bất kỳ khác thì trả đúng 404.

## 4. Còn lại / cần anh/chị quyết định

1. **Nơi nhận form đăng ký** (email, Google Sheet hay CRM?). Chỗ cần nối là `src/app/academy/actions.ts`, đã có TODO.
2. **Font Young Display** cho đoạn intro ở Home desktop: vẫn đang dùng font thay thế.
3. **Domain chính thức:** đặt `NEXT_PUBLIC_SITE_URL` để ảnh chia sẻ (Open Graph) có URL đúng.
4. **Dung lượng ảnh:** `public/` khoảng 59 MB vì giữ nguyên ảnh gốc từ Figma (có ảnh PNG 2550px). Next đã tự nén khi hiển thị, nhưng nên chuyển ảnh gốc sang JPG/WebP trước khi deploy để repo nhẹ hơn.
5. **Nội dung đang hard-code** trong `src/data/*`, mỗi trang một file, đã có type rõ ràng, nên dễ chuyển sang CMS sau này.
6. Các câu hỏi khác vẫn ở `plan/06-open-questions.md`.

## 5. Cấu trúc code

```
src/app/            route: academy, academy/students, projects, projects/[slug], about, blog, blog/[slug],
                    contact, partners, not-found, error
src/components/     ui (Button, Dialog, links, Icon…), layout (header, footer, 404), brand, và 1 thư mục cho mỗi trang:
                    home, academy, students, projects/{overview,detail}, about, blog, contact, partners
src/data/           nội dung từng trang (home, academy, students, projects, project-details, about, blog, contact, partners-page)
public/images/      ảnh theo trang (đã gộp ảnh trùng), public/icons/ icon SVG
tests/e2e/          bộ test Playwright (dùng Chrome có sẵn trên máy, không cần tải trình duyệt)
plan/               tài liệu plan + ảnh chụp màn hình
```
