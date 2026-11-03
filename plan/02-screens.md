# 02 · Screens & Routes

Khảo sát từ Figma file `a5ubAiUQAaKw76ja7OHdDA`, page **01 · WEBSITE / Screens & prototypes** (`0:1`).
Mỗi section có frame `Desktop · 1440` và `Mobile · 390` (Student Stories có thêm `Tablet · 1024 / Example`).
Ghi chú: nội dung nào không thấy trực tiếp trong Figma thì đánh dấu **(giả định)**.

## Quy ước chung (áp dụng mọi trang)

- **Shell**: `Navigation` (desktop 80px: logo trái + 6 link `HOME · ACADEMY · PROJECT · CONTACT · ABOUT · PARTNERS`, link active màu cam) → nội dung → `Footer` (580px desktop / 696px mobile).
  - Mobile/tablet (<1200): header 72px = logo + **nhãn trang hiện tại màu cam** (vd. "Academy", "Project", "About", "Contact", "Partners", "Blogpost") + icon hamburger → mở overlay `75 · Mobile navigation`.
  - Footer: `BUSINESS ENQUIRIES` + `hooked.vie@gmail.com ↗` + `0966 609 807` + `CÔNG TY TNHH HOOKED ENTERTAINMENT` + `Số 142B phố Đê La Thành, phường Văn Miếu - Quốc Tử Giám, TP Hà Nội`; cột `SOCIAL` (Facebook, Instagram, YouTube, TikTok); cột `COMPANY` (About); wordmark HOOKED lớn mờ; nền gradient đen → cam (#E55624) + grain.
- **Nền trang**: `00 · Background / Gradient + grain` (đen, grain, đáy chuyển cam vào footer).
- **Container**: 2 hệ lưới khác nhau:
  - Academy / Student Stories / Projects / Project detail: content 1192px, gutter 124px.
  - About / Contact / Partners / Blog: content 1344px, margin 48px (layout editorial lệch cột: cột trống 324px + cột đọc).
- Breakpoints đã biết: mobile 320–767, tablet 768–1199, desktop ≥1200.

## Bảng route

| #     | Màn hình            | Route đề xuất                          | Desktop frame                      | Mobile frame  |
| ----- | ------------------- | -------------------------------------- | ---------------------------------- | ------------- |
| 01    | Home                | `/`                                    | `141:2`                            | `2818:4694`   |
| 02    | Academy             | `/academy`                             | `2075:273`                         | `2818:4704`   |
| 03    | Student Stories     | `/academy/students` (alt: `/students`) | `2186:2455` (+ tablet `2830:5098`) | `2818:4714`   |
| 04    | Projects / Overview | `/projects`                            | `2226:364`                         | `2226:366`    |
| 05–09 | Project detail ×5   | `/projects/[slug]`                     | xem mục 05–09                      | xem mục 05–09 |
| 10    | About               | `/about`                               | `2553:3834`                        | `2553:3838`   |
| 11–13 | Blog post ×3        | `/blog/[slug]`                         | xem mục 11–13                      | xem mục 11–13 |
| 14    | Contact             | `/contact`                             | `2744:4688`                        | `2744:4738`   |
| 15    | Partners            | `/partners`                            | `2744:4786`                        | `2744:4836`   |

Slug đề xuất:

- Projects: `devoid-music-festival`, `spin-awards`, `xom-huc`, `frequency-arena`, `vui-fest-cat-ba`.
- Blog: `vui-fest-cat-ba`, `he-sinh-thai-hooked`, `spin-awards-xom-huc` (giả định — Figma không có slug; đã dùng trong `src/data/catalog.ts`).

Overlay (không phải route riêng, xem `03-states-behavior.md`): Registration modal, Course program modal, Student reader, Video lightbox, Photo lightbox, Mobile nav. Có thể deep-link bằng query param hoặc intercepting route (giả định).

---

## 01 · Home — `/`

Đã cover trong `05-home.md`.

---

## 02 · Academy — `/academy`

- Section `2815:4691`. Desktop `2075:273` (frame 1460×2830, có viền 10px; artboard thật là `2039:78` 1440×2810). Mobile `2818:4704`.
- Nav active: ACADEMY.

### Blocks (desktop, trên → dưới)

1. **Navigation** (`2039:79`).
2. **Heading "ACADEMY"** (`2071:222`) — chữ lớn căn giữa.
3. **Course carousel** (`2039:89` → instance `2083:87` của `Academy / Course carousel` `2082:375`, 7 slide):
   - Card lớn giữa: ảnh nền sân khấu tối, tên khóa (`DJ CƠ BẢN`), mô tả, meta 2 cột: `Giảng viên chính: Marcuz`, `Trợ giảng: J.Grayson`, `Lộ trình` / `Từ 2 đến 3 tháng`, `Giờ học` / `Sáng: 9h - 12h / Chiều: 13h - 18h`, `Thời lượng: 1 tiếng/ca`.
   - CTA pill trắng `Đăng ký ngay` + icon ↗ cam → mở Registration modal với khóa đang chọn.
   - Hai bên: preview khóa trước / sau (tên + thumbnail + nút ← / →). Slide 1 có preview trái = `Flip` (vòng lặp).
   - Pagination 7 chấm (chấm active dạng pill cam).
4. **All seven courses · Editorial index** (`2467:3671`):
   - Filter chips: `Tất cả` (active cam) · `DJ` · `MC` · `Producer` · `Flip`.
   - Header cột: `KHÓA HỌC` · `LỘ TRÌNH`.
   - 7 row (`Course / …`): số thứ tự cam `01`…`07`, tên (`DJ cơ bản`, `DJ toàn diện`, `MC cơ bản`, `MC toàn diện`, `Producer / HipHop · R&B · Ballad`, `Producer / EDM`, `Flip`), category nhỏ, lộ trình (`Từ 2 đến 3 tháng`, `Từ 4 đến 6 tháng`, `Từ 1 đến 2 tháng`, `Từ 3 đến 6 tháng`, `Tối thiểu 3 tháng` ×2, `Tối thiểu 2 tháng`), icon →.
5. **Học viên tiêu biểu** (`2071:194`): heading `HỌC VIÊN TIÊU BIỂU` + nút outline `Tất cả câu chuyện →` (→ Student Stories). Carousel `Academy / Student stories` (instance `2083:115`, nguồn `2082:376` trên page 03, 3 slide: JGRAYSON, Vatuz, KIMMY): card gradient cam bên trái (tên, `DJ · Hooked Academy`, headline, `Xem câu chuyện →`, nút ← →, icon quote) + portrait bên phải.
6. **Footer** (`2039:94`).

### Mobile (`2818:4704`)

- Header 72px (nhãn "Academy").
- `ACADEMY` heading trái.
- `Academy / Course carousel / Mobile` (7 slide, 390×~780): ảnh trên, counter `01 / 07`, nút ← →, tên, mô tả, meta, **2 CTA**: `Đăng ký ngay ↗` (cam, full width) và `Nội dung khóa học ↗` (tối) → mở Course program modal.
- `Tất cả khóa học` + chips + `Academy / Directory / Mobile` (variant theo Category; row có **thumbnail** khóa, tên in hoa, lộ trình).
- `HỌC VIÊN TIÊU BIỂU`: **không phải carousel** — 1 học viên tĩnh (JGRAYSON: portrait, tên, headline) + 2 nút `Xem câu chuyện ↗` (cam) và `Tất cả câu chuyện ↗` (tối).
- Footer mobile.

### Components

Navigation, CourseCarousel (desktop/mobile), FilterChip, CourseDirectoryRow, StoryCarousel (desktop) / FeaturedStudent (mobile), Button (pill/primary/secondary), Footer.

### Data

- `Course` (7 bản ghi — chi tiết đầy đủ trong overlay 71, xem `03-states-behavior.md`): `slug`, `title` (in hoa: `DJ CƠ BẢN`…), `indexTitle` (`DJ cơ bản`…), `category` (`DJ | MC | Producer | Flip`), `description`, `instructors {main, assistant?}`, `duration`, `schedule`, `sessionLength`, `tuition`, `modules[]`, `benefits[]`, `image`, `order`.
- `Student` (featured = 3 bản ghi đầu).

### Open questions

- Desktop không có nút "Nội dung khóa học" trên carousel; Course program modal mở từ đâu trên desktop? Có hover wrapper `Course / View full program` (`2437:3274`) trong library nhưng không thấy dùng trên screen. Đề xuất: click row directory (→) mở Course program modal (giả định).
- Desktop chỉ vẽ trạng thái filter `Tất cả`; danh sách sau khi lọc trên desktop chỉ suy ra từ mobile variants.
- Mobile thứ tự course image dùng lại ảnh concert/ảnh "HOOKED ACADEMY" placeholder cho Producer/Flip — cần ảnh thật?

---

## 03 · Student Stories — `/academy/students`

- Section `2846:5166`. Desktop `2186:2455`, Mobile `2818:4714`, Tablet example `2830:5098` (1024, dùng mobile header 72px, lưới 3 cột 928px).
- Nav active: ACADEMY (desktop), nhãn mobile "Academy".

### Blocks (desktop)

1. Navigation (`2189:2519`).
2. **Breadcrumbs** (`2189:2532`): `Home / Academy / Học viên tiêu biểu` (2 link đầu có hover).
3. **Intro** (`2189:2540`): H1 `Học viên tiêu biểu`, sub `Những câu chuyện từ cộng đồng học viên Hooked.`
4. **Grid header** (`2189:2544`): divider, trái `Tất cả câu chuyện`, phải `13 HỌC VIÊN`.
5. **Article grid** (`2189:2547`): 13 `Story` card 3 cột (381×520): ảnh portrait full-bleed + gradient tối đáy, eyebrow `01 / HOOKED`, icon ↗ tròn góc phải, tên (`JGRAYSON`…), role (`DJ · Hooked Academy` / `MC HYPE · Hooked Academy`), `Xem câu chuyện →`. Click → Student reader overlay.
   - Thứ tự: JGRAYSON, Vatuz, KIMMY, JUSTWANG, TOBI, AFTERGLOW, TIINIX, NORRIZ (DJ) · PUZZLE, MAMBO, SIMPLE, LIL'V, T14 (MC HYPE).
6. Footer (`2189:2596`).

### Mobile

Breadcrumb rút gọn `Academy / Học viên tiêu biểu`, H1 2 dòng, sub, `13 HỌC VIÊN` cam; grid **2 cột**: ảnh tách rời (không overlay text), dưới ảnh là tên, role, link `Xem câu chuyện` màu cam. Tablet: 3 cột (`Stories / Portrait card / Tablet` 293×456).

### Components

Breadcrumbs, StoryPortraitCard (desktop overlay / mobile stacked / tablet), StudentReader overlay.

### Data

`Student`: `slug`, `name`, `role` (`DJ` | `MC HYPE`), `affiliation` ("Hooked Academy"), `order`, `portrait`, `headline` (câu ngắn dùng ở carousel — vd. Vatuz: `Top 3 Xóm Húc 2024 và Á quân Spin Awards HipHop Edition 2025.`), `story` (đoạn dài trong reader), `featured: boolean`.

### Open questions

- Không có filter/pagination; 13 học viên tĩnh.
- Có cần URL riêng cho từng câu chuyện (SEO/share) không? Figma chỉ có overlay.

---

## 04 · Projects / Overview — `/projects`

- Section `2341:1602`. Desktop `2226:364`, Mobile `2226:366`.
- Nav active: PROJECT.

### Blocks

1. Navigation.
2. **Introduction** (`2226:381`) trên nền `Ambient stage light` (`2231:624`): H1 `Hooked Projects`.
3. **Filter chips**: `Tất cả` · `Event production` · `Artist management` · `Media` · `Music consultant` · `International artists booking` · `DJ Contest` (mobile wrap nhiều dòng).
4. **Project gallery** (instance `2226:384` của `Projects / FilteredGallery` `2221:3051`): card = poster có khung cam graffiti (ảnh baked có text "event production / DEVOID MUSIC FESTIVAL: NEW WORLD / 28.12.2024"), nút play tròn giữa, dưới là tên in hoa + ↗ + dòng services.
   - Desktop "Tất cả": bố cục editorial so le — hàng 1: Devoid (lớn, trái) + SPIN Awards (nhỏ, phải, lệch xuống); hàng 2: Frequency Arena (nhỏ, trái, lệch xuống) + Xóm Húc (lớn, phải); hàng 3: Vui Fest Cát Bà (panorama full width).
   - Mobile: 1 cột; **thứ tự khác desktop**: Devoid, SPIN, Xóm Húc, Frequency, Vui Fest.
   - Khi lọc: 1 cột full-width (xem `03-states-behavior.md`).
   - Play → Video lightbox; tên/↗ → `/projects/[slug]` (giả định: cả card click → detail, play → lightbox).
5. Footer.

### Data

`Project`: `slug`, `title` (card: `DEVOID MUSIC FESTIVAL`, `SPIN AWARDS`, `FREQUENCY ARENA FACE2FACE EDM BATTLE`, `“XÓM HÚC” DJ CONTEST`, `VUI FEST CÁT BÀ`), `services[]` (dòng tag), `categories[]` (cho filter), `poster` (thumbnail có khung cam), `cardFormat` (`Landscape | Portrait | Compact | Wide | Panorama | Mobile`), `featuredVideoId?`, `order`.

Mapping category ↔ project (từ tag + số card mỗi filter variant):

| Project               | Event production | Artist management | Media | Music consultant | Intl. artists booking | DJ Contest |
| --------------------- | ---------------- | ----------------- | ----- | ---------------- | --------------------- | ---------- |
| Devoid Music Festival | ✓                | ✓                 | ✓     | ✓                | ✓                     |            |
| SPIN Awards           | ✓                |                   | ✓     |                  |                       | ✓          |
| Frequency Arena       | ✓                | ✓                 | ✓     | ✓                |                       |            |
| Xóm Húc               | ✓                |                   | ✓     |                  |                       | ✓          |
| Vui Fest Cát Bà       | ✓                | ✓                 | ✓     | ✓                |                       |            |

### Open questions

- Nút play trên card mở video nào? (giả định: video recap chính của project; Xóm Húc không có video → `Overlay / Video / Unavailable`).
- Nhãn filter viết thường (`Event production`) khác tag trên card (`Event Production`), và `International artists booking` vs `International Artist Booking` → chuẩn hóa thành enum + label.

---

## 05–09 · Project detail — `/projects/[slug]`

Một template chung cho 5 project.

| Project                  | Section     | Desktop     | Mobile      |
| ------------------------ | ----------- | ----------- | ----------- |
| 05 Devoid Music Festival | `2846:5175` | `2226:365`  | `2226:367`  |
| 06 SPIN Awards           | `2846:5180` | `2327:1178` | `2327:3840` |
| 07 Xóm Húc               | `2846:5185` | `2327:1264` | `2327:3919` |
| 08 Frequency Arena       | `2846:5190` | `2327:1350` | `2327:3998` |
| 09 Vui Fest Cát Bà       | `2846:5195` | `2327:1436` | `2327:4077` |

### Blocks (Devoid làm mẫu, node ids của Devoid)

1. Navigation (PROJECT active).
2. **Back link** (`2437:4214`): `← Tất cả dự án` → `/projects`.
3. **Project heading** (`2226:559`): H1 tên in hoa + dòng services màu cam (`Event Production · Artist Management · Media · Music Consultant · International Artist Booking`).
4. **Project cover** (`2226:562`, 1192×620): 5 layer `Selected project photo 1..5` chồng nhau (cover có thể đổi ảnh — giả định: chọn ảnh từ album/crossfade; chỉ layer 1 có hover wrapper → click mở Photo lightbox (giả định)). SPIN dùng instance `Projects / Cover / SPIN Awards`; Xóm Húc dùng poster khung cam làm cover.
5. **Về dự án** (`2226:568`): 2 cột `Đối tác` (danh sách) và `Dịch vụ cung cấp` (danh sách), rồi `Mô tả dự án` (đoạn văn).
6. **Ảnh & video** (`2226:580` → `Mixed media / Masonry` `2407:1653`): masonry 3 cột (mobile 2 cột) trộn `GalleryPhoto` và `VideoCard` (thumbnail + play, tiêu đề in hoa, ↗, `Xem video`). Dưới cùng link chữ nhỏ `Xem toàn bộ album ảnh` (SPIN: `Xem toàn bộ video SPIN Awards`).
7. **Return** (`2437:4243`): `Tất cả dự án ↗` (full width, ↗ phải).
8. Footer.

### Nội dung từng project (đọc từ screenshot)

- **Devoid Music Festival** — Đối tác: NOXX, Ticketmelon, Not Fun Media, Best EDM Beats, Best EDM Drops, EDless Rave, Ultra Vietnam Team, Uni Specs. Dịch vụ: Event Production, Artist Management, Media, Music Consultant, International Artist Booking. Mô tả: "Devoid Music Festival là series sự kiện được tổ chức bởi Hooked Entertainment… bộ đôi DJ quốc tế Matisse & Sadko." Media: 4 ảnh + 2 video (`UJvCMG7W6q8` "DEVOID MUSIC FESTIVAL CHAPTER #3: NEW WORLD - Recap by Not Fun Media", `rwY_5DMDL18` "MATISSE & SADKO LIVE SET AT NOXX CITI, HANOI (28.12.2024)").
- **SPIN Awards** — tag: Media · Event Production · DJ Contest. Đối tác: WEEKND, Jagermeister, Mad Mask Music Academy, Hanoi Spinning Space. Mô tả: "Cuộc thi DJ chuyên nghiệp với quy mô toàn quốc… Vinaphone (mùa 1) và Jagermeister (mùa 2)…". Media: **6 video, 0 ảnh** (`I7A5KptHPgw`, `PzwmcJ661fc`, `gEANpJs5vZ0`, `PdYnmncGQOg`, `ESf1PwqkLuM`, `-xmEKB-IR6M`; tiêu đề vd. "TYNDOLCE - Team Gaztik - Chung Kết I SPIN Awards Hip-hop Edition"). Link `Xem toàn bộ video SPIN Awards` (→ kênh YouTube, giả định).
- **Xóm Húc** — tiêu đề `“XÓM HÚC” DJ CONTEST`, tag: Media · Event Production · DJ Contest. **Không có cột Đối tác** (frame `2327:1292` tồn tại nhưng bị ẩn; `Dịch vụ cung cấp` chiếm vị trí cột trái). Mô tả: "Cuộc thi DJ "ao làng" với sự tham gia của các học viên của Hooked…". Media: 4 ảnh poster (khung cam), **0 video**.
- **Frequency Arena** — tiêu đề `FREQUENCY ARENA FACE2FACE EDM BATTLE`, tag: Event Production · Artist Management · Media · Music Consultant. Đối tác: NOXX. Mô tả: "Frequency Arena - Face2Face EDM Battle là series sự kiện chuyên về Face2Face trong lồng sắt…". Media: 4 ảnh + 3 video (`SOTPf9y6peo`, `paDDzE7QfI4`, `8nDhAC2jDsQ`).
- **Vui Fest Cát Bà** — tag: Event Production · Artist Management · Media · Music Consultant. Đối tác: Golden Sky Media - Sun Group. Mô tả: "Đảm nhận vai trò phụ trách toàn bộ chương trình biểu diễn nghệ thuật… đối tác tầm cỡ Sun Group." Media: 4 ảnh + 2 video (`EmbpvTQbrCs` "HOOKED @ VUI-Fest Cat Ba I RECAP VIDEO", `iEmG7dcKxm8` "HOOKED: "Chúng tôi muốn biến VUI FEST CÁT BÀ trở thành điểm đến đáng nhớ xuyên suốt mùa hè này"").

### Mobile

Cùng thứ tự block; H1 wrap 2 dòng; tags cam wrap; cover 342×~192–300; Đối tác & Dịch vụ xếp dọc, chữ lớn hơn (~20px); masonry 2 cột; `Xem toàn bộ album ảnh`, `Tất cả dự án ↗`.

### Components

BackLink, ProjectHeading, ProjectCover, InfoList (Đối tác / Dịch vụ), MasonryGallery, GalleryPhoto, VideoCard, TextLink, Footer + overlays VideoLightbox / PhotoLightbox.

### Data

`Project` (mở rộng): `detailTitle`, `services[]`, `partners[]` (có thể rỗng), `description`, `cover` (hoặc `coverImages[]` nếu cover luân phiên), `media[]` = `{ type: 'photo', src, alt } | { type: 'video', youtubeId, title, thumbnail }`, `albumLink? {label, href}`.

### Open questions

- 5 layer cover: ảnh cover có tự đổi (slideshow) hay đổi khi click ảnh trong album? Figma không có variant thể hiện.
- `Xem toàn bộ album ảnh` dẫn đi đâu (Facebook album / Google Drive / mở lightbox)?
- Frequency có 5 frame photo lightbox (`…/Frequency/05`) nhưng gallery chỉ có 4 ảnh (+ cover?) → cần xác nhận số ảnh.

---

## 10 · About — `/about`

- Section `2644:7318`. Desktop `2553:3834`, Mobile `2553:3838`. Nav active: ABOUT.
- Composition `About / Aino / New page composition` (`2683:4689`, container 1344).

### Blocks

1. Navigation.
2. **Introduction** (`2684:4689`): label `ABOUT HOOKED`; statement lớn "Với những ai theo dõi âm nhạc điện tử lâu năm tại Việt Nam, HOOKED có lẽ không còn là cái tên quá xa lạ."; block offset 4-column (`2684:4691`): eyebrow `TỪ TINH THẦN` / `SUPPORT LOCAL ARTIST`, 2 cột văn bản ("Với tinh thần "support local artist", Hooked Management…" và "Bất cứ nơi nào có âm nhạc chất lượng…").
3. **Photography · Stage to artists** (`2685:4689`): ảnh lớn Devoid full stage (905×603) + diptych dọc (1 ảnh trên, 2 ảnh dưới).
4. **Ecosystem statement** (`2685:4691`): eyebrow `MỘT HỆ SINH THÁI / CHO NGHỆ SĨ VIỆT`; statement "Hooked vẫn giữ vững tinh thần từ những ngày đầu tiên nhưng với một diện mạo hoàn toàn mới - …"; cột trái đoạn mô tả + link cam `Xem full portfolio ↗` (→ `/projects`, giả định); cột phải danh sách đánh số 01–05 (lead in đậm): `Đào tạo chuyên môn & định hướng hình ảnh`, `Kết nối, phát triển cộng đồng`, `Cung cấp giải pháp hình ảnh chuyên nghiệp`, `Tổ chức những lễ hội âm nhạc điện tử`, `Cung cấp DJ, MC Hype`.
5. **Photography · Live experience** (`2685:4698`): hàng ảnh lớn + ảnh dọc, hàng 2 ảnh ngang (gallery tĩnh, không thấy hover/lightbox).
6. Footer.

### Mobile

Thêm eyebrow cam `SUPPORT LOCAL ARTIST` dưới `ABOUT HOOKED`; mọi khối xếp 1 cột; ảnh xếp 1 cột / 2 cột nhỏ.

### Data

Nội dung tĩnh (hard-code hoặc `page.about` trong CMS). Ảnh dùng lại ảnh project.

### Open questions

- Ảnh trên About có clickable (lightbox) không? Không có hover/overlay tương ứng → coi là tĩnh.

---

## 11–13 · Blog post — `/blog/[slug]`

| Bài                                                                                       | Section     | Desktop     | Mobile      |
| ----------------------------------------------------------------------------------------- | ----------- | ----------- | ----------- |
| 11 Hooked Entertainment × Sun Group: Bệ Phóng Đưa Nghệ Sĩ Trẻ Ra Sân Khấu Vui Fest Cát Bà | `2553:3833` | `2553:3835` | `2553:3839` |
| 12 HỆ SINH THÁI HOOKED: ĐỊNH HÌNH LẠI MÔ HÌNH ĐÀO TẠO ÂM NHẠC ĐIỆN TỬ                     | `2846:5208` | `2553:3836` | `2553:3840` |
| 13 Spin Awards & Xóm Húc - Những Giải Đấu Nâng Tầm Cộng Đồng DJ                           | `2846:5213` | `2553:3837` | `2553:3841` |

Desktop nav: không có link nào active (không có mục Blog trên nav). Mobile nhãn: "Blogpost".

### Blocks (node ids của bài 11)

1. Navigation (`2711:4691`).
2. **Article heading** (`2712:4695`): link nhỏ cam `← Blogpost`, H1 (Manrope bold, 2 dòng).
3. **Introduction & cover · Dovetail** (`2712:4696`): trái 600px đoạn intro (+ CTA inline tùy bài), phải ảnh hero 664px.
4. **Reading layout** (`2712:4699`): cột đọc 760px lệch phải (offset 324px): paragraph, paragraph có lead-in đậm ("**Điểm chạm Nghệ thuật:** …"), H2 đánh số (bài 13: "1. Xóm Húc - Sân Chơi "Ao Làng" Đẩy Bứt Phá Cho Học Viên", "2. Spin Awards - Đỉnh Cao Cọ Xát & Khẳng Định Bản Thân"), `CMS / Photography pair` (2 ảnh cạnh nhau), CTA link cam có ↗.
5. Footer.

CTA links theo bài:

- Bài 11: `Tìm hiểu thêm về Vui Fest Cát Bà ↗` (intro), `Tìm hiểu các khóa học tại Hooked ↗`, `Xem recap Vui Fest Cát Bà ↗`.
- Bài 12: `Tìm hiểu các khóa học tại Hooked ↗`, `Khám phá khóa học DJ & MC tại Hooked ↗`.
- Bài 13: `Xem Xóm Húc trên YouTube ↗`, `Xem Spin Awards trên YouTube ↗`.

### Mobile

1 cột: back link, H1 4 dòng, intro, CTA (full width, ↗ phải), ảnh hero, body, photography pair xếp dọc.

### Data

`BlogPost`: `slug`, `title`, `intro`, `introCta?`, `heroImage`, `body: Block[]` với `Block = paragraph (rich text: bold) | heading | imagePair | ctaLink {label, href, external}`, `carousel {title, subtitle, artwork}` cho Home blog carousel (vd. `VUI FEST CÁT BÀ` / `Hooked × Sun Group` / `Bệ phóng cho nghệ sĩ trẻ`; `HỆ SINH THÁI HOOKED` / `Định hình lại mô hình đào tạo âm nhạc điện tử`), `publishedAt?` (không hiển thị).

### Open questions

- **Không có trang danh sách Blog** trong Figma. `← Blogpost` dẫn đi đâu? Đề xuất: `/#blog` (section Blog carousel ở Home) (giả định).
- Link CTA đích: Vui Fest → `/projects/vui-fest-cat-ba`, khóa học → `/academy`, recap/YouTube → external (giả định).
- Typography: Blog carousel ở Home dùng Inter, nhưng trang bài viết dùng Manrope (theo ảnh) — xác nhận.

---

## 14 · Contact — `/contact`

- Section `2744:4687`. Desktop `2744:4688`, Mobile `2744:4738`. Nav active: CONTACT.

### Blocks

1. Navigation.
2. **Hero** (`2745:4691`): eyebrow cam `CONTACT HOOKED`, H1 `Liên hệ Hooked.`, email rất lớn `hooked.vie@gmail.com` (màu muted) + mũi tên ↗ cam lớn bên phải (`Contact / Email link` `2745:4694`, `mailto:`).
3. **Details** (`2745:5944`) 3 cột: `GỌI HOOKED` → `0966 609 807` (`tel:`); `ĐỊA CHỈ` → `CÔNG TY TNHH HOOKED ENTERTAINMENT` + địa chỉ; `KẾT NỐI` → Facebook, Instagram, YouTube, TikTok.
4. Footer (lặp lại cùng thông tin).

### Mobile

Xếp dọc toàn bộ; email ~26px + ↗.

### Data

`SiteSettings`: `email`, `phone`, `companyName`, `address`, `socials[] {label, url}`.

### Open questions

- **Không có contact form** — trang chỉ là thông tin. Form duy nhất trên site là Registration (Academy).
- URL thật của Facebook/Instagram/YouTube/TikTok chưa có trong Figma.

---

## 15 · Partners — `/partners`

- Section `2744:4785`. Desktop `2744:4786`, Mobile `2744:4836`. Nav active: PARTNERS.

### Blocks

1. Navigation.
2. **Introduction** (`2746:4707`): label cam `PARTNERS` cột trái; cột phải (`2746:4709`) H1 in hoa `HOOKED ENTERTAINMENT ĐỒNG HÀNH CÙNG CÁC THƯƠNG HIỆU LỚN` + đoạn "Hơn cả một academy, Hooked Entertainment là cầu nối thực chiến…".
3. **Logo wall** (`2747:4691`): 1 hàng 4 logo trắng — Not Fun Media, WEEKND, Sun Group, Jägermeister (mobile lưới 2×2).
4. **Collaborations** (`2749:4691`): 2 card (656px) — ảnh, tên (`Vui Fest Cát Bà`, `Frequency Arena`), ↗ cam, dòng đối tác (`Golden Sky Media - Sun Group`, `NOXX`). Click → project detail tương ứng (giả định).
5. Footer.

### Data

`Partner`: `name`, `logo` (SVG trắng), `order`. `Collaboration`: `projectSlug`, `image`, `title`, `partnerLabel` (có thể derive từ `Project.partners`).

### Open questions

- Logo partner cần file vector gốc (hiện chỉ có trong Figma dạng ảnh).
- Logo có link ra ngoài không? Không có hover state → coi là tĩnh.
