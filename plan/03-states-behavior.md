# 03 · States & Behavior

Nguồn: page **01 · WEBSITE** (sections Overlays 70–75, Runtime 90.0–90.5), page **03 · BEHAVIOR / States & QA** (`2204:2495`), page **02 · LIBRARY** (sections INTERNAL 80–82).
Những điểm không có trong Figma được đánh dấu **(giả định)**.

## Quy ước overlay chung

Mọi overlay desktop đều vẽ trong frame 1440×900 gồm **backdrop đen** (layer `Dismiss backdrop` → click ra ngoài để đóng) + dialog bo góc nền `#1A1A1A`/warm, viền mảnh. Mobile vẽ trong frame 390×844.
Hành vi chung đề xuất (giả định, Figma không vẽ): khóa scroll body khi mở, `Esc` để đóng, focus trap, trả focus về trigger khi đóng, `role="dialog"` + `aria-modal`.

| Overlay                            | Section     | Desktop                       | Mobile                                 |
| ---------------------------------- | ----------- | ----------------------------- | -------------------------------------- |
| Registration (6 state)             | `2341:1603` | dialog 1040×744 có panel trái | full-screen sheet, không có panel trái |
| Course program (×7)                | `2494:3835` | dialog 1120×792, 2 cột        | full-screen + sticky bottom bar        |
| Student reader (×13)               | `2815:4693` | dialog 1120×482, ảnh trái     | full-screen                            |
| Video lightbox (×13 + Unavailable) | `2363:1626` | dialog 1120×758               | dialog 358px giữa màn hình             |
| Photo lightbox (×17)               | `2384:1765` | dialog 945×774                | dialog 358px giữa màn hình             |
| Mobile navigation                  | `2374:1678` | —                             | panel 390×540                          |

---

## 1. Registration — state machine (`70 · OVERLAYS / Registration states`, `2341:1603`)

Form "Đăng ký tư vấn" cho khóa học. Đây là **form duy nhất** trên site (trang Contact không có form).

### Frames

| State   | Desktop     | Mobile      |
| ------- | ----------- | ----------- |
| Default | `2039:249`  | `2455:5374` |
| Focus   | `2455:5375` | `2455:5376` |
| Error   | `2455:5377` | `2455:5378` |
| Ready   | `2455:5379` | `2455:5380` |
| Loading | `2455:5381` | `2455:5382` |
| Success | `2455:5383` | `2455:5384` |

### Nội dung (copy chính xác)

- Panel trái (chỉ desktop, `Course / Context` 352px, ảnh không khí concert mờ): `HOOKED ACADEMY` (cam) · `Hành trình âm nhạc bắt đầu từ đây.` · divider · `KHÓA HỌC BẠN CHỌN` · tên khóa (vd. `DJ CƠ BẢN`) · `Sau khi gửi, Hooked sẽ liên hệ để tư vấn lộ trình và lịch học phù hợp.`
- Form: H `Đăng ký tư vấn` · `Để lại thông tin để Hooked đồng hành cùng bạn chọn khóa học phù hợp.` · nút `×` (góc phải).
  - `Khóa học quan tâm` — selector (`Course / Selector`) hiển thị khóa đang chọn + chevron cam. Danh sách 7 option ẩn sẵn trong frame (`Course / Seven options` `2455:5991`): `DJ CƠ BẢN`, `DJ TOÀN DIỆN`, `MC CƠ BẢN`, `MC TOÀN DIỆN`, `PRODUCER (HIPHOP / R&B / BALLAD)`, `PRODUCER (EDM)`, `FLIP`.
  - `Họ và tên *` — placeholder `Nhập họ và tên`.
  - `Số điện thoại *` — placeholder `Nhập số điện thoại`.
  - `Email (không bắt buộc)` — placeholder `ban@email.com`.
  - Nút cam full width `Gửi đăng ký tư vấn`.
  - Footnote `Hooked sử dụng thông tin này để tư vấn khóa học bạn chọn.` + cam `Chưa cần thanh toán ở bước này.`

### Các state

