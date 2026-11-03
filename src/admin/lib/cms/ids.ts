/** Short unique id with a readable prefix ("cour_k3f9x2"). */
export function createId(prefix = "id") {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}`;
}

/**
 * Slug generated from a name, unique among `taken`: on a clash "-1" is appended, again and again if needed
 * ("kimmy" → "kimmy-1" → "kimmy-1-1").
 */
export function autoSlug(source: string, taken: Iterable<string>, fallback = "item") {
  const used = new Set(taken);
  let slug = slugify(source) || fallback;
  while (used.has(slug)) slug = `${slug}-1`;
  return slug;
}

/** Vietnamese-aware slug: "Vui Fest Cát Bà" → "vui-fest-cat-ba". */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
