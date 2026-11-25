/**
 * Hướng dẫn CMS — what every screenshot script uses (`pnpm docs:screenshots`, docs/huong-dan/WRITING.md).
 *
 * `shot()` writes `public/huong-dan/anh/<file>.png`, the path a `<Screenshot src="/huong-dan/anh/<file>.png">`
 * of the guide shows. Numbered marks (①②③) are drawn on the page before the picture and removed after, so
 * the steps of the text can point at them.
 */
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import type { Locator, Page } from "@playwright/test";

export const IMAGE_DIR = path.join(process.cwd(), "public", "huong-dan", "anh");

/** The screenshot stack's database (scripts/huong-dan/stack.sh: DB_CONTAINER, DB_NAME). */
export const LOCAL_DB = { container: "huong-dan-mysql", database: "hooked_huong_dan" } as const;

/** The seeded accounts (src/admin/lib/cms/seed/system.ts), one per role; stack.sh seeds them with this password. */
const PASSWORD = "hooked2026";
export const ACCOUNTS = {
  /** Chủ sở hữu — "Hooked Admin". */
  owner: "admin@hooked.vn",
  /** Quản trị — "Trần Minh Anh". */
  admin: "academy@hooked.vn",
  /** Biên tập — "Lê Thu Hà". */
  editor: "content@hooked.vn",
} as const;
export type Role = keyof typeof ACCOUNTS;

/** Signs in on the CMS login page and waits for the CMS (or the `next` page it was sent from). */
export async function login(page: Page, role: Role = "owner") {
  await page.goto("/admin/login");
  // Hydration + the session probe first, otherwise a fast fill races the form's default values.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email", { exact: true }).fill(ACCOUNTS[role]);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/admin/login"), { timeout: 60_000 }),
    page.getByRole("button", { name: "Đăng nhập" }).click(),
  ]);
}

/** A numbered mark: an outline around `target` and its number in a badge at the top-left corner. */
export type MarkPlace = "above" | "below" | "corner" | "left" | "right";

export type Mark = {
  n: number;
  target: Locator;
  /**
   * Where the number sits: "corner" (default, top-left corner of the outline), "right" or "left" (beside it,
   * centred), "below" or "above" (under or over it, centred). Beside it for a target that is just text: the corner
   * badge would cover its first letter; below or above it for a row of buttons or icons, where numbers beside them
   * would collide.
   */
  at?: MarkPlace;
  /** Outline the text itself rather than its element (a block of text is as wide as its container). */
  tight?: boolean;
};

export type ShotOptions = {
  /** E-mail addresses the picture may show besides the company's (COMPANY_EMAIL). Any other one fails the shot. */
  allowEmails?: RegExp;
  /** Only this part of the page, with a margin (default: the whole window). */
  area?: Locator;
  /** Grow the window to the page's height first, for a long form (no stitching of sticky parts). */
  fitHeight?: boolean;
  /** Hidden for the picture only, e.g. the website's floating "Liên hệ nhanh" bar. */
  hide?: Locator[];
  marks?: Mark[];
  /** Margin around `area`, px. */
  padding?: number;
};

const MARK_COLOR = "#e5484d";
/** Registrations are `@example.com` people in the stack (prepare-db.ts); anything else is a leak. */
const SAMPLE_EMAIL = /@example\.com$/i;
/** Public addresses of Hooked: staff accounts and the contact e-mail of the website (src/lib/site.ts). */
const COMPANY_EMAIL = /(@hooked\.vn|^hooked\.vie@gmail\.com)$/i;
/** The live website (GUIDE_SITE_URL): what a local or dev address on screen is shown as. */
const SITE_URL = "https://hooked.vn";

/**
 * Saves `public/huong-dan/anh/<file>.png`, e.g. `shot(page, "quan-ly-academy/danh-muc-khoa-hoc-danh-sach", …)`.
 * Fails when the visible text holds an e-mail address that is not a sample one (see `allowEmails`).
 */
