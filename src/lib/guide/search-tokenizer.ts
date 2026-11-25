import type { createFromSource } from "fumadocs-core/search/server";

type SearchTokenizer = NonNullable<NonNullable<Parameters<typeof createFromSource>[1]>["tokenizer"]>;

/**
 * "quản trị" → "quan tri": lower case, accents and "đ" folded. Applied to the pages when they are indexed and
 * to what the reader types, so a search typed without accents (as most people type on a phone) finds the
 * accented text. The default tokenizer folded only some Vietnamese letters: "dang nhap" found "Đăng nhập",
 * "quan tri" did not find "quản trị".
 */
export function foldVietnamese(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
}

/** Words of letters and digits, accent-folded; everything else separates them. */
export function tokenizeGuideText(raw: string): string[] {
  return foldVietnamese(raw)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export const guideSearchTokenizer: SearchTokenizer = {
  language: "english",
  normalizationCache: new Map(),
  tokenize: (raw: string) => tokenizeGuideText(raw),
};
