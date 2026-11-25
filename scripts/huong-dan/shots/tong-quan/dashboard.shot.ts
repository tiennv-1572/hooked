/**
 * Ảnh của trang "Tổng quan › Dashboard" (content/huong-dan/tong-quan/dashboard.mdx).
 * Để có ví dụ cho "Nội dung cần chú ý", khóa học "Flip" được chuyển về bản nháp rồi xuất bản lại ở cuối (qua giao
 * diện, để website cũng được làm mới).
 */
import { expect, test, type Page } from "@playwright/test";

import { card, container, localSql, login, noToasts, shot } from "../kit";

const IMG = "tong-quan/dashboard";
const COURSE = "Flip";

async function setCourseStatus(page: Page, action: "Chuyển về bản nháp" | "Xuất bản") {
  await page.goto("/admin/courses");
  const row = page.getByRole("row").filter({ hasText: COURSE }).first();
  await row.getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: action }).click();
  await noToasts(page);
}

test("Dashboard", async ({ page }) => {
  // A run that failed half-way may have left the course as a draft.
  if (localSql(`select status from courses where title = '${COURSE}'`) === "draft") {
    await login(page);
    await setCourseStatus(page, "Xuất bản");
  } else {
    await login(page);
  }

  // ── Top: greeting, shortcuts, figures ──────────────────────────────────────────────────────────────────
  await page.goto("/admin");
  const kpi = (label: string) => page.getByRole("link", { name: new RegExp(`^${label}`) });
  await expect(kpi("Tỉ lệ ghi danh")).toBeVisible();
  const greeting = page.getByRole("heading", { level: 1 });
  await shot(page, `${IMG}-tong-quan`, {
    marks: [
      { n: 1, target: page.locator("main p").filter({ hasText: "đang chờ liên hệ" }), tight: true, at: "right" },
      {
        n: 2,
        target: container(
          page,
          page.getByRole("link", { name: "Tạo bài viết" }),
          page.getByRole("link", { name: "Sửa trang chủ" }),
        ),
        at: "right",
      },
      { n: 3, target: kpi("Đăng ký tư vấn · 30 ngày") },
      { n: 4, target: kpi("Đăng ký mới chưa xử lý") },
      { n: 5, target: kpi("Tỉ lệ ghi danh") },
      { n: 6, target: card(page.getByText("Nội dung đã xuất bản", { exact: true })) },
    ],
  });
  await expect(greeting).toBeVisible();

  // ── Registration analytics ─────────────────────────────────────────────────────────────────────────────
  await page.setViewportSize({ height: 1100, width: 1280 });
  const analytics = page.getByRole("region", { name: "Phân tích đăng ký tư vấn" });
  await analytics.scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-phan-tich`, {
    area: analytics,
    marks: [
      { n: 1, target: analytics.getByRole("radiogroup", { name: "Khoảng thời gian" }), at: "left" },
      { n: 2, target: card(analytics.getByText("Đăng ký tư vấn theo ngày", { exact: true })) },
      { n: 3, target: analytics.getByText("Trạng thái xử lý", { exact: true }), tight: true, at: "right" },
      { n: 4, target: card(analytics.getByText("Đăng ký theo khóa học", { exact: true })) },
    ],
  });

  // ── Lists, with one draft to show "Nội dung cần chú ý" ─────────────────────────────────────────────────
  await setCourseStatus(page, "Chuyển về bản nháp");
  expect(localSql(`select status from courses where title = '${COURSE}'`)).toBe("draft");
  await page.goto("/admin");
  const draftsTitle = page.getByText("1 bản nháp chưa xuất bản", { exact: true });
  await expect(draftsTitle).toBeVisible();
  const latest = card(page.getByText("Đăng ký mới nhất", { exact: true }));
  const attention = card(page.getByText("Nội dung cần chú ý", { exact: true }));
  await attention.scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-danh-sach`, {
    area: container(
      page,
      page.getByText("Đăng ký mới nhất", { exact: true }),
      page.getByText("Nội dung cần chú ý", { exact: true }),
    ),
    marks: [
      { n: 1, target: latest.getByRole("link", { name: "Tất cả" }), at: "left" },
      { n: 2, target: latest.getByRole("listitem").first() },
      { n: 3, target: draftsTitle, tight: true, at: "right" },
      { n: 4, target: attention.getByRole("link", { name: new RegExp(COURSE) }), at: "left" },
    ],
  });

  await setCourseStatus(page, "Xuất bản");
  expect(localSql(`select status from courses where title = '${COURSE}'`)).toBe("published");
});
