import { blogPosts } from "@/data/blog";

import { inlineToHtml, serializeInline } from "../inline";
import type { BlogPage, Post, PostBlock } from "../types/blog";
import { daysAgo, img, stamp } from "./helpers";

type SiteBlock = (typeof blogPosts)[number]["body"][number];

function toBlock(block: SiteBlock, id: string): PostBlock {
  switch (block.type) {
    case "paragraph":
      return { id, type: "paragraph", html: `<p>${inlineToHtml(block.content)}</p>` };
    case "heading":
      return { id, type: "heading", text: block.text };
    case "list":
      return { id, type: "list", items: block.items.map((item) => serializeInline(item)) };
    case "imagePair":
      return { id, type: "imagePair", images: [img(block.images[0]), img(block.images[1])] };
    case "cta":
      return { id, type: "cta", label: block.label, href: block.href };
  }
}

/** Consecutive paragraphs of the design copy become one rich-text block. */
function toBlocks(body: SiteBlock[], slug: string): PostBlock[] {
  const blocks: PostBlock[] = [];
  body.forEach((block, index) => {
    const next = toBlock(block, `${slug}-b${index + 1}`);
    const last = blocks.at(-1);
    if (next.type === "paragraph" && last?.type === "paragraph") last.html += next.html;
    else blocks.push(next);
  });
  return blocks;
}

const TAGS: Record<string, string[]> = {
  "vui-fest-cat-ba": ["Sự kiện", "Sun Group"],
  "he-sinh-thai-hooked": ["Academy", "Hệ sinh thái"],
  "spin-awards-xom-huc": ["DJ Contest", "Cộng đồng"],
};

export const postSeed: Post[] = blogPosts.map((post, index) => ({
  ...stamp(post.slug, 40 - index * 12, 10 - index * 3),
  slug: post.slug,
  title: post.title,
  kicker: post.kicker,
  intro: `<p>${inlineToHtml(post.intro)}</p>`,
  introCta: post.introCta ? { ...post.introCta } : undefined,
  cover: img(post.hero),
  blocks: toBlocks(post.body, post.slug),
  tags: TAGS[post.slug] ?? [],
  author: "Hooked Entertainment",
  status: "published",
  // Newest first on /blog keeps the original site order (src/data/blog.ts lists the newest story first).
  publishedAt: daysAgo(16 + index * 12),
  seo: { title: post.title, description: post.excerpt },
}));

export const blogPageSeed: BlogPage = {
  seo: {
    title: "Blogpost",
    description:
      "Câu chuyện từ cộng đồng Hooked: Vui Fest Cát Bà cùng Sun Group, hệ sinh thái đào tạo DJ – MC Hype – Producer, Spin Awards và Xóm Húc.",
  },
};
