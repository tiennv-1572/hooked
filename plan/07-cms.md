# 07 · Admin CMS — kiến trúc & hướng dẫn phát triển

CMS quản trị toàn bộ nội dung động của website Hooked, chạy tại **`/admin`** (cùng app Next.js với website).
Giao diện dựa trên template [arhamkhnz/next-shadcn-admin-dashboard](https://github.com/arhamkhnz/next-shadcn-admin-dashboard) (shadcn/ui v4 + Tailwind v4), đã chuyển thể cho dự án.

> **Trạng thái:** CMS chạy trên **MySQL** qua API quản trị `/api/admin/*` (`httpAdapter`). Website đọc cùng database qua `src/server/content/queries.ts`, nên lưu ở CMS là website cập nhật ngay.
> Chế độ demo offline (IndexedDB, không cần database) vẫn còn: đặt `NEXT_PUBLIC_CMS_ADAPTER=local`.

## Đăng nhập

- `/admin/login` gọi `POST /api/admin/auth/login`. Mật khẩu băm bằng scrypt; phiên là JWT (jose) trong cookie httpOnly `hooked_admin`: 30 ngày nếu "Ghi nhớ", ngược lại 12 giờ.
- `<AuthGuard>` kiểm tra lại phiên bằng `GET /api/admin/auth/me`. API nào trả 401 thì UI đưa về trang đăng nhập.
- Tài khoản seed: `admin@hooked.vn` / `hooked2026` (đổi qua `ADMIN_DEMO_PASSWORD` trước khi seed). Đổi mật khẩu ở **Tài khoản của tôi**.
- **Mời người dùng**: chưa có dịch vụ email nên admin đặt **mật khẩu tạm** (sinh sẵn, có nút sao chép) và tự gửi cho người được mời. Tài khoản "Đã mời" chuyển sang "Đang hoạt động" ở lần đăng nhập đầu. "Tạo mật khẩu tạm mới" dùng khi người dùng quên mật khẩu.
- Phân quyền phía server (`withAdmin`):
  - **Biên tập viên** sửa được nội dung, không quản lý được người dùng.
  - **Quản trị viên** quản lý người dùng.
  - **Chủ sở hữu** có thêm quyền "Khôi phục dữ liệu mẫu" (`POST /api/admin/reset`).

## API quản trị (nội bộ)

| Method             | Path                                                    | Ghi chú                                                        |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------- |
| POST               | `/api/admin/auth/login` · `/logout` · `/password`       | Đăng nhập, đăng xuất, đổi mật khẩu của tôi                     |
| GET                | `/api/admin/auth/me`                                    | `{ user }` hoặc `{ user: null }`                               |
| GET, POST          | `/api/admin/collections/{key}`                          | Danh sách, tạo mới                                             |
| GET, PATCH, DELETE | `/api/admin/collections/{key}/{id}`                     | Chi tiết, sửa một phần, xóa                                    |
| POST               | `/api/admin/collections/{key}/bulk-delete` · `/reorder` | `{ ids }`                                                      |
| GET, PUT           | `/api/admin/singletons/{key}`                           | Trang, cài đặt, điều hướng                                     |
| POST               | `/api/admin/media/upload`                               | multipart `file` + `folder`: ảnh ≤ 8 MB, lưu `storage/uploads` |
| POST               | `/api/admin/reset`                                      | Chỉ Chủ sở hữu                                                 |

Mỗi lần ghi đều chạy `invalidate(...affectedKeys(key))` (`src/server/api/admin-keys.ts`) để website và `/api/v1` không trả nội dung cũ. API công khai cho website: xem `plan/08-api.md`.

## Cấu trúc

```
src/app/admin/                      Route của CMS (root layout riêng, không dùng header/footer của site)
  layout.tsx                        <html> + admin.css + providers
  login/page.tsx
  (panel)/layout.tsx                Khung: AuthGuard + sidebar + header
  (panel)/<route>/page.tsx          File route mỏng: export metadata + instant=false, render 1 component module
src/admin/
  components/ui/*                   shadcn/ui (từ template) — KHÔNG sửa trừ khi sửa lỗi
  components/shell/*                sidebar, header, ⌘K palette, theme menu, user menu, nav-config
  components/cms/*                  Building blocks dùng chung (bảng, form, ảnh, editor…)
  lib/cms/                          Lớp dữ liệu
    registry.ts                     Danh sách collection/singleton + type
    types/{shared,academy,projects,blog,pages}.ts
    seed/*                          Dữ liệu khởi tạo (map từ src/data/*), media-manifest.json
    adapter.ts                      Interface CmsAdapter (hợp đồng lưu trữ)
    local-adapter.ts                Cài đặt IndexedDB (idb-keyval), chế độ demo offline
    hooks.ts                        Hook TanStack Query — UI chỉ gọi các hook này
    schemas.ts                      Mảnh zod dùng lại (ảnh, slug, link…)
    inline.ts                       **đậm** / [link](/href) ↔ Inline của site
  lib/{auth,preferences,format}.ts
  modules/<domain>/*                UI từng nhóm chức năng
  styles/admin.css                  Theme shadcn (preset "Hooked" cam + tangerine/soft-pop/brutalist, sáng/tối)
```

Website và admin là **2 root layout** (`app/(site)` và `app/admin`): CSS không lẫn nhau, chuyển qua lại là tải trang đầy đủ. URL không khớp route nào → `app/global-not-found.tsx`.

## Mô hình nội dung

**Collections** (danh sách, CRUD): `courseCategories`, `courses`, `students`, `leads`, `projects`, `projectCategories`, `posts`, `partners`, `media`, `users`. Dự án hợp tác nằm trong singleton `partnersPage` (`collaborations[]`), sửa ở Trang › Partners.
**Singletons** (1 tài liệu): `settings`, `navigation`, `home`, `academyPage`, `studentsPage`, `projectsPage`, `projectsLayout` (Cài đặt hiển thị dự án), `blogPage`, `aboutPage`, `contactPage`, `partnersPage`.

Mọi item collection có `id`, `createdAt`, `updatedAt`. Collection có thứ tự (`ordered` trong `collectionMeta`) có thêm `order`; website hiển thị theo thứ tự này.

## Dùng dữ liệu (hooks)

```tsx
const { data, isLoading } = useCollection("courses"); // list (ordered → theo order, khác → mới nhất trước)
const { data: course } = useItem("courses", id);
const create = useCreateItem("courses"); // create.mutateAsync(newItem) → toast tự động
const update = useUpdateItem("courses"); // update.mutate({ id, patch })
const remove = useDeleteItems("courses"); // remove.mutate([id1, id2])
const reorder = useReorder("courses"); // reorder.mutate(orderedIds)
const { data: home } = useSingleton("home");
const save = useSaveSingleton("home");
const upload = useUpload(); // upload.mutateAsync({ file, folder })
```

Truyền `{ silent: true }` để tắt toast (ví dụ cập nhật hàng loạt).

## Building blocks (`src/admin/components/cms`)

| Component                                                                                                                      | Dùng cho                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `PageHeader`                                                                                                                   | Tiêu đề trang + breadcrumbs + nút hành động                                                                    |
| `DataTable`                                                                                                                    | Bảng: tìm kiếm, bộ lọc facet, sắp xếp cột, ẩn cột, phân trang, chọn nhiều + thao tác hàng loạt, bấm dòng để mở |
| `SortHeader`, `RowActions`                                                                                                     | Tiêu đề cột sắp xếp được; menu "…" cuối dòng                                                                   |
| `ReorderButton`                                                                                                                | Nút "Sắp xếp" mở bảng kéo-thả lưu thứ tự                                                                       |
| `useEntityEditor` + `EntityEditor`                                                                                             | Trang tạo/sửa 1 item: load, zod, lưu (⌘S), hoàn tác, xóa, nhân bản, xem trên website, cảnh báo rời trang       |
| `useSingletonEditor` + `SingletonEditor`                                                                                       | Trang sửa nội dung 1 trang/cài đặt + "Khôi phục mặc định"                                                      |
| `FormSection`, `FieldRow`                                                                                                      | Nhóm field dạng card; 2 cột                                                                                    |
| `TextField`, `TextareaField`, `NumberField`, `SelectField`, `SwitchField`, `ChipsField`, `TagsField`, `DateField`, `SlugField` | Field gắn react-hook-form qua `name` (hỗ trợ đường dẫn lồng `seo.title`, `items.0.label`)                      |
| `RichTextField`, `InlinePreview`                                                                                               | Văn bản có **đậm** / [link](/href) + xem trước                                                                 |
| `StringListField`                                                                                                              | Danh sách chuỗi kéo-thả (module, quyền lợi, đoạn văn…)                                                         |
| `RepeaterField`                                                                                                                | Danh sách object kéo-thả, thu gọn/mở, nhân bản                                                                 |
| `ImageField`, `GalleryField`, `Thumb`, `MediaPicker`                                                                           | Chọn ảnh từ thư viện / tải lên / URL, alt text, album kéo-thả                                                  |
| `StatusPill`, `PublishBadge`, `LeadStatusBadge`                                                                                | Badge trạng thái                                                                                               |
| `useConfirm()`                                                                                                                 | Hộp xác nhận dạng promise                                                                                      |
| `SaveBar`                                                                                                                      | (đã nằm trong editor)                                                                                          |

Định dạng: `src/admin/lib/format.ts` (`formatDate`, `formatDateTime`, `formatRelative`, `formatBytes`, `formatNumber`, `downloadCsv`).

**Module mẫu cần làm theo:** `src/admin/modules/partners/partners-list.tsx` (danh sách) và `partner-editor.tsx` (editor); route `src/app/admin/(panel)/partners/*`.

## Quy ước

- File route: `export const instant = false;` (CMS render phía client sau AuthGuard), `metadata.title`, render 1 component từ `src/admin/modules`.
- Route động `[id]`: component client đọc id bằng `useParams()`; `"new"` = tạo mới.
- Mọi text giao diện bằng tiếng Việt; toast/confirm cho thao tác phá hủy.
- Không gọi `fetch`/adapter trực tiếp trong UI, chỉ qua hooks (`src/admin/lib/cms/hooks.ts`).
- Ảnh trong admin hiển thị bằng `<Thumb>`/`<img>`, không dùng `next/image`.

## Database

- Schema: `src/server/db/schema.ts`. Mỗi bảng có cột quan hệ (id, slug, status, sort_order, các cột lọc) và cột `doc` JSON giữ toàn bộ entity, nên thêm field cho entity không cần migration.
- Codec `src/server/cms/codecs.ts` chuyển giữa entity và dòng dữ liệu.
- Sửa schema: `pnpm db:generate` rồi `pnpm db:migrate`.
- Seed: `src/server/cms/seed.ts` lấy nguồn từ `src/admin/lib/cms/seed/*`, tức dữ liệu gốc của website trong `src/data/*`.