export async function shot(page: Page, file: string, options: ShotOptions = {}) {
  const { allowEmails, area, fitHeight = false, hide = [], marks = [], padding = 16 } = options;
  const viewport = page.viewportSize();

  await settle(page);
  if (fitHeight && viewport) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ height: Math.min(Math.max(height, viewport.height), 4000), width: viewport.width });
    await settle(page);
  }
  await assertNoRealEmails(page, allowEmails);

  // One scroll, then every box is measured in the same window.
  await scrollClearOfHeader(page, area ?? marks[0]?.target);
  // A picture above that finishes loading can still push everything down: measure once nothing moves.
  await untilStill(area ?? marks[0]?.target);
  const boxes = await Promise.all(
    marks.map(async (mark) => ({
      ...(mark.tight ? await textBoxOf(mark.target, mark.n) : await boxOf(mark.target, mark.n)),
      at: mark.at ?? "corner",
      n: mark.n,
    })),
  );
  // The area grows to take in every mark and its number (a number beside a full-width box is outside the box).
  const clip = area ? await clipAround(page, area, padding, boxes.map(markExtent)) : undefined;

  for (const locator of hide)
    await locator.evaluateAll((nodes) => nodes.forEach((node) => node.setAttribute("data-huong-dan-hidden", "")));
  await page.evaluate(prepareForPicture, SITE_URL);
  await page.evaluate(drawMarks, { boxes, color: MARK_COLOR });

  const target = path.join(IMAGE_DIR, `${file}.png`);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const png = await page.screenshot({ animations: "disabled", caret: "hide", clip });
    await writeFile(target, await compress(png));
  } finally {
    await page.evaluate(() => {
      document.getElementById("huong-dan-marks")?.remove();
      document.getElementById("huong-dan-hide")?.remove();
      document
        .querySelectorAll("[data-huong-dan-hidden]")
        .forEach((node) => node.removeAttribute("data-huong-dan-hidden"));
      const texts = (window as unknown as { huongDanTexts?: [Text, string][] }).huongDanTexts ?? [];
      for (const [node, text] of texts) node.data = text;
      for (const field of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "[data-huong-dan-placeholder]",
      )) {
        field.placeholder = field.dataset.huongDanPlaceholder ?? field.placeholder;
        delete field.dataset.huongDanPlaceholder;
      }
      for (const field of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-huong-dan-value]")) {
        field.value = field.dataset.huongDanValue ?? field.value;
        delete field.dataset.huongDanValue;
      }
    });
    if (fitHeight && viewport) await page.setViewportSize(viewport);
  }
}

/** Fonts loaded, pictures in the window decoded, no request in flight — each capped, a video never settles. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
  await page.evaluate(async () => {
    const atMost = (promise: Promise<unknown>, ms: number) =>
      Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);
    await atMost(document.fonts.ready, 3_000);
    const visible = [...document.images].filter((image) => {
      const box = image.getBoundingClientRect();
      return box.bottom > 0 && box.top < window.innerHeight;
    });
    await atMost(
      Promise.all(
        visible.map((image) =>
          image.complete && image.naturalWidth > 0
            ? undefined
            : new Promise((resolve) => {
                image.addEventListener("load", resolve, { once: true });
                image.addEventListener("error", resolve, { once: true });
              }),
        ),
      ),
      15_000,
    );
  });
  // next/image fades pictures in.
  await page.waitForTimeout(400);
}

async function assertNoRealEmails(page: Page, allow?: RegExp) {
  const text = await page.evaluate(() => document.body.innerText);
  const leaks = [...new Set(text.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g) ?? [])].filter(
    (email) => !SAMPLE_EMAIL.test(email) && !COMPANY_EMAIL.test(email) && !(allow && allow.test(email)),
  );
  if (leaks.length > 0) {
    throw new Error(`Ảnh có email không phải dữ liệu mẫu: ${leaks.join(", ")} (che, hoặc thêm vào allowEmails).`);
  }
}

/** The box of the text inside `target` (a Range over its contents), not of the element. */
async function textBoxOf(target: Locator, n: number) {
  await boxOf(target, n);
  return target.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const { height, width, x, y } = range.getBoundingClientRect();
    return { height, width, x, y };
  });
}

async function boxOf(target: Locator, n: number) {
  const box = await target.boundingBox();
  if (!box) throw new Error(`Không thấy phần tử của dấu ${n}.`);
  return box;
}

