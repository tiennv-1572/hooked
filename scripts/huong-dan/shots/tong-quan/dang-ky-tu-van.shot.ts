/**
 * Ảnh của trang "Tổng quan › Đăng ký tư vấn" (content/huong-dan/tong-quan/dang-ky-tu-van.mdx).
 * Một học viên mẫu gửi form trên trang Academy, một đăng ký mẫu được thêm thủ công; cả hai được xóa ở cuối (qua giao
 * diện, rồi localSql dọn hẳn): chạy lại bao nhiêu lần cũng ra cùng ảnh.
 */
import { expect, test } from "@playwright/test";

import { container, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "tong-quan/dang-ky-tu-van";
const VISITOR = { email: "khang.nguyen@example.com", name: "Nguyễn Minh Khang", phone: "0900 000 101" };
const MANUAL = { name: "Phạm Gia Bảo", phone: "0900 000 102" };
const SAMPLES = `'${VISITOR.name}', '${MANUAL.name}'`;

test("Đăng ký tư vấn", async ({ page }) => {
  // A run that failed half-way may have left the samples behind.
  localSql(`delete from leads where name in (${SAMPLES})`);

  // ── On the website: a visitor sends the form (not signed in) ───────────────────────────────────────────
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/academy");
  await page.getByRole("button", { name: "Đăng ký ngay" }).first().click();
  const form = page.getByRole("dialog", { name: "Đăng ký tư vấn" });
  await expect(form).toBeVisible();
  await form.getByLabel("Họ và tên *").fill(VISITOR.name);
  await form.getByLabel("Số điện thoại *").fill(VISITOR.phone);
  await form.getByLabel("Email (không bắt buộc)").fill(VISITOR.email);
  await shot(page, `${IMG}-website`, {
    area: form,
    marks: [
      { n: 1, target: form.getByRole("button", { name: "Khóa học quan tâm" }) },
      { n: 2, target: form.getByLabel("Họ và tên *") },
      { n: 3, target: form.getByLabel("Số điện thoại *") },
      { n: 4, target: form.getByLabel("Email (không bắt buộc)") },
      { n: 5, target: form.getByRole("button", { name: "Gửi đăng ký tư vấn" }) },
    ],
  });
  await form.getByRole("button", { name: "Gửi đăng ký tư vấn" }).click();
  const done = page.getByRole("dialog").filter({ hasText: "Đã nhận thông tin" });
  await expect(done).toBeVisible();
  await shot(page, `${IMG}-website-da-gui`, { area: done });
  expect(localSql(`select status from leads where name = '${VISITOR.name}'`)).toBe("new");

  // ── The inbox ──────────────────────────────────────────────────────────────────────────────────────────
  await login(page);
  await page.setViewportSize({ height: 900, width: 1440 });
  await page.goto("/admin/leads");
  const visitorRow = page.getByRole("row").filter({ hasText: VISITOR.name });
  await expect(visitorRow).toBeVisible();
  const newCard = page.getByRole("button", { name: /^Mới \d+ / });
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: /^Đăng ký tư vấn/ }).first() },
      { n: 2, target: page.getByRole("link", { name: /^\d+ đăng ký mới$/ }), at: "below" },
      { n: 3, target: page.getByRole("button", { name: "Xuất CSV" }), at: "below" },
      { n: 4, target: page.getByRole("button", { name: "Thêm đăng ký" }), at: "below" },
      { n: 5, target: newCard },
    ],
  });

  const tabs = page.getByRole("navigation", { name: "Lọc theo trạng thái" });
  const status = visitorRow.getByRole("button", { name: /^Trạng thái: Mới/ });
  // Marks one by one: a filter button and a column header share their name ("Khóa học", "Nguồn").
  await shot(page, `${IMG}-loc`, {
    area: container(page, tabs, page.getByRole("table")),
    marks: [
      { n: 1, target: tabs, at: "above" },
      { n: 2, target: page.getByRole("radiogroup", { name: "Khoảng thời gian" }), at: "above" },
      { n: 3, target: page.getByRole("textbox", { name: "Tìm đăng ký" }), at: "left" },
      { n: 4, target: page.getByRole("button", { exact: true, name: "Khóa học" }).first(), at: "below" },
      { n: 5, target: page.getByRole("button", { exact: true, name: "Nguồn" }).first(), at: "below" },
      { n: 6, target: status, at: "left" },
    ],
  });

  // Change the status from the list (shown, then closed without choosing)
  await status.click();
  const statusMenu = page.getByRole("menu");
  await expect(statusMenu).toBeVisible();
  // The open menu hides the page from the accessibility tree: the table by its tag.
  await shot(page, `${IMG}-doi-trang-thai`, { area: page.locator("table"), marks: [{ n: 1, target: statusMenu }] });
  await page.keyboard.press("Escape");

  // ── One registration ───────────────────────────────────────────────────────────────────────────────────
  await visitorRow.getByText(VISITOR.name).click();
  const sheet = page.getByRole("dialog", { name: VISITOR.name });
  await expect(sheet).toBeVisible();
  await shot(page, `${IMG}-chi-tiet`, {
    area: sheet,
    marks: [
      {
        n: 1,
        target: container(
          page,
          page.getByRole("link", { name: /^Gọi 0900/ }),
          page.getByRole("link", { exact: true, name: "Email" }),
        ),
        at: "below",
      },
      { n: 2, target: sheet.getByRole("radiogroup", { name: "Trạng thái đăng ký" }) },
      { n: 3, target: sheet.getByRole("button", { name: "Đánh dấu đã liên hệ" }), at: "below" },
      { n: 4, target: sheet.getByRole("button", { name: "Sao chép số điện thoại" }), at: "right" },
      { n: 5, target: sheet.getByRole("combobox") },
    ],
  });

  await sheet.getByRole("button", { name: "Đánh dấu đã liên hệ" }).click();
  const undo = page.locator("[data-sonner-toast]").filter({ hasText: `${VISITOR.name} → Đã liên hệ` });
  await expect(undo).toBeVisible();
  await shot(page, `${IMG}-da-lien-he`, {
    area: undo,
    marks: [{ n: 1, target: undo.getByRole("button", { name: "Hoàn tác" }), at: "below" }],
    padding: 24,
  });
  await noToasts(page);

  const note = sheet.getByLabel("Ghi chú nội bộ");
  await note.fill("Muốn học buổi tối thứ 3, 5. Đã hẹn học thử ngày 28/11.");
  await sheet.getByText("Lịch sử", { exact: true }).scrollIntoViewIfNeeded();
  await shot(page, `${IMG}-ghi-chu`, {
    area: sheet,
    marks: [
      { n: 1, target: note },
      { n: 2, target: sheet.getByRole("button", { name: "Lưu ghi chú" }), at: "left" },
      { n: 3, target: sheet.getByRole("list").last() },
      { n: 4, target: sheet.getByRole("button", { name: "Xóa đăng ký" }), at: "right" },
    ],
  });
  await sheet.getByRole("button", { name: "Lưu ghi chú" }).click();
  await expect(page.getByText("Đã lưu ghi chú.")).toBeVisible();
  await noToasts(page);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  // ── Add a registration taken by phone ──────────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Thêm đăng ký" }).click();
  const add = dialog(page, "Thêm đăng ký thủ công");
  // Same number as an earlier registration: the dialog says so.
  await add.getByLabel("Họ và tên").fill(MANUAL.name);
  await add.getByLabel("Số điện thoại").fill(VISITOR.phone);
  const duplicate = add.getByText(/đã đăng ký 1 lần/);
  await expect(duplicate).toBeVisible();
  await shot(page, `${IMG}-trung-so`, { area: add, marks: [{ n: 1, target: duplicate, tight: true, at: "right" }] });

  await add.getByLabel("Số điện thoại").fill(MANUAL.phone);
  await add.getByRole("combobox", { name: "Khóa học quan tâm" }).click();
  await page.getByRole("option", { name: "MC cơ bản" }).click();
  await add.getByRole("button", { exact: true, name: "Zalo" }).click();
  // Away from the chips: the one under the pointer would show as hovered.
  await page.mouse.move(0, 0);
  await shot(page, `${IMG}-them`, {
    area: add,
    marks: [
      { n: 1, target: add.getByLabel("Họ và tên") },
      { n: 2, target: add.getByLabel("Số điện thoại") },
      { n: 3, target: add.getByRole("combobox", { name: "Khóa học quan tâm" }) },
      { n: 4, target: add.getByLabel("Nguồn") },
      { n: 5, target: add.getByRole("combobox", { name: "Trạng thái" }) },
      { n: 6, target: add.getByRole("button", { exact: true, name: "Thêm đăng ký" }), at: "above" },
    ],
  });
  await add.getByRole("button", { exact: true, name: "Thêm đăng ký" }).click();
  await expect(page.getByText("Đã tạo đăng ký.")).toBeVisible();
  const manualSheet = page.getByRole("dialog", { name: MANUAL.name });
  await expect(manualSheet).toBeVisible();
  expect(localSql(`select concat(status, '|', source) from leads where name = '${MANUAL.name}'`)).toBe("new|Zalo");
  await page.keyboard.press("Escape");
  await noToasts(page);

  // ── Several at once ────────────────────────────────────────────────────────────────────────────────────
  const manualRow = page.getByRole("row").filter({ hasText: MANUAL.name });
  await manualRow.getByRole("checkbox").check();
  await visitorRow.getByRole("checkbox").check();
  const selected = page.getByText("Đã chọn 2", { exact: true });
  await expect(selected).toBeVisible();
  await shot(page, `${IMG}-chon-nhieu`, {
    area: container(page, selected, page.getByRole("table")),
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Chuyển trạng thái" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Xuất CSV" }).last(), at: "below" },
      { n: 3, target: page.getByRole("button", { exact: true, name: "Xóa" }), at: "below" },
    ],
  });
  await page.getByRole("button", { exact: true, name: "Bỏ chọn" }).click();

  // ── Delete (each sample through its row menu) ──────────────────────────────────────────────────────────
  await visitorRow.getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirm = dialog(page, `Xóa đăng ký của "${VISITOR.name}"?`);
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: confirm,
    marks: [{ n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }), at: "below" }],
  });
  await confirm.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(visitorRow).toBeHidden();
  await noToasts(page);

  await manualRow.getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  await dialog(page, `Xóa đăng ký của "${MANUAL.name}"?`).getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(manualRow).toBeHidden();

  localSql(`delete from leads where name in (${SAMPLES})`);
  expect(localSql(`select count(*) from leads where name in (${SAMPLES})`)).toBe("0");
});
