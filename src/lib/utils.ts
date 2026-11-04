import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Wrap an index into [0, length). Works for negative numbers. */
export function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

/**
 * `sizes` for an image drawn `factor` times larger than its frame (zoomed or cropped artwork), so the browser
 * fetches a variant sharp enough for what is actually shown: "(min-width: 1200px) 260px, 280px" × 1.3 →
 * "(min-width: 1200px) calc(260px * 1.3), calc(280px * 1.3)".
 */
export function scaleSizes(sizes: string, factor: number) {
  if (factor === 1) return sizes;
  return sizes
    .split(",")
    .map((entry) => entry.trim().replace(/(\S+)$/, (length) => `calc(${length} * ${factor})`))
    .join(", ");
}

/** "1" → "01" for slide counters. */
export function pad2(value: number) {
  return String(value).padStart(2, "0");
}
