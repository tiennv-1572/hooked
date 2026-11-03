/**
 * Data migrations SQL cannot express, run after the schema migrations by `pnpm db:migrate`. Every step is idempotent.
 *
 * - Blog posts: paragraph blocks move from inline markdown (`text`) to rich-text HTML (`html`) and consecutive
 *   paragraphs merge into one block; the `excerpt` field is dropped (the index card text comes from the intro);
 *   the intro moves from inline markdown to rich-text HTML.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

type Block = { id: string; type: string; text?: string; html?: string; [key: string]: unknown };
type PostDoc = { intro?: unknown; blocks?: Block[]; excerpt?: unknown; [key: string]: unknown };

/** Rich-text HTML from the editor always starts with a block tag; inline markdown never does. */
const isHtml = (text: string) => /^\s*<(p|ul|ol|blockquote)[\s>]/i.test(text);

async function main() {
  const { eq } = await import("drizzle-orm");
  const { getDb, schema } = await import("../src/server/db/client");
  const { inlineMarkdownToHtml } = await import("../src/admin/lib/cms/inline");

  /** Returns the migrated doc, or null when it is already up to date. */
  function migratePost(doc: PostDoc): PostDoc | null {
    const legacy = (doc.blocks ?? []).some((block) => block.type === "paragraph" && typeof block.text === "string");
    const legacyIntro = typeof doc.intro === "string" && !isHtml(doc.intro);
    if (!legacy && !legacyIntro && !("excerpt" in doc)) return null;
    const blocks: Block[] = [];
    for (const block of doc.blocks ?? []) {
      const current =
        block.type === "paragraph" && typeof block.text === "string"
          ? { id: block.id, type: "paragraph", html: inlineMarkdownToHtml(block.text) }
          : block;
      const last = blocks.at(-1);
      if (current.type === "paragraph" && last?.type === "paragraph") last.html = `${last.html ?? ""}${current.html}`;
      else blocks.push(current);
    }
    const { excerpt: _excerpt, ...rest } = doc;
    void _excerpt;
    return { ...rest, ...(legacyIntro ? { intro: inlineMarkdownToHtml(doc.intro as string) } : {}), blocks };
  }

  const db = getDb();
  const rows = await db.select({ id: schema.posts.id, doc: schema.posts.doc }).from(schema.posts);
  let updated = 0;
  for (const row of rows) {
    const next = migratePost((row.doc ?? {}) as PostDoc);
    if (!next) continue;
    await db.update(schema.posts).set({ doc: next }).where(eq(schema.posts.id, row.id));
    updated += 1;
  }
  console.log(`✔ posts: ${updated}/${rows.length} migrated (rich-text paragraphs and intro, no excerpt)`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