| State       | Mô tả quan sát được                                                                                                                                                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Default** | Field rỗng, placeholder xám, viền `#3A3A3A`. Course đã được pre-select theo trigger (DJ CƠ BẢN trong mẫu). Nút submit trông **enabled**.                                                                                                                                                               |
| **Focus**   | Field `Họ và tên` có viền cam 2px (accent).                                                                                                                                                                                                                                                            |
| **Error**   | Field `Họ và tên` và `Số điện thoại` viền đỏ-cam nhạt, text lỗi nhỏ dưới field: `Vui lòng nhập họ và tên.` / `Nhập số điện thoại để Hooked liên hệ.` Email không lỗi.                                                                                                                                  |
| **Ready**   | Field đã điền: `Người học Hooked`, `090 123 4567`; email trống. Nhìn giống Filled; nút không đổi.                                                                                                                                                                                                      |
| **Loading** | Như Ready nhưng label nút đổi thành `Đang gửi thông tin...` (giả định: disable nút + field, aria-busy).                                                                                                                                                                                                |
| **Success** | Dialog thu gọn (`2455:6353`, 760×592 desktop, không còn panel trái và **không có nút ×**): icon ✓ trong vòng tròn cam · `Đã nhận thông tin của bạn.` · `Hooked sẽ liên hệ để tư vấn lộ trình và lịch học phù hợp với bạn.` · `KHÓA HỌC BẠN QUAN TÂM` · tên khóa · nút cam `Tiếp tục khám phá Academy`. |

### Transitions

```mermaid
stateDiagram-v2
  [*] --> Default: mở modal (course preselected)
  Default --> Focus: focus field
  Focus --> Default: blur (rỗng)
  Focus --> Ready: các field bắt buộc hợp lệ
  Default --> Error: submit khi thiếu field bắt buộc
  Focus --> Error: submit khi thiếu/không hợp lệ
  Error --> Focus: sửa field
  Error --> Ready: field hợp lệ
  Ready --> Loading: bấm "Gửi đăng ký tư vấn"
  Loading --> Success: API OK
  Loading --> SubmitError: API lỗi (giả định, chưa có design)
  SubmitError --> Ready: thử lại
  Success --> [*]: "Tiếp tục khám phá Academy" / backdrop
  Default --> [*]: × / backdrop / Esc
  Error --> [*]: × / backdrop / Esc
  Ready --> [*]: × / backdrop / Esc
```

- Đổi khóa trong selector → cập nhật cả `KHÓA HỌC BẠN CHỌN` ở panel trái và khóa ở Success (selected-course behavior, theo handoff "Device-paired form states and selected-course behavior").
- Field-level states trong library (`82 · INTERNAL`, `2494:4748`): mỗi field có `State=Default | Focus | Error | Filled`, 2 width (608 desktop, 342 mobile). Field Email cũng có variant `Error` → validate định dạng email khi có nhập (giả định; chưa có copy lỗi email).

### Validation (đề xuất)

- `Họ và tên`: required, trim. Lỗi: `Vui lòng nhập họ và tên.`
- `Số điện thoại`: required, định dạng số VN 10 số (giả định). Lỗi: `Nhập số điện thoại để Hooked liên hệ.` (copy lỗi định dạng sai chưa có).
- `Email`: optional, validate format nếu có (copy lỗi chưa có).
- Validate on submit, sau đó re-validate on change (giả định).

### Trigger

- Academy course carousel `Đăng ký ngay` (desktop + mobile) → khóa của slide hiện tại.
- Course program modal `Đăng ký tư vấn` → khóa của modal.
- Các CTA đăng ký trên Home (xem `05-home.md`) (giả định).
- `Tiếp tục khám phá Academy` → đóng modal; nếu đang không ở `/academy` thì điều hướng tới `/academy` (giả định).

### Thiếu trong design

Submit-error (mạng/server), chống double-submit, trạng thái disabled của nút, dropdown course **open** state không có frame riêng (chỉ có list ẩn + hover wrappers `Registration / Selected course` `2437:4990`, `Course choice 1..3` `2437:5004`…), backend/endpoint nhận lead chưa xác định.

---

## 2. Course program modal (`71 · OVERLAYS / Course programs`, `2494:3835`)

| Khóa                             | Desktop    | Mobile      |
| -------------------------------- | ---------- | ----------- |
| DJ CƠ BẢN                        | `2294:783` | `2452:4297` |
| DJ TOÀN DIỆN                     | `2294:817` | `2452:4444` |
| MC CƠ BẢN                        | `2294:851` | `2452:4566` |
| MC TOÀN DIỆN                     | `2294:885` | `2452:4689` |
| PRODUCER (HIPHOP / R&B / BALLAD) | `2294:919` | `2452:4829` |
| PRODUCER (EDM)                   | `2294:953` | `2452:4957` |
| FLIP                             | `2294:987` | `2452:5083` |

