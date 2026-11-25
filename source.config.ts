import { defineConfig, defineDocs } from "fumadocs-mdx/config";

/**
 * Hướng dẫn sử dụng CMS (`/huong-dan`): MDX in `content/huong-dan`, one folder per CMS sidebar group.
 * Generated into `.source/` by fumadocs-mdx (on `next dev` / `next build`, or `npx fumadocs-mdx`).
 */
export const guide = defineDocs({ dir: "content/huong-dan" });

export default defineConfig();
