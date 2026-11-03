import type { Entity, ImageRef } from "../types/shared";

/** Fixed reference date so the seed is deterministic (dashboard charts, "x ngày trước"). */
export const SEED_NOW = new Date("2026-11-02T09:00:00+07:00");

export function daysAgo(days: number, hour = 10, minute = 0) {
  const date = new Date(SEED_NOW);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/** Entity timestamps for seeded items. */
export function stamp(id: string, createdDaysAgo: number, updatedDaysAgo = createdDaysAgo): Entity {
  return { id, createdAt: daysAgo(createdDaysAgo), updatedAt: daysAgo(updatedDaysAgo) };
}

/** Site `Photo` / `ProjectImage` ({ src, alt, width, height }) → CMS `ImageRef`. */
export function img(photo: { src: string; alt?: string; width?: number; height?: number }, alt?: string): ImageRef {
  return { url: photo.src, alt: alt ?? photo.alt ?? "", width: photo.width, height: photo.height };
}