### Layout

- **Desktop** (`Program & benefits / Dialog` 1120×792): eyebrow `HOOKED ACADEMY / KHÓA HỌC`, tên khóa, nút outline `Đóng ×`.
  - Cột trái `Program / Scroll area` (672×554, **scroll nội bộ**): mô tả → `Chương trình học` (module đánh số cam `01`… + divider) → `Quyền lợi học viên` (✓ cam). Hint dưới: `Cuộn để xem đầy đủ chương trình và quyền lợi`.
  - Cột phải `Course / Summary` (336px, nền warm): `Học phí` · giá lớn · `Chi phí chưa bao gồm 8% VAT` · divider · `Giảng viên` · `Lộ trình` · `Giờ học` · nút cam `Đăng ký tư vấn` · `Đăng ký tư vấn, chưa cần thanh toán.`
- **Mobile**: full-screen; header `HOOKED ACADEMY` + tên + nút `×`; vùng scroll gồm các mục `Tổng quan`, `Chương trình học`, `Quyền lợi học viên`, `Giảng viên`, `Lộ trình`, `Giờ học` (dạng text list, không đánh số); **sticky bottom bar**: giá + `Chưa gồm 8% VAT` + nút `Đăng ký tư vấn`.

### Behavior

- Mở từ: mobile `Nội dung khóa học` trên course carousel; desktop — **chưa rõ** (đề xuất: click row trong directory, giả định).
- `Đăng ký tư vấn` → mở Registration với khóa này (thay thế modal hiện tại, không stack — giả định).
- Đóng: `Đóng ×` / `×` / backdrop (`Dismiss course details`).

### Dữ liệu khóa học (đọc từ Figma)

| Khóa                             | Học phí        | Giảng viên                           | Lộ trình          | Giờ học                                                    | Modules                                                                                                                                                                                                                         | Quyền lợi (thấy được)                                                                                           |
| -------------------------------- | -------------- | ------------------------------------ | ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| DJ CƠ BẢN                        | 15.000.000 VND | Chính: Marcuz · Trợ giảng: J.Grayson | Từ 2 đến 3 tháng  | Sáng: 9h - 12h / Chiều: 13h - 18h · Thời lượng: 1 tiếng/ca | Lý thuyết cơ bản; Sử dụng phần mềm; Setup thiết bị; Cue/Tempo/Loop cơ bản; Mixing cơ bản                                                                                                                                        | Học 1:1 cùng với giảng viên; Cung cấp data nhạc học tập; Tham gia sự kiện & workshop chuyên môn                 |
| DJ TOÀN DIỆN                     | 28.000.000 VND | Marcuz · J.Grayson                   | Từ 4 đến 6 tháng  | như trên                                                   | 5 module trên (05 = Mixing cơ bản & nâng cao) + Mashup/Edit (đặc quyền khóa DJ toàn diện).                                                                                                                                      | Học 1:1 cùng với giảng viên; Cung cấp data nhạc học tập                                                         |
| MC CƠ BẢN                        | 15.000.000 VND | Lil'Bee · Mambo                      | Từ 1 đến 2 tháng  | Chiều: 18h - 20h30 · Từ thứ 3 đến Chủ nhật                 | Tổng quan nghề MC Hype; Cấu trúc bài nhạc; Đếm nhịp bắt khuôn; Luyện hơi; Tìm hiểu hype up với nhiều thể loại nhạc; Học diễn xuất trước ống kính; Phong cách trình diễn trên sân khấu                                           | Tham gia sự kiện & workshop chuyên môn                                                                          |
| MC TOÀN DIỆN                     | 28.000.000 VND | Lil'Bee · Mambo                      | Từ 3 đến 6 tháng  | như MC CƠ BẢN                                              | Tổng quan nghề MC Hype; Nhạc lý cơ bản; Sử dụng giọng nói cho MC; Phong thái & hình thể biểu diễn; Thực hành hoạt náo & xử lý tình huống; Các nhánh MC khác (MC sự kiện, MC hype chuyên nghiệp....).                            | Cấp chứng chỉ chính thức Hooked; Tham gia sự kiện & workshop chuyên môn                                         |
| PRODUCER (HIPHOP / R&B / BALLAD) | 35.000.000 VND | Chính: FLOWZ                         | Tối thiểu 3 tháng | Thời lượng: 2h/ca · Linh động theo lịch của học viên       | 10 module thấy được: Giới thiệu & Làm quen với Ableton Live; Tạo Beat & Drum; Nhạc lý & Hòa âm; Nhạc cụ & Sample; Warping & Remix; Plugin & Sound Design; Cấu trúc & Phát triển bài nhạc; Thu âm (Recording); Mixing; Mastering | (bị che bởi vùng scroll — cần lấy từ Figma)                                                                     |
| PRODUCER (EDM)                   | 35.000.000 VND | Chính: MINDFREAK                     | Tối thiểu 3 tháng | 2h/ca, 3 buổi/tuần · Linh động theo lịch của học viên      | Giới thiệu & Làm quen với Ableton Live; Make Beat & Xây dựng cấu trúc bài nhạc; Nhạc lý & Hòa âm; MIDI, VST & Hoàn thiện bài nhạc; Sound Design; Mixing & Mastering; Hoàn thiện sản phẩm cuối khóa                              | Học 1:1 cùng với giảng viên MindFreak                                                                           |
| FLIP                             | 12.000.000 VND | Chính: MINDFREAK                     | Tối thiểu 2 tháng | 2h/ca, 3 buổi/tuần · Linh động theo lịch của học viên      | Làm quen với DAW (Ableton Live/FL Studio); Drum Beat & Phân tích bài nhạc; Nhạc lý ứng dụng; Flip & Hoàn thiện bài nhạc; Giới thiệu Mixing & Mastering                                                                          | Học 1:1 cùng với giảng viên MindFreak; Tips & Tricks thực chiến từ Mentor.; Phát triển tư duy sản xuất âm nhạc. |

