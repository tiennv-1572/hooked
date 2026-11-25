/**
 * Ảnh của trang "Nội dung › Bài viết" (content/huong-dan/noi-dung/bai-viet.mdx).
 * Soạn bài mẫu "Xóm Húc mùa 2: đêm chung kết tại Hà Nội" từng phần, hẹn giờ đăng sáng mai, chụp danh sách, rồi xóa bài qua
 * giao diện: chạy lại bao nhiêu lần cũng ra cùng ảnh. Ảnh website chụp trên các bài có sẵn.
 */
import { expect, test } from "@playwright/test";

import { card, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "noi-dung/bai-viet";
const TITLE = "Xóm Húc mùa 2: đêm chung kết tại Hà Nội";
const SLUG = "xom-huc-mua-2-dem-chung-ket-tai-ha-noi";
const INTRO =
  "Đêm chung kết Xóm Húc mùa 2 quy tụ 16 DJ trẻ từ khắp cả nước, tranh tài trước hơn 2.000 khán giả tại Hà Nội.";

test("Bài viết", async ({ page }) => {
  // A run that failed half-way may have left the sample (or a copy of it) behind.
  localSql(`delete from posts where slug like '${SLUG}%'`);
  await login(page);

  await page.goto("/admin/posts/new");
  const title = page.getByRole("textbox", { name: "Tiêu đề bài viết *" });
  await expect(title).toBeVisible();

  // ── Title, slug, publishing ──────────────────────────────────────────────────────────────────────────────
  await title.fill(TITLE);
  const slug = page.getByRole("textbox", { name: "Đường dẫn (slug)" });
  await expect(slug).toHaveValue(SLUG);
  const publish = card(page.getByRole("radiogroup", { name: "Trạng thái" }));
  await shot(page, `${IMG}-form`, {
    marks: [
      { n: 1, target: page.getByRole("tablist"), at: "below" },
      { n: 2, target: title, at: "left" },
      { n: 3, target: slug, at: "above" },
      { n: 4, target: page.getByRole("button", { name: "Khóa đường dẫn" }), at: "above" },
      { n: 5, target: page.getByText(/phút đọc/).first(), at: "above", tight: true },
      { n: 6, target: page.getByRole("radiogroup", { name: "Trạng thái" }), at: "left" },
      { n: 7, target: page.getByRole("button", { name: "Ngày đăng" }), at: "left" },
      { n: 8, target: page.getByRole("combobox", { name: "Tác giả *" }), at: "left" },
    ],
  });

  // ── Card copy, intro and its link ────────────────────────────────────────────────────────────────────────
  const kicker = page.getByRole("textbox", { name: "Nhãn ngắn *" });
  await kicker.fill("DJ Contest");
  const intro = card(page.getByText("Mở đầu", { exact: true })).locator('[contenteditable="true"]');
  await intro.click();
  await intro.pressSequentially(INTRO);
  const ctaSwitch = page.getByRole("switch", { name: /Liên kết dưới đoạn mở đầu/ });
  await ctaSwitch.click();
  await page.getByRole("textbox", { name: "Nội dung liên kết *" }).fill("Xem các khóa học DJ tại Hooked");
  await page.getByRole("button", { exact: true, name: "/academy" }).first().click();
  await shot(page, `${IMG}-the-mo-dau`, {
    fitHeight: true,
    area: card(kicker),
    include: [card(ctaSwitch)],
    marks: [
      { n: 1, target: kicker, at: "left" },
      { n: 2, target: intro, at: "left" },
      { n: 3, target: ctaSwitch, at: "left" },
      { n: 4, target: page.getByRole("textbox", { name: "Nội dung liên kết *" }), at: "left" },
      { n: 5, target: page.getByRole("textbox", { name: "Đường dẫn *" }), at: "above" },
    ],
  });

  // ── Body blocks ──────────────────────────────────────────────────────────────────────────────────────────
  const body = card(page.getByText("Nội dung bài viết", { exact: true }));
  await shot(page, `${IMG}-chon-khoi`, {
    fitHeight: true,
    area: body,
    marks: [{ n: 1, target: body.getByRole("button", { name: /^Đoạn văn Một hoặc/ }), at: "left" }],
  });
  await body.getByRole("button", { name: /^Đoạn văn Một hoặc/ }).click();
  const paragraph = body.locator('[contenteditable="true"]').first();
  await paragraph.click();
  await paragraph.pressSequentially(
    "Sau ba vòng loại, 16 DJ bước vào đêm chung kết với phần thi tự do 15 phút, chấm bởi dàn mentor của Hooked.",
  );
  await body.getByRole("button", { name: "Thêm khối" }).click();
  const types = page.getByRole("dialog").filter({ hasText: "Chọn loại khối" });
  await expect(types).toBeVisible();
  await shot(page, `${IMG}-them-khoi`, {
    fitHeight: true,
    area: body,
    include: [types],
    marks: [
      { n: 1, target: body.getByRole("button", { name: "Thêm khối" }), at: "left" },
      { n: 2, target: types, at: "right" },
      { n: 3, target: body.getByText("Nhanh:", { exact: true }), at: "below", tight: true },
    ],
  });
  // The window shrank back after the picture: the menu, placed for the tall one, is off screen. Open it again.
  await page.keyboard.press("Escape");
  await body.getByRole("button", { name: "Thêm khối" }).click();
  await types.getByRole("button", { name: /^Trích dẫn Câu nói/ }).click();
  await body
    .getByRole("textbox", { name: /Câu trích dẫn/ })
    .fill("Sân khấu này là nơi các bạn trẻ được là chính mình.");
  await body.getByRole("textbox", { name: /Nguồn/ }).fill("DJ Marcuz, giám khảo");
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await shot(page, `${IMG}-khoi`, {
    fitHeight: true,
    area: body,
    marks: [
      { n: 1, target: body.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      { n: 2, target: body.getByRole("button", { name: "Đoạn văn #1" }), at: "above" },
      { n: 3, target: body.getByRole("button", { name: "Xuống dưới" }).first(), at: "above" },
      { n: 4, target: body.getByRole("button", { name: "Nhân bản" }).first(), at: "above" },
      { n: 5, target: body.getByRole("button", { name: "Xóa khối" }).first(), at: "above" },
      { n: 6, target: body.getByRole("button", { name: "Chèn khối tại đây" }).nth(1), at: "left" },
      { n: 7, target: body.getByRole("button", { name: "Thu gọn tất cả" }), at: "left" },
    ],
  });

  // ── Cover, tags, SEO (the column on the right) ───────────────────────────────────────────────────────────
  const aside = page.getByRole("complementary");
  await aside.getByRole("button", { name: "Chọn hoặc tải ảnh lên" }).first().click();
  const library = dialog(page, "Chọn một ảnh");
  await library.getByPlaceholder("Tìm theo tên…").fill("xom-huc");
  await library.locator('button[title="xom-huc.png"]').click();
  await library.getByRole("button", { name: "Chọn ảnh" }).click();
  await expect(library).toBeHidden();
  await aside.getByRole("button", { name: "+ DJ Contest" }).click();
  const coverCard = card(aside.getByText("Ảnh bìa", { exact: true }));
  const tagsCard = card(aside.getByText("Thẻ", { exact: true }));
  const seoCard = card(aside.getByText("SEO & chia sẻ", { exact: true }));
  await shot(page, `${IMG}-anh-bia-seo`, {
    fitHeight: true,
    area: coverCard,
    include: [seoCard],
    marks: [
      { n: 1, target: coverCard.getByRole("img").first(), at: "left" },
      { n: 2, target: coverCard.getByText("Thẻ bài viết trên trang Blog"), at: "left", tight: true },
      { n: 3, target: tagsCard.getByRole("group"), at: "left" },
      { n: 4, target: seoCard.getByRole("textbox", { name: "Tiêu đề SEO" }), at: "left" },
      { n: 5, target: seoCard.getByRole("textbox", { name: "Mô tả SEO" }), at: "left" },
      { n: 6, target: seoCard.getByText(/hooked\.vn › blog/), at: "left" },
      { n: 7, target: seoCard.getByRole("button", { name: "Chọn hoặc tải ảnh lên" }), at: "left" },
    ],
  });

  // ── Publishing on a later date ───────────────────────────────────────────────────────────────────────────
  await page.setViewportSize({ height: 1000, width: 1280 });
  await publish.getByRole("radio", { name: "Xuất bản" }).click();
  await publish.getByRole("button", { exact: true, name: "Ngày đăng" }).click();
  const calendar = page.getByRole("dialog").filter({ has: page.getByRole("grid") });
  await expect(calendar).toBeVisible();
  await shot(page, `${IMG}-ngay-dang`, {
    area: publish,
    include: [calendar],
    marks: [
      { n: 1, target: calendar.getByRole("grid"), at: "left" },
      { n: 2, target: calendar.getByRole("textbox", { name: "Giờ đăng" }), at: "left" },
      { n: 3, target: calendar.getByRole("button", { name: "Bây giờ" }), at: "right" },
      { n: 4, target: calendar.getByLabel("Lên lịch nhanh"), at: "left" },
    ],
  });
  await calendar.getByRole("button", { name: "Mai 9:00" }).click();
  await expect(calendar).toBeHidden();
  const note = publish.getByText(/^Đã lên lịch: tự hiển thị lúc/);
  await expect(note).toBeVisible();
  await shot(page, `${IMG}-len-lich`, {
    area: publish,
    marks: [
      { n: 1, target: publish.getByRole("radio", { name: "Xuất bản" }), at: "below" },
      { n: 2, target: note, at: "left" },
      { n: 3, target: publish.getByRole("button", { exact: true, name: "Ngày đăng" }), at: "left" },
    ],
  });
  await page.setViewportSize({ height: 800, width: 1280 });

  // ── Preview, then create ─────────────────────────────────────────────────────────────────────────────────
  await page.getByRole("tab", { name: "Xem trước" }).click();
  const preview = page.getByRole("dialog").filter({ hasText: TITLE });
  await expect(preview).toBeVisible();
  await shot(page, `${IMG}-xem-truoc`, {
    marks: [
      { n: 1, target: preview.getByText("Máy tính", { exact: true }), at: "below" },
      { n: 2, target: preview.getByText("Điện thoại", { exact: true }), at: "below" },
      { n: 3, target: preview.getByText("Thẻ & Google", { exact: true }), at: "below" },
      { n: 4, target: preview.getByText("Đóng", { exact: true }), at: "below" },
    ],
  });
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();

  await page.getByRole("button", { name: /Tạo mới/ }).click();
  await page.waitForURL((url) => /\/admin\/posts\/(?!new)[^/]+$/.test(url.pathname));
  await expect(page.getByText("Đã lên lịch", { exact: true }).first()).toBeVisible();
  await noToasts(page);

  // ── The list ─────────────────────────────────────────────────────────────────────────────────────────────
  // The table is wider than 1280px: the whole of it, actions included.
  await page.setViewportSize({ height: 800, width: 1440 });
  await page.goto("/admin/posts");
  const sample = page.locator("tbody tr").filter({ hasText: TITLE });
  await expect(sample).toBeVisible();
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Viết bài mới" }), at: "below" },
      { n: 2, target: page.getByRole("link", { name: "Trang Blog" }), at: "below" },
      { n: 3, target: page.getByRole("textbox", { name: "Tìm kiếm" }), at: "below" },
      { n: 4, target: page.getByRole("button", { exact: true, name: "Trạng thái" }).first(), at: "below" },
      { n: 5, target: page.getByRole("button", { exact: true, name: "Thẻ" }), at: "below" },
      { n: 6, target: sample.getByText("Đã lên lịch", { exact: true }), at: "below" },
      { n: 7, target: sample.locator("td").nth(5), at: "below" },
      { n: 8, target: sample.getByRole("button", { name: "Thao tác" }), at: "below" },
    ],
  });

  // The menu of a published post. While it is open the rest of the page is hidden from the accessibility tree.
  const published = page.locator("tbody tr").filter({ hasText: "Vui Fest Cát Bà" });
  await published.getByRole("button", { name: "Thao tác" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-thao-tac`, {
    area: page.locator("tbody tr").filter({ hasText: "Vui Fest Cát Bà" }),
    include: [menu],
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "left" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Xem trên website" }), at: "left" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Chuyển về bản nháp" }), at: "left" },
      { n: 4, target: menu.getByRole("menuitem", { name: "Nhân bản" }), at: "left" },
      { n: 5, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "left" },
    ],
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ height: 800, width: 1280 });

  // ── Delete the sample ────────────────────────────────────────────────────────────────────────────────────
  await sample.getByRole("button", { name: "Thao tác" }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: confirm,
    marks: [{ n: 1, target: confirm.getByRole("button", { exact: true, name: "Xóa" }), at: "below" }],
  });
  await confirm.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(page.getByText("Đã xóa bài viết.")).toBeVisible();
  expect(localSql(`select count(*) from posts where slug like '${SLUG}%'`)).toBe("0");

  // ── A new post saved empty: every required field ──────────────────────────────────────────────
  await page.goto("/admin/posts/new");
  await expect(page.getByRole("textbox", { name: "Tiêu đề bài viết *" })).toBeVisible();
  await page.getByRole("button", { name: /Tạo mới/ }).click();
  await expect(page.getByText("Nhập tiêu đề bài viết.")).toBeVisible();
  await shot(page, `${IMG}-loi`, {
    marks: [
      { n: 1, target: page.getByText("Nhập tiêu đề bài viết."), at: "right", tight: true },
      { n: 2, target: page.getByText(/^Còn \d+ trường chưa hợp lệ$/), at: "right", tight: true },
      { n: 3, target: page.locator("[data-sonner-toast]").first(), at: "left" },
    ],
  });
  await noToasts(page);

  // ── On the website ───────────────────────────────────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 1050, width: 1280 });
  await site.goto("/blog");
  const first = site.getByRole("listitem").filter({ hasText: "Vui Fest Cát Bà" }).first();
  await expect(first).toBeVisible();
  await shot(site, `${IMG}-website`, {
    marks: [
      { n: 1, target: first.getByRole("img"), at: "left" },
      { n: 2, target: first.getByText(/^Hooked × Sun Group/), at: "right", tight: true },
      { n: 3, target: first.getByRole("heading"), at: "right", tight: true },
      { n: 4, target: first.getByRole("paragraph").last(), at: "right", tight: true },
    ],
  });

  await site.goto("/blog/vui-fest-cat-ba");
  const article = site.getByRole("article");
  await expect(article.getByRole("heading", { level: 1 })).toBeVisible();
  await shot(site, `${IMG}-website-bai`, {
    marks: [
      { n: 1, target: article.getByRole("heading", { level: 1 }), at: "left", tight: true },
      { n: 2, target: article.getByRole("paragraph").first(), at: "left" },
      { n: 3, target: article.getByRole("link", { name: "Tìm hiểu thêm về Vui Fest Cát Bà" }), at: "left" },
      { n: 4, target: article.getByRole("img").first(), at: "left" },
    ],
  });
  await site.close();
});
