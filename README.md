# Hooked Entertainment — website + CMS

Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript · MySQL 8.4 (Docker) · Drizzle ORM. Design source: Figma `a5ubAiUQAaKw76ja7OHdDA`.

|                         | URL (dev)                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------- |
| Website                 | http://localhost:3000                                                                  |
| CMS (admin)             | http://localhost:3000/admin, đăng nhập `admin@hooked.vn` / `hooked2026` (tạo bởi seed) |
| Swagger (API công khai) | http://localhost:3000/api-docs, spec tại `/api/v1/openapi.json`                        |
| Adminer (tùy chọn)      | http://localhost:8080 (`docker compose --profile tools up -d`)                         |

## Chạy lần đầu

Cần Node 20+, pnpm và Docker (Docker Desktop, Colima hoặc OrbStack).

```bash
pnpm install
cp .env.example .env      # đổi AUTH_SECRET: openssl rand -base64 32
pnpm db:up                # docker compose up -d: chỉ MySQL, cổng 127.0.0.1:3307
pnpm db:migrate           # tạo bảng (drizzle/*.sql)
pnpm db:seed              # nạp nội dung mẫu + tài khoản admin (chỉ ghi vào bảng trống)
pnpm dev                  # web chạy local
```

`pnpm db:setup` gộp `db:up`, `db:migrate` và `db:seed`. MySQL dùng cổng **3307** trên máy để tránh đụng MySQL hoặc SSH tunnel đang chiếm 3306; đổi bằng `MYSQL_PORT` và `DATABASE_URL` trong `.env`.

## Lệnh

```bash
pnpm dev | build | start      # build và start cần MySQL đang chạy (trang được prerender từ database)
pnpm lint | typecheck | format
pnpm test:e2e                 # Playwright (Chrome cài sẵn), chạy trên bản build: pnpm build trước
pnpm db:up | db:down          # bật/tắt container MySQL (dữ liệu giữ trong volume mysql-data)
pnpm db:generate              # sinh migration mới sau khi sửa src/server/db/schema.ts
pnpm db:migrate | db:studio   # áp migration · Drizzle Studio
pnpm db:seed                  # seed bảng trống
pnpm db:reset                 # XÓA và seed lại toàn bộ nội dung (giữ user)
```

## Kiến trúc

```
Browser ── /admin (CMS UI) ── fetch ──> /api/admin/*  (session cookie, role) ──┐
                                                                               ├─> src/server/cms/repository ──> MySQL
Browser ── website pages <── Server Components ── src/server/content/queries ──┘   ("use cache" + cacheTag)
External clients ──────────> /api/v1/*  (public, read-only + POST /registrations)
```

- Admin lưu dữ liệu: `/api/admin` ghi MySQL rồi `revalidateTag("cms:<key>")`, nên website và API công khai cập nhật ngay.
- Website và `/api/v1` dùng chung một lớp service và DTO (`src/server/content`).
- Ảnh upload lưu ở `storage/uploads/YYYY/MM/` (đã gitignore), phục vụ qua `/uploads/...`.
- `NEXT_PUBLIC_CMS_ADAPTER=local` chạy CMS ở chế độ demo offline (IndexedDB, không cần database).

## Tài liệu

- `plan/00–06`: tổng quan, kiến trúc, màn hình, state/behavior, component, spec Home, câu hỏi mở.
- `plan/07-cms.md`: CMS: cấu trúc, module, quy ước.
- `plan/08-api.md`: **Public API v1**: endpoint, schema, và ánh xạ API ↔ màn hình ↔ vị trí ↔ mục CMS.
- `REPORT.md`: báo cáo tiến độ.

## Cấu trúc chính

```
src/app/(site)        website (root layout riêng)
src/app/admin         CMS (root layout riêng)
src/app/api/admin     API quản trị (cần đăng nhập)
src/app/api/v1        API công khai, src/app/api-docs = Swagger UI
src/server/db         schema Drizzle + kết nối MySQL
src/server/cms        repository, codec, seed, upload
src/server/content    queries (cache), DTO, mapper, đăng ký tư vấn, views (DTO → props component)
src/server/auth       mật khẩu (scrypt), session (JWT httpOnly)
src/server/openapi    spec OpenAPI 3.1
src/admin             UI CMS (shadcn/ui), hook dữ liệu, module
src/components        component website
src/data              nội dung gốc, dùng làm seed cho database
docker-compose.yml    MySQL 8.4 (+ Adminer với profile tools)
```