Ghi chú: mô tả của DJ TOÀN DIỆN trùng nguyên văn DJ CƠ BẢN (có thể là copy placeholder — cần xác nhận).

---

## 3. Student reader (`72 · OVERLAYS / Student readers`, `2815:4693`)

- 13 học viên × desktop/mobile. Ví dụ JGRAYSON: desktop `2097:62`, mobile `2819:4718` (instance của `Stories / Reader / Mobile` `2815:4714`). Các desktop khác: Vatuz `2293:626`, KIMMY `2293:641`, JUSTWANG `2293:656`, TOBI `2293:671`, AFTERGLOW `2293:686`, TIINIX `2293:703`, NORRIZ `2293:718`, PUZZLE `2293:733`, MAMBO `2293:748`, SIMPLE `2293:763`, LIL'V `2293:778`, T14 `2293:793`.
- **Desktop** (`Story popup / Article` 1120×482): portrait 400×480 trái; phải: tên lớn, nút outline `Đóng ×` (`Academy / Button / Secondary`), role `DJ · Hooked Academy`, đoạn câu chuyện (vd. "Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, J Grayson bứt phá mạnh mẽ…").
- **Mobile**: full-screen; header `HỌC VIÊN TIÊU BIỂU` + `Đóng ×`; portrait; tên; role màu cam; câu chuyện.
- Trigger: click card ở Student Stories; `Xem câu chuyện →` ở Academy story carousel (desktop) / featured student (mobile).
- Đóng: `Đóng ×` / backdrop (`Story popup / Dismiss backdrop`).
- **Không có** prev/next giữa các học viên trong reader.

---

## 4. Video lightbox (`73 · OVERLAYS / Video lightboxes`, `2363:1626`)

- Desktop (`Video player / Dialog` 1120×758): thanh tiêu đề (tiêu đề video in hoa + nút tròn `×` nền kem), vùng `YouTube embed / <id>` 1120×630 (16:9, mẫu hiển thị thumbnail + nút play), thanh dưới `Xem trên YouTube ↗` (link ra YouTube).
- Mobile: dialog ~358px giữa màn hình, cùng cấu trúc.
- Mapping video ↔ project (từ `07 · ASSETS / Original project media` `2335:1380`):
  - Devoid: `UJvCMG7W6q8` (`2363:1627`/`2363:1644`), `rwY_5DMDL18` (`2363:1661`/`2363:1678`)
  - SPIN Awards: `PzwmcJ661fc`, `gEANpJs5vZ0`, `PdYnmncGQOg`, `ESf1PwqkLuM`, `I7A5KptHPgw`, `-xmEKB-IR6M`
  - Frequency Arena: `SOTPf9y6peo`, `paDDzE7QfI4`, `8nDhAC2jDsQ`
  - Vui Fest Cát Bà: `EmbpvTQbrCs`, `iEmG7dcKxm8`
  - Xóm Húc: không có video.
