/**
 * Ảnh của trang "Hệ thống › Thư viện media" (content/huong-dan/he-thong/thu-vien-media.mdx).
 * Tải lên một ảnh có sẵn của website (đặt tên như ảnh thật), chụp, rồi xóa nó khỏi thư viện. Chi tiết ảnh chụp trên một
 * ảnh có sẵn (đường dẫn cố định), để chạy lại vẫn ra cùng ảnh.
 */
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { container, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "he-thong/thu-vien-media";
const SAMPLE = "vui-fest-backstage.jpg";
const photo = () => readFileSync("public/images/projects/vui-fest-cat-ba/photo-3.jpg");

test("Thư viện media", async ({ page }) => {
  // A run that failed half-way may have left the sample behind (the file itself stays in storage/, unused).
  localSql(`delete from media where json_unquote(json_extract(doc, '$.name')) = '${SAMPLE}'`);

  await login(page);
  await page.goto("/admin/media");
  const heading = page.getByRole("heading", { level: 1, name: "Thư viện media" });
  await expect(page.getByRole("button", { name: /justwang\.jpg/ })).toBeVisible();

  // ── The screen ──────────────────────────────────────────────────────────────────────────────────────────
  const kind = page.getByRole("combobox").filter({ hasText: "Hình ảnh" });
  const folder = page.getByRole("combobox").filter({ hasText: "Tất cả thư mục" });
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("button", { name: "Tải ảnh lên" }), at: "below" },
      { n: 2, target: page.getByRole("textbox", { name: "Tìm theo tên hoặc mô tả…" }), at: "left" },
      { n: 3, target: kind, at: "below" },
      { n: 4, target: folder, at: "below" },
      { n: 5, target: page.getByText(/^\d+ tệp · /), at: "below", tight: true },
      { n: 6, target: page.getByRole("radiogroup"), at: "below" },
      { n: 7, target: page.getByRole("button", { name: /justwang\.jpg/ }) },
    ],
  });

  // The kinds of files.
  await kind.click();
  const kinds = page.getByRole("listbox");
  await expect(kinds).toBeVisible();
  await shot(page, `${IMG}-loai`, {
    area: container(
      page,
      page.locator('input[placeholder="Tìm theo tên hoặc mô tả…"]'),
      page.locator('[role="radiogroup"]'),
    ),
    include: [kinds],
    marks: [
      { n: 1, target: kinds.getByRole("option", { name: "Hình ảnh" }), at: "right" },
      { n: 2, target: kinds.getByRole("option", { name: "Icon (SVG)" }), at: "right" },
      { n: 3, target: kinds.getByRole("option", { name: "Đã tải lên" }), at: "right" },
      { n: 4, target: kinds.getByRole("option", { name: "Tất cả" }), at: "right" },
    ],
  });
  await page.keyboard.press("Escape");
  // No focus ring left on the list's control in the next pictures (it gets the focus back once the list is closed).
  await expect(kinds).toBeHidden();
  await expect(kind).toBeFocused();
  await kind.blur();

  // ── Drag and drop: the overlay shown while a file is held over the page ──────────────────────────────────
  const transfer = await page.evaluateHandle(() => new DataTransfer());
  await heading.dispatchEvent("dragover", { dataTransfer: transfer });
  await expect(page.getByText("Thả ảnh để tải lên")).toBeVisible();
  await shot(page, `${IMG}-keo-tha`, { marks: [{ n: 1, target: page.getByText("Thả ảnh để tải lên"), at: "right" }] });
  await heading.dispatchEvent("drop", { dataTransfer: transfer });
  await expect(page.getByText("Thả ảnh để tải lên")).toBeHidden();

  // ── Upload (the button's file picker) ───────────────────────────────────────────────────────────────────
  await page.locator('input[type="file"]').setInputFiles({ name: SAMPLE, mimeType: "image/jpeg", buffer: photo() });
  await expect(page.getByText("Đã tải lên 1 ảnh.")).toBeVisible();
  const uploaded = page.getByRole("button", { name: new RegExp(SAMPLE.replace(".", "\\.")) });
  await expect(uploaded).toBeVisible();
  await shot(page, `${IMG}-da-tai-len`, {
    marks: [
      { n: 1, target: page.getByText("Đã tải lên 1 ảnh."), at: "left", tight: true },
      { n: 2, target: uploaded },
    ],
  });
  await noToasts(page);

  // A file the library does not take: the message in the corner.
  await page.locator('input[type="file"]').setInputFiles({
    name: "bao-gia-su-kien.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n"),
  });
  const wrongType = page
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Chỉ hỗ trợ ảnh PNG, JPG, WebP, GIF, SVG, AVIF." });
  await expect(wrongType).toBeVisible();
  await shot(page, `${IMG}-loi-dinh-dang`, { area: wrongType, padding: 24 });
  await noToasts(page);
  // Over 8 MB (the message is quoted in the guide).
  const big = Buffer.alloc(9 * 1024 * 1024);
  photo().copy(big);
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "poster-a0.jpg", mimeType: "image/jpeg", buffer: big });
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "Ảnh tối đa 8 MB." })).toBeVisible();
  await noToasts(page);

  // ── One picture: details (a picture of the website, whose address never changes) ─────────────────────────
  await page.getByRole("textbox", { name: "Tìm theo tên hoặc mô tả…" }).fill("vui-fest-cat-ba");
  await page.getByRole("button", { name: /^Vui fest cat ba vui-fest-cat-ba\.jpg/ }).click();
  const sheet = page.getByRole("dialog", { name: "vui-fest-cat-ba.jpg" });
  await expect(sheet).toBeVisible();
  // The panel focuses (and selects) the address field when it opens.
  await page.evaluate(() => {
    window.getSelection()?.removeAllRanges();
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await shot(page, `${IMG}-chi-tiet`, {
    area: sheet,
    marks: [
      { n: 1, target: sheet.locator("dl"), at: "left" },
      { n: 2, target: sheet.getByRole("textbox"), at: "above" },
      { n: 3, target: sheet.getByRole("button", { name: "Sao chép đường dẫn" }), at: "above" },
      { n: 4, target: sheet.getByRole("button", { name: "Xóa khỏi thư viện" }), at: "above" },
    ],
    padding: 0,
  });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  // ── Delete the sample: the question, then Xóa ───────────────────────────────────────────────────────────
  await page.getByRole("textbox", { name: "Tìm theo tên hoặc mô tả…" }).fill("backstage");
  await uploaded.click();
  const sampleSheet = page.getByRole("dialog", { name: SAMPLE });
  await sampleSheet.getByRole("button", { name: "Xóa khỏi thư viện" }).click();
  const confirm = dialog(page, `Xóa "${SAMPLE}" khỏi thư viện?`);
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: confirm,
    marks: [
      { n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }), at: "below" },
      { n: 2, target: confirm.getByRole("button", { name: "Hủy" }), at: "below" },
    ],
  });
  await confirm.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(page.getByText("Đã xóa tệp.")).toBeVisible();
  expect(localSql(`select count(*) from media where json_unquote(json_extract(doc, '$.name')) = '${SAMPLE}'`)).toBe(
    "0",
  );
});