/**
 * In the browser: hides what `hide` marked, and a local or dev server address in a text field (an image
 * path) reads as the live site's, as staff will see it. Put back after the picture — the form still
 * submits the real value.
 */
function prepareForPicture(siteUrl: string) {
  const host = siteUrl.replace(/^https?:\/\//, "");
  const show = (value: string) =>
    value
      .replace(/https?:\/\/(localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?/gi, siteUrl)
      .replace(/\b(localhost|\d{1,3}(\.\d{1,3}){3}):\d+/gi, host);
  for (const field of document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")) {
    const placeholder = show(field.placeholder);
    if (placeholder !== field.placeholder) {
      field.dataset.huongDanPlaceholder = field.placeholder;
      field.placeholder = placeholder;
    }
    const shown = show(field.value);
    if (shown === field.value) continue;
    field.dataset.huongDanValue = field.value;
    field.value = shown;
  }
  // Text too (a review screen lists a picture's address); originals are put back after the picture.
  const changed: [Text, string][] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const text = node.data;
    const shown = show(text);
    if (shown === text) continue;
    changed.push([node, text]);
    node.data = shown;
  }
  (window as unknown as { huongDanTexts?: [Text, string][] }).huongDanTexts = changed;
  const style = document.createElement("style");
  style.id = "huong-dan-hide";
  style.textContent = "[data-huong-dan-hidden]{visibility:hidden!important}";
  document.head.append(style);
}

/**
 * In the browser: the marks, in the top layer (a popover) so they also show over an open dialog, which
 * no z-index can cover. Boxes are window coordinates.
 */
function drawMarks({
  boxes,
  color,
}: {
  boxes: { at: MarkPlace; height: number; n: number; width: number; x: number; y: number }[];
  color: string;
}) {
  if (boxes.length === 0) return;
  const layer = document.createElement("div");
  layer.id = "huong-dan-marks";
  layer.popover = "manual";
  layer.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none";
  for (const box of boxes) {
    const outline = document.createElement("div");
    outline.style.cssText = `position:absolute;left:${box.x - 4}px;top:${box.y - 4}px;width:${box.width + 8}px;height:${box.height + 8}px;border:3px solid ${color};border-radius:8px;box-sizing:border-box`;
    const badge = document.createElement("div");
    badge.textContent = String(box.n);
    const middle = box.y + box.height / 2 - 13;
    const [left, top] =
      box.at === "right"
        ? [box.x + box.width + 10, middle]
        : box.at === "left"
          ? [box.x - 36, middle]
          : box.at === "below"
            ? [box.x + box.width / 2 - 13, box.y + box.height + 8]
            : box.at === "above"
              ? [box.x + box.width / 2 - 13, box.y - 34]
              : [box.x - 16, box.y - 16];
    badge.style.cssText = `position:absolute;left:${Math.max(left, 2)}px;top:${Math.max(top, 2)}px;width:26px;height:26px;border-radius:50%;background:${color};color:#fff;font:700 14px/26px system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px #fff,0 2px 6px rgba(0,0,0,.3)`;
    layer.append(outline, badge);
  }
  document.body.append(layer);
  layer.showPopover();
}

type Box = { height: number; width: number; x: number; y: number };

/** What a mark draws: its outline (4px out) and its number, as placed by drawMarks. */
function markExtent(box: Box & { at: MarkPlace }): Box {
  const middle = box.y + box.height / 2 - 13;
  const badge =
    box.at === "right"
      ? { x: box.x + box.width + 10, y: middle }
      : box.at === "left"
        ? { x: box.x - 36, y: middle }
        : box.at === "below"
          ? { x: box.x + box.width / 2 - 13, y: box.y + box.height + 8 }
          : box.at === "above"
            ? { x: box.x + box.width / 2 - 13, y: box.y - 34 }
            : { x: box.x - 16, y: box.y - 16 };
  const left = Math.min(box.x - 4, badge.x) - 4;
  const top = Math.min(box.y - 4, badge.y) - 4;
  const right = Math.max(box.x + box.width + 4, badge.x + 26) + 4;
  const bottom = Math.max(box.y + box.height + 4, badge.y + 26) + 4;
  return { height: bottom - top, width: right - left, x: left, y: top };
}

async function clipAround(page: Page, area: Locator, padding: number, include: Box[] = []) {
  const box = await boxOf(area, 0);
  const viewport = page.viewportSize() ?? { height: 800, width: 1280 };
  const all = [
    { height: box.height + 2 * padding, width: box.width + 2 * padding, x: box.x - padding, y: box.y - padding },
    ...include,
  ];
  const x = Math.max(Math.min(...all.map((b) => b.x)), 0);
  const y = Math.max(Math.min(...all.map((b) => b.y)), 0);
  return {
    height: Math.min(Math.max(...all.map((b) => b.y + b.height)), viewport.height) - y,
    width: Math.min(Math.max(...all.map((b) => b.x + b.width)), viewport.width) - x,
    x,
    y,
  };
}

/**
 * The innermost block that holds every one of `parts`, e.g. a form card around a field and its title. The parts must
 * be page-level locators (`page.getBy…`): one chained from another element is looked for inside each candidate.
 */
export function container(page: Page, ...parts: Locator[]): Locator {
  let block = page.locator("div, section, aside, article, header, form");
  for (const part of parts) block = block.filter({ has: part });
  return block.last();
}

/** Waits (at most ~3s) until `target` keeps the same box for two checks in a row. */
async function untilStill(target: Locator | undefined) {
  if (!target) return;
  let last = "";
  for (let i = 0; i < 15; i += 1) {
    const box = JSON.stringify(await target.boundingBox());
    if (box === last) return;
    last = box;
    await target.page().waitForTimeout(200);
  }
}

/** Into view, and not under a sticky page header (the CMS's is 56px, the website's taller). */
async function scrollClearOfHeader(page: Page, target: Locator | undefined) {
  if (!target) return;
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (box && box.y < 96 && (await page.evaluate(() => window.scrollY)) > 0) {
    await page.evaluate((by) => window.scrollBy(0, by), box.y - 112);
  }
}

/** The CMS card (`src/admin/components/ui/card.tsx`, a `FormSection` too) around `inside`. */
export function card(inside: Locator): Locator {
  return inside.locator("xpath=ancestor-or-self::*[@data-slot='card'][1]");
}

/** The open dialog (CMS `Dialog`, confirm boxes). */
export function dialog(page: Page, name?: string | RegExp): Locator {
  return page
    .getByRole("dialog", name ? { name } : undefined)
    .or(page.getByRole("alertdialog", name ? { name } : undefined));
}

/** Waits until every toast ("Đã lưu…") is gone, so it is not in the next picture. */
export async function noToasts(page: Page) {
  await page
    .locator("[data-sonner-toast]")
    .first()
    .waitFor({ state: "detached", timeout: 15_000 })
    .catch(() => undefined);
}

/**
 * Runs SQL on the screenshot stack's database (never the developer's `hooked-mysql`): tidying what the CMS cannot,
 * such as a sample left over by a run that failed half-way. Returns the rows, tab-separated.
 */
export function localSql(sql: string): string {
  return execFileSync(
    "docker",
    [
      "exec",
      LOCAL_DB.container,
      "mysql",
      "--default-character-set=utf8mb4",
      "-uhooked",
      "-phooked",
      "-N",
      "-B",
      "-e",
      sql,
      LOCAL_DB.database,
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
}

/**
 * A screenshot as a 256-colour PNG: about a third of the size, text still sharp (the guide ships every
 * picture in the repo). Without sharp the picture is kept as taken.
 *
 * Next's own sharp, on purpose not a dependency of this repo: declared as a devDependency, npm marks its Linux
 * binaries dev-only in package-lock.json, and the host's `npm ci --omit=dev` would skip them — Next would lose its
 * image optimisation in production.
 */
type Sharp = (input: Buffer) => { png(options: object): { toBuffer(): Promise<Buffer> } };

async function compress(png: Buffer): Promise<Buffer> {
  try {
    const fromRepo = createRequire(path.join(process.cwd(), "package.json"));
    const sharp = createRequire(fromRepo.resolve("next/package.json"))("sharp") as Sharp;
    return await sharp(png).png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 }).toBuffer();
  } catch {
    return png;
  }
}