- **Unavailable state** (`2226:884` desktop / `2226:905` mobile): không có dialog, text giữa màn hình: `Video đang được cập nhật.` · `Video dự án sẽ hiển thị tại đây khi được bổ sung.` · `← Quay lại dự án` (đóng overlay). Dùng khi project/video chưa có YouTube ID (giả định: nút play trên card Xóm Húc).
- Trigger: nút play trên project card (Projects overview), `VideoCard` trong album project detail.
- Đề xuất: render thumbnail + play, chỉ mount `<iframe>` YouTube khi user bấm play (lite embed); dừng video khi đóng.

---

## 5. Photo lightbox (`74 · OVERLAYS / Photo lightboxes`, `2384:1765`)

- Frames: Devoid 01–04 (`2384:1766`…), Xóm 01–04 (`2384:1960`…), Frequency 01–05 (`2384:2154`…), Vui 01–04 (`2384:2394`…); mỗi frame có bản Mobile.
- Desktop (`Photo viewer / Dialog` 945×774): tiêu đề = tên project (`DEVOID MUSIC FESTIVAL`), nút `×`; ảnh 945×630; thanh điều hướng: nút tròn `‹` trái, counter `1 / 4` giữa, nút tròn `›` phải.
- Mobile: dialog ~358px, cùng cấu trúc.
- Trigger: click `GalleryPhoto` trong album (và có thể cover ảnh — giả định).
- Chưa rõ: hết ảnh thì loop hay disable nút? (giả định: loop). Swipe trên mobile, phím ←/→ (giả định).
- SPIN Awards không có photo lightbox (album chỉ có video).

---

## 6. Navigation

### 6.1 Shared navigation (`90.0 · RUNTIME / Shared navigation`, `2815:4692`)

- Symbol `Website / Navigation / Mobile` (`2815:4703`, 390×72): logo trái, nhãn trang hiện tại (cam) + icon list (hamburger). Dùng cho cả tablet (`2830:5099` 1024×72).
- Desktop: 6 link, active = cam; hover = cam (QA 91).
- Lưu ý: Home desktop nav cao 64px, logo x=148 (`142:3`), các trang khác 80px, logo x=124 → cần thống nhất (giả định: dùng 80px).

### 6.2 Mobile navigation overlay (`75 · OVERLAYS / Mobile navigation`, `2374:1678`, frame `2226:920`)

- Panel 390×540 nền tối: icon `×` trên trái, 6 link chữ lớn: `Home`, `Academy`, `Project`, `About`, `Partners`, `Contact` (link active cam — mẫu: Project).
- **Thứ tự khác desktop** (desktop: Home, Academy, Project, Contact, About, Partners).
- Behavior (giả định): mở bằng hamburger; đóng bằng ×, chọn link, Esc, click ra ngoài; khóa scroll.

---

## 7. Carousels & motion

### 7.1 Home hero carousel (`90.1`, `2494:3832`)

- Desktop `Home / Hero carousel` `2484:4252` (Slide=1..5, 1440×841); mobile `2820:4923` (Slide=1..5, 390×520). Instance trên Home tên `Hero / Autoplay 5s / Live` → **autoplay 5s**, loop (giả định). Chi tiết: `05-home.md`.
- `Home / Text marquee` `2484:3859` và `Home / Logo marquee` `2484:3992`: variant `Phase=Start/End` → marquee chạy vô hạn.
- `Home / Services drag carousel` `2485:4069`: `Position=Start/End` → kéo ngang (drag/scroll-snap). Card mobile `Home / Service card / Mobile` `2825:5038`.

### 7.2 Academy course carousel (`90.2`, `2494:3833`)

