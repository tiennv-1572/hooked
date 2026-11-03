import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

import { CmsError } from "@/admin/lib/cms/adapter";
import type { MediaAsset } from "@/admin/lib/cms/types/shared";

import { createItem } from "./repository";

/** Uploaded files live outside `public/` (Next only serves files that existed at build time from there). */
export const UPLOAD_ROOT = join(process.cwd(), "storage", "uploads");
export const UPLOAD_URL_PREFIX = "/uploads";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/svg+xml", ".svg"],
  ["image/avif", ".avif"],
]);

/** Pixel size from the file header (PNG, JPEG, GIF, WebP, SVG) — no native image library needed. */
export function imageSize(buf: Buffer, mime: string): { width: number; height: number } {
  try {
    if (mime === "image/png") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (mime === "image/gif") return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (mime === "image/jpeg") {
      let offset = 2;
      while (offset < buf.length) {
        const marker = buf[offset + 1];
        const length = buf.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
        }
        offset += 2 + length;
      }
    }
    if (mime === "image/webp") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = buf.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
    if (mime === "image/svg+xml") {
      const text = buf.toString("utf8", 0, 2048);
      const width = Number(/\bwidth="([\d.]+)/.exec(text)?.[1]);
      const height = Number(/\bheight="([\d.]+)/.exec(text)?.[1]);
      if (width && height) return { width: Math.round(width), height: Math.round(height) };
    }
  } catch {
    // fall through
  }
  return { width: 0, height: 0 };
}

function safeName(name: string) {
  const base = name
    .replace(/\.[a-z0-9]+$/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return base || "image";
}

export async function saveUpload(file: File, folder: string): Promise<MediaAsset> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new CmsError("Chỉ hỗ trợ ảnh PNG, JPG, WebP, GIF, SVG, AVIF.", "invalid");
  if (file.size > MAX_BYTES) throw new CmsError("Ảnh tối đa 8 MB.", "invalid");

  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const fileName = `${safeName(file.name)}-${crypto.randomUUID().slice(0, 8)}${ext}`;
  await mkdir(join(UPLOAD_ROOT, dir), { recursive: true });
  await writeFile(join(UPLOAD_ROOT, dir, fileName), buffer);
  const { width, height } = imageSize(buffer, file.type);

  return createItem("media", {
    url: `${UPLOAD_URL_PREFIX}/${dir}/${fileName}`,
    name: file.name,
    alt: file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
    width,
    height,
    size: file.size,
    mime: file.type,
    folder: folder.replace(/[^a-z0-9/_-]/gi, "").slice(0, 120) || "uploads",
    source: "upload",
  });
}

/** Resolve `/uploads/<path>` to a file inside UPLOAD_ROOT (path traversal safe). */
export async function readUpload(segments: string[]) {
  const target = normalize(join(UPLOAD_ROOT, ...segments));
  if (!target.startsWith(UPLOAD_ROOT + sep)) return null;
  try {
    const info = await stat(target);
    if (!info.isFile()) return null;
    const mime =
      [...ALLOWED.entries()].find(([, value]) => value === extname(target).toLowerCase())?.[0] ??
      "application/octet-stream";
    return { body: await readFile(target), mime, size: info.size, mtime: info.mtime };
  } catch {
    return null;
  }
}
