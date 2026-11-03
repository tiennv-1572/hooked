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

/** "1" → "01" for slide counters. */
export function pad2(value: number) {
  return String(value).padStart(2, "0");
}
