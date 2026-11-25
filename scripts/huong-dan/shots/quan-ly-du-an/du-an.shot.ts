/**
 * Ảnh của trang "Quản lý dự án › Dự án" (content/huong-dan/quan-ly-du-an/du-an.mdx).
 * Tạo dự án mẫu "Đà Nẵng Beach Rave 2026", chụp form từng phần, xuất bản để thấy nó chưa có trong lưới "Tất cả", rồi xóa
 * nó qua giao diện: chạy lại bao nhiêu lần cũng ra cùng ảnh. Ảnh website chụp trên các dự án có sẵn.
 */
import { expect, test } from "@playwright/test";

import { card, container, dialog, localSql, login, noToasts, shot } from "../kit";

const IMG = "quan-ly-du-an/du-an";
const NAME = "Đà Nẵng Beach Rave 2026";
const SLUG = "da-nang-beach-rave-2026";
const DESCRIPTION =
  "Đêm nhạc EDM bên bờ biển Mỹ Khê với 5.000 khán giả. Hooked phụ trách tổ chức sự kiện, booking nghệ sĩ và sản xuất video recap.";

test("Dự án", async ({ page }) => {
  // A run that failed half-way may have left the sample (or a copy of it) behind.
  localSql(`delete from projects where name like '${NAME}%'`);

  await login(page);

  // ── The list (grid view) ─────────────────────────────────────────────────────────────────────────────────
  await page.goto("/admin/projects");
  const firstCard = page.getByRole("article").filter({ hasText: "Devoid Music Festival" });
  await expect(firstCard).toBeVisible();
  await shot(page, `${IMG}-danh-sach`, {
    marks: [
      { n: 1, target: page.getByRole("link", { name: "Thêm dự án" }), at: "below" },
      { n: 2, target: page.getByRole("button", { name: "Sắp xếp" }), at: "below" },
      { n: 3, target: page.getByRole("link", { exact: true, name: "Danh mục" }), at: "below" },
      { n: 4, target: page.getByRole("textbox", { name: "Tìm dự án" }) },
      { n: 5, target: page.getByRole("button", { exact: true, name: "Danh mục" }) },
      { n: 6, target: page.getByRole("button", { exact: true, name: "Trạng thái" }) },
      { n: 7, target: page.getByRole("radiogroup", { name: "Kiểu hiển thị" }) },
      { n: 8, target: firstCard.getByText("#1", { exact: true }), at: "above", tight: true },
      { n: 9, target: page.getByRole("button", { name: "Thao tác cho Devoid Music Festival" }), at: "left" },
    ],
  });

  // The card menu. While it is open the rest of the page is hidden from the accessibility tree: CSS locators.
  await page.getByRole("button", { name: "Thao tác cho SPIN Awards" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await shot(page, `${IMG}-thao-tac`, {
    area: page.locator("article").nth(1),
    marks: [
      { n: 1, target: menu.getByRole("menuitem", { name: "Chỉnh sửa" }), at: "right" },
      { n: 2, target: menu.getByRole("menuitem", { name: "Xem trên website" }), at: "right" },
      { n: 3, target: menu.getByRole("menuitem", { name: "Chuyển về bản nháp" }), at: "right" },
      { n: 4, target: menu.getByRole("menuitem", { name: "Nhân bản" }), at: "right" },
      { n: 5, target: menu.getByRole("menuitem", { name: "Xóa" }), at: "right" },
    ],
  });
  await page.keyboard.press("Escape");

  // ── A new project, section by section ─────────────────────────────────────────────────────────────────────
  await page.goto("/admin/projects/new");
  await expect(page.getByRole("heading", { name: "Dự án mới" })).toBeVisible();

  await page.getByRole("textbox", { name: "Tên dự án *" }).fill(NAME);
  await expect(page.getByRole("textbox", { name: "Đường dẫn (slug)" })).toHaveValue(SLUG);
  const description = card(page.getByText("Thông tin chung", { exact: true })).locator('[contenteditable="true"]');
  await description.click();
  await page.keyboard.type(DESCRIPTION);
  await page.getByRole("button", { exact: true, name: "Event production" }).click();
  await page.getByRole("button", { exact: true, name: "Media" }).click();
  await page.getByRole("button", { name: "Thêm đối tác" }).click();
  await page.getByRole("textbox", { name: "Sun Group" }).last().fill("Sun Group");

  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${IMG}-form`, {
    marks: [
      { n: 1, target: page.getByRole("textbox", { name: "Tên dự án *" }), at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: "Đường dẫn (slug)" }).locator("xpath=..") },
      { n: 3, target: description, at: "left" },
      { n: 4, target: page.getByRole("radiogroup", { name: "Trạng thái" }), at: "left" },
      { n: 5, target: card(page.getByText("Xem trước thẻ dự án", { exact: true })), at: "left" },
    ],
  });

  const categories = card(page.getByText("Hiển thị dưới tên dự án và ở mục “Dịch vụ cung cấp” theo thứ tự bạn chọn."));
  await shot(page, `${IMG}-form-danh-muc`, {
    area: categories,
    fitHeight: true,
    marks: [
      // One mark for the chips (above "Media": above the first chip is the card's title).
      { n: 1, target: page.getByRole("button", { exact: true, name: "Media" }), at: "above" },
      { n: 2, target: page.getByRole("link", { name: "Quản lý danh mục" }), at: "right" },
      { n: 3, target: page.getByRole("textbox", { name: "Sun Group" }).last(), at: "above" },
      { n: 4, target: page.getByRole("button", { name: "Thêm đối tác" }), at: "right" },
    ],
  });

  // Pictures: the poster first; the hero image is still empty, with its "Dùng ảnh bìa" shortcut.
  const pictures = card(page.getByText("Ảnh bìa & hero", { exact: true }));
  await pictures.getByRole("button", { name: "Chọn hoặc tải ảnh lên" }).first().click();
  const library = dialog(page, "Chọn một ảnh");
  await library.getByPlaceholder("Tìm theo tên…").fill("ambient-stage-light");
  await library.locator('button[title="ambient-stage-light.png"]').click();
  await library.getByRole("button", { name: "Chọn ảnh" }).click();
  await expect(library).toBeHidden();
  const useCover = page.getByRole("button", { name: "Dùng ảnh bìa" });
  await shot(page, `${IMG}-form-anh`, {
    area: pictures,
    fitHeight: true,
    marks: [
      { n: 1, target: pictures.getByText("Ảnh bìa (poster thẻ dự án)"), at: "right", tight: true },
      { n: 2, target: pictures.getByText("Ảnh hero (trang chi tiết)"), at: "right", tight: true },
      { n: 3, target: useCover, at: "right" },
    ],
  });
  await useCover.click();

  const album = card(page.getByText("Album ảnh", { exact: true }));
  await page.getByRole("button", { exact: true, name: "Thêm ảnh" }).click();
  const many = dialog(page, "Chọn ảnh");
  await many.getByPlaceholder("Tìm theo tên…").fill("photo-");
  const tiles = many.locator("button[title]");
  for (const index of [0, 1, 2]) await tiles.nth(index).click();
  await many.getByRole("button", { name: "Chọn 3 ảnh" }).click();
  await expect(many).toBeHidden();
  await shot(page, `${IMG}-form-album`, {
    area: album,
    fitHeight: true,
    marks: [
      { n: 1, target: page.getByRole("button", { exact: true, name: "Thêm ảnh" }), at: "left" },
      { n: 2, target: album.getByRole("button", { name: "Kéo để sắp xếp" }).first(), at: "left" },
      { n: 3, target: page.getByRole("textbox", { name: "Nhãn liên kết dưới album *" }), at: "left" },
      { n: 4, target: page.getByRole("textbox", { exact: true, name: "Đường dẫn" }), at: "right" },
    ],
  });

  // A video: a full YouTube link becomes its ID; then it is made the card's video.
  const videos = card(page.getByText("Video YouTube trong album và video phát từ thẻ dự án."));
  await page.getByRole("button", { name: "Thêm video" }).click();
  const link = page.getByRole("textbox", { name: /Link hoặc ID YouTube/ });
  await link.fill("https://www.youtube.com/watch?v=EmbpvTQbrCs&t=12s");
  await expect(link).toHaveValue("EmbpvTQbrCs");
  await page.getByRole("textbox", { name: /Tiêu đề video/ }).fill(`${NAME} | Recap`);
  await page.getByRole("button", { name: "Đặt làm video nổi bật" }).click();
  await expect(page.getByRole("button", { name: "Đang là video nổi bật" })).toBeVisible();
  await shot(page, `${IMG}-form-video`, {
    area: videos,
    fitHeight: true,
    marks: [
      { n: 1, target: link, at: "left" },
      { n: 2, target: page.getByRole("textbox", { name: /Tiêu đề video/ }), at: "left" },
      { n: 3, target: page.getByRole("button", { name: "Đang là video nổi bật" }), at: "right" },
      { n: 4, target: videos.getByRole("button", { name: "Chọn ảnh riêng" }), at: "below" },
      { n: 5, target: page.getByRole("button", { name: "Thêm video" }), at: "right" },
      { n: 6, target: page.getByRole("combobox", { name: "Video nổi bật trên thẻ dự án" }), at: "left" },
    ],
  });

  // Create: the screen becomes the project's own page, still a draft.
  await page.getByRole("button", { name: /Tạo mới/ }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/(?!new)[^/]+$/);
  const created = page.locator("[data-sonner-toast]").filter({ hasText: "Đã tạo dự án." });
  await expect(created).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, `${IMG}-da-tao`, {
    marks: [
      { n: 1, target: created, at: "left" },
      // The header's status pill (the aside's radio says "Bản nháp" too).
      { n: 2, target: page.getByText("Bản nháp", { exact: true }).first(), at: "below" },
    ],
  });
  await noToasts(page);

  // Published, it shows under its categories, but not in the "Tất cả" grid: no cell has it yet.
  await page.getByRole("radio", { name: /Đã xuất bản/ }).click();
  await page.keyboard.press("ControlOrMeta+s");
  await expect(page.locator("[data-sonner-toast]").filter({ hasText: "Đã lưu thay đổi." })).toBeVisible();
  await noToasts(page);
  await page.goto("/admin/project-layout");
  const unplaced = page.getByText(`Chưa có trong lưới “Tất cả”: ${NAME}.`);
  await expect(unplaced).toBeVisible();
  await shot(page, `${IMG}-chua-co-trong-luoi`, {
    area: card(unplaced),
    marks: [{ n: 1, target: unplaced, at: "right", tight: true }],
  });

  // ── Delete the sample (from the list: the confirmation names its page) ─────────────────────────────────
  await page.goto("/admin/projects");
  await page.getByRole("button", { name: `Thao tác cho ${NAME}` }).click();
  await page.getByRole("menuitem", { name: "Xóa" }).click();
  const askDelete = dialog(page, `Xóa dự án "${NAME}"?`);
  await expect(askDelete).toBeVisible();
  await shot(page, `${IMG}-xoa`, {
    area: askDelete,
    marks: [
      { n: 1, target: askDelete.getByText(/sẽ không còn truy cập được/), at: "left" },
      { n: 2, target: askDelete.getByRole("button", { exact: true, name: "Xóa" }), at: "right" },
    ],
  });
  await askDelete.getByRole("button", { exact: true, name: "Xóa" }).click();
  await expect(page.getByText("Đã xóa dự án.")).toBeVisible();
  expect(localSql(`select count(*) from projects where name like '${NAME}%'`)).toBe("0");

  // ── On the website: a card, then a project page ──────────────────────────────────────────────────────────
  const site = await page.context().newPage();
  await site.setViewportSize({ height: 900, width: 1280 });
  await site.goto("/projects");
  const devoid = site.getByRole("article").filter({ hasText: "Devoid Music Festival" });
  await expect(devoid).toBeVisible();
  await site.mouse.move(0, 0);
  await shot(site, `${IMG}-website-the`, {
    area: devoid,
    marks: [
      { n: 1, target: devoid.getByRole("img", { name: "Devoid Music Festival" }) },
      { n: 2, target: devoid.getByRole("button", { name: /^Phát video/ }), at: "right" },
      { n: 3, target: devoid.getByRole("heading", { name: "Devoid Music Festival" }), at: "right", tight: true },
      {
        n: 4,
        target: devoid.getByText(
          "Event production · Artist management · Media · Music consultant · International artists booking",
        ),
        at: "right",
        tight: true,
      },
    ],
  });

  // Tall enough for the whole hero picture.
  await site.setViewportSize({ height: 1300, width: 1280 });
  await site.goto("/projects/frequency-arena");
  const heading = site.getByRole("heading", { level: 1 });
  const hero = site.getByRole("button", { name: "Mở album ảnh Frequency Arena Face2Face EDM Battle" });
  await expect(hero).toBeVisible();
  await shot(site, `${IMG}-website-chi-tiet`, {
    area: container(site, heading, hero),
    marks: [
      { n: 1, target: heading, at: "right", tight: true },
      {
        n: 2,
        target: site.getByText("Event production · Artist management · Media · Music consultant").first(),
        at: "right",
        tight: true,
      },
      { n: 3, target: hero },
    ],
  });

  const about = site.getByRole("region", { name: "Về dự án" });
  await shot(site, `${IMG}-website-thong-tin`, {
    area: about,
    marks: [
      { n: 1, target: about.getByText("Đối tác", { exact: true }).locator("xpath=.."), at: "left" },
      { n: 2, target: about.getByText("Dịch vụ cung cấp", { exact: true }).locator("xpath=.."), at: "left" },
      { n: 3, target: about.getByRole("heading", { name: "Mô tả dự án" }).locator("xpath=.."), at: "left" },
    ],
  });

  await site.setViewportSize({ height: 1400, width: 1280 });
  const media = site.getByRole("region", { name: "Ảnh & video" });
  await shot(site, `${IMG}-website-album`, {
    area: media,
    marks: [
      { n: 1, target: media.getByRole("button", { name: /^Phóng to ảnh/ }).first(), at: "left" },
      { n: 2, target: media.getByRole("button", { name: /^Xem video/ }).first(), at: "above" },
      { n: 3, target: media.getByRole("button", { name: "Xem toàn bộ album ảnh" }), at: "right" },
    ],
  });
  await site.close();
});
