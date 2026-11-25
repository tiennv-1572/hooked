import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Width and height of a guide screenshot under `public/`, read from the PNG header (bytes 16–23), so the page
 * reserves the right space before the picture loads. `null` when the file is missing — the page then shows
 * a placeholder instead of a broken image (pages are written before their screenshots exist).
 */
export function guideImageSize(src: string): { height: number; width: number } | null {
  const file = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
  if (!src.endsWith(".png") || !existsSync(file)) return null;
  const header = readFileSync(file).subarray(0, 24);
  if (header.length < 24 || header.toString("ascii", 1, 4) !== "PNG") return null;
  return { height: header.readUInt32BE(20), width: header.readUInt32BE(16) };
}
