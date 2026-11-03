#!/usr/bin/env node
/**
 * Builds src/admin/lib/cms/seed/media-manifest.json — the seed of the CMS media library.
 * Lists every image under public/images and public/icons with its pixel size and file size.
 *   pnpm media:manifest
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const OUT = join(ROOT, "src/admin/lib/cms/seed/media-manifest.json");
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  let offset = 2;
  while (offset < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    // SOF0–SOF15 except DHT (C4), JPG (C8), DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(buf) {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function svgSize(text) {
  const width = Number(/\bwidth="([\d.]+)/.exec(text)?.[1]);
  const height = Number(/\bheight="([\d.]+)/.exec(text)?.[1]);
  if (width && height) return { width: Math.round(width), height: Math.round(height) };
  const box = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/.exec(text);
  return box ? { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) } : { width: 24, height: 24 };
}

function sizeOf(file, ext) {
  const buf = readFileSync(file);
  // Sniff the real format: some ".png" exports are JPEGs.
  if (buf[0] === 0x89 && buf[1] === 0x50) return { ...pngSize(buf), mime: "image/png" };
  if (buf[0] === 0xff && buf[1] === 0xd8) return { ...jpegSize(buf), mime: "image/jpeg" };
  if (buf.toString("ascii", 0, 4) === "RIFF") return { ...webpSize(buf), mime: "image/webp" };
  if (ext === ".svg") return { ...svgSize(buf.toString("utf8")), mime: "image/svg+xml" };
  return null;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

const assets = [];
for (const base of ["images", "icons"]) {
  for (const file of walk(join(PUBLIC, base))) {
    const ext = extname(file).toLowerCase();
    if (!MIME[ext]) continue;
    const info = sizeOf(file, ext);
    if (!info?.width) continue;
    const url = "/" + relative(PUBLIC, file).split(sep).join("/");
    const folder = url.split("/").slice(1, -1).join("/");
    const name = url.split("/").pop();
    assets.push({
      url,
      name,
      folder,
      width: info.width,
      height: info.height,
      size: statSync(file).size,
      mime: info.mime,
    });
  }
}
assets.sort((a, b) => a.url.localeCompare(b.url));
writeFileSync(OUT, JSON.stringify(assets, null, 2) + "\n");
console.log(`media manifest: ${assets.length} assets → ${relative(ROOT, OUT)}`);