- Desktop `2082:375`: `Slide=1..7` (1392×608). Mobile `2821:5016`: `Slide=1..7` (390×~780).
- Desktop: card giữa + preview khóa trước/sau hai bên (tên + thumbnail + nút ←/→; hover wrappers `Preview / left` `2437:3259`, `Preview / right` `2437:3307`) + 7 dot (hover wrappers `Slide 2..7` `2437:3324`…`2437:3389`). **Loop**: slide 1 preview trái = Flip.
- Mobile: counter `01 / 07`, nút tròn ←/→, swipe (giả định).
- Transition animation không được mô tả (giả định: slide/crossfade ~300–400ms).

### 7.3 Academy story carousel (03 BEHAVIOR `2083:56`, frame `2082:376`)

- `Slide=1..3`: JGRAYSON, Vatuz, KIMMY. Card gradient cam + portrait phải.
- Controls: nút tròn ←/→ (hover wrappers `Previous story` `2437:3427`, `Next story` `2437:3443`), `Xem câu chuyện →` (`Read story` `2437:3413`) → Student reader; `Tất cả câu chuyện →` (`Stories / Open all stories` `2437:3402`) → Student Stories.
- Mobile Academy **không dùng carousel** (1 featured student tĩnh).

### 7.4 Blog curved carousel (`90.5`, `2141:63`; 03 BEHAVIOR `2206:2205`)

- Section `Blogpost / BlogpostSection` `2142:1077` (dùng trên Home, instance `2142:1193`): heading `BLOGPOST` + nút tròn `→` có ring text "HOOKED" (`Blogpost / NextButton` `2141:217`: Default/Hover/Focus).
- Variant props: `Viewport = Desktop (1440) | Tablet (1024) | Mobile (390)` × `Active post = Education | Aracan | Information | Static | Abstract` × `Motion = Idle | WrapForward | WrapBackward`.
- Slot: `FixedCenterCard` (`2170:1306`) + `CurvedPreviewSlot` (`2178:5756`) với `Position = OuterLeft | InnerLeft | InnerRight | OuterRight` → 5 card xếp cong (outer nghiêng mạnh hơn, perspective). Mobile chỉ 1 card giữa.
- Card giữa có tiêu đề + sub dưới ảnh (vd. `VUI FEST CÁT BÀ` / `Hooked × Sun Group` / `Bệ phóng cho nghệ sĩ trẻ`; mobile `HỆ SINH THÁI HOOKED` / `Định hình lại mô hình / đào tạo âm nhạc điện tử`).
- **WrapForward**: next khi đang ở bài cuối → về bài đầu (Aracan); **WrapBackward**: prev khi ở bài đầu → về bài cuối (Abstract). Ảnh ở trạng thái wrap mờ/blur.
- Hover/focus: `PosterCard` có `State=Default | Focus` cho mọi position (`2141:179`); hover wrappers preview slot `2437:2939`, `2437:3024`, `2437:3109`, `2437:3194`. Click slot bên → đưa bài đó vào giữa (giả định); click card giữa → `/blog/[slug]` (giả định).
- ⚠️ Variant `Active post` dùng **artwork placeholder** (`04 · ASSETS / Blog artwork` `2206:395`: Aracan, Information, Education, Static, Abstract) trong khi chỉ có **3 bài thật**. Idle Desktop/Education hiển thị 3 bài thật (SPIN, Vui Fest, Devoid). Cần chốt: carousel chạy với N bài thật (N=3) thì logic 5 slot xử lý thế nào.

---

## 8. Filters

### 8.1 Project filters (`90.4 · RUNTIME / Project filters`, `2221:2626` → `Projects / FilteredGallery` `2221:3051`)

| Filter                        | Desktop     | Mobile      | Số project                      |
| ----------------------------- | ----------- | ----------- | ------------------------------- |
| Tất cả                        | `2221:2627` | `2221:2841` | 5 (layout editorial so le)      |
| Event production              | `2221:2706` | `2221:2916` | 5                               |
| Artist management             | `2221:2733` | `2221:2943` | 3 (Devoid, Frequency, Vui Fest) |
| Media                         | `2221:2760` | `2221:2970` | 5                               |
| Music consultant              | `2221:2787` | `2221:2997` | 3                               |
| International artists booking | `2221:2814` | `2221:3024` | 1 (Devoid)                      |
| DJ Contest                    | `2328:2933` | `2328:2958` | 2 (SPIN, Xóm Húc)               |

