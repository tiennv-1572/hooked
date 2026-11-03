-- Chạy một lần khi volume MySQL được tạo lần đầu.
-- Bảng & dữ liệu do ứng dụng quản lý: `pnpm db:migrate` rồi `pnpm db:seed`.
ALTER DATABASE hooked CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Cho phép user ứng dụng tạo database tạm khi chạy test.
GRANT ALL PRIVILEGES ON `hooked%`.* TO 'hooked'@'%';
FLUSH PRIVILEGES;