- Single-select chip; `Tất cả` mặc định.
- Khi lọc (≠ Tất cả): danh sách **1 cột, card full width** (desktop 1192px), không còn bố cục so le.
- Chip states (`Projects / FilterChip` `2218:484`): `Default`, `Active` (nền cam), `Hover`, `ActiveHover`.
- Không có empty state (filter nào cũng ≥1 project). Đề xuất sync `?category=` vào URL (giả định). Animation chuyển đổi không được mô tả.

### 8.2 Academy directory filter (`2467:3671` desktop; `Academy / Directory / Mobile` `2822:5002`)

- Chips `Tất cả · DJ · MC · Producer · Flip`.
- Mobile variants: `Category=Tất cả` (7 row, `2822:4848`), `DJ` (2, `2822:4904`), `MC` (2, `2822:4930`), `Producer` (2, `2822:4956`), `Flip` (1, `2822:4982`).
- Desktop chỉ vẽ `Tất cả`; row `Academy / Directory row / 0..6` (`2469:3701`…`2469:3815`) có `State=Default | Hover`.

---

## 9. Hover / focus states

Nguồn: `90 · QA EXAMPLES / Project media hover` (`2413:3518`), `91 · QA EXAMPLES / Links & controls hover` (`2441:6176`), `81 · INTERNAL / Website hover wrappers` (`2494:4747`), `80 · INTERNAL / Project interactions` (`2494:4746`, `Projects / HoverBorder` cho mọi kích thước media).

| Element                                                                                                                                     | Default                                         | Hover                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Nav link (desktop & mobile)                                                                                                                 | trắng                                           | cam `#FF6B00`                                                 |
| Primary gradient button `Đăng ký ngay` (`Course / Register`)                                                                                | gradient cam sáng                               | gradient tối hơn                                              |
| Nút tròn close `×` (lightbox)                                                                                                               | nền kem, icon đen                               | nền cam                                                       |
| Back link `← Tất cả dự án`                                                                                                                  | trắng                                           | cam (icon + text)                                             |
| Project card (overview)                                                                                                                     | poster khung cam dày, play nền kem, title trắng | khung thành viền cam mảnh bo góc, nút play nền cam, title cam |
| Video card (album)                                                                                                                          | thumbnail, title trắng                          | viền cam quanh thumbnail, title cam                           |
| Photo card (album)                                                                                                                          | ảnh                                             | viền cam                                                      |
| Academy directory row                                                                                                                       | nền tối, chữ trắng                              | nền kem sáng, chữ tối, nội dung dịch sang phải ~40px          |
| Story portrait card                                                                                                                         | tên trắng                                       | tên cam nhạt                                                  |
| Filter chip                                                                                                                                 | nền tối                                         | Hover / ActiveHover (đổi sắc độ)                              |
| Flow buttons (Registration/Course modal: `×`, `Đóng ×`, `Đăng ký ngay`, `Gửi đăng ký tư vấn`, 7 course option, `Tiếp tục khám phá Academy`) | Default                                         | Hover (`82 · INTERNAL`)                                       |
| Blog NextButton                                                                                                                             | Default                                         | Hover, Focus                                                  |
| Blog PosterCard                                                                                                                             | Default                                         | Focus                                                         |

Touch devices: bỏ qua hover; giữ `:focus-visible` cho keyboard (giả định).

---

## 10. Loading / empty / error / success — tổng hợp

| Loại                      | Có trong design                                  | Node                      |
| ------------------------- | ------------------------------------------------ | ------------------------- |
| Form loading              | ✓ Registration Loading (`Đang gửi thông tin...`) | `2455:5381` / `2455:5382` |
| Form success              | ✓ Registration Success                           | `2455:5383` / `2455:5384` |
| Form validation error     | ✓ Registration Error                             | `2455:5377` / `2455:5378` |
| Form submit/network error | ✗                                                | —                         |
| Video không có            | ✓ `Video đang được cập nhật.`                    | `2226:884` / `2226:905`   |
| Project không có đối tác  | ✓ ngầm (Xóm Húc ẩn cột Đối tác)                  | `2327:1264`               |
| Filter rỗng               | ✗ (không xảy ra với data hiện tại)               | —                         |
| Page loading / skeleton   | ✗                                                | —                         |
| 404 / not-found           | ✗                                                | —                         |
| Image loading/fallback    | ✗                                                | —                         |
