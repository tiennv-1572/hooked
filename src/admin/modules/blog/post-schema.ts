import { z } from "zod";

import {
  hrefSchema,
  imageRefSchema,
  optionalImageSchema,
  publishStatusSchema,
  requiredText,
  slugSchema,
} from "@/admin/lib/cms/schemas";
import type { Post, PostBlock } from "@/admin/lib/cms/types/blog";
import { htmlToText } from "@/lib/html-text";

/*
 * Form model of the post editor. Differences from the stored `Post`:
 * - optional strings (caption, cite, SEO) are "" instead of undefined;
 * - the intro CTA is `{ enabled, label, href }` so the fields can be toggled without losing input.
 */

const id = z.string();

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ id, type: z.literal("heading"), text: requiredText("Nhập tiêu đề mục.") }),
  z.object({
    id,
    type: z.literal("paragraph"),
    html: z.string().refine((html) => Boolean(htmlToText(html)), "Nhập nội dung đoạn văn hoặc xóa khối này."),
  }),
  z.object({
    id,
    type: z.literal("list"),
    items: z.array(z.string()).refine((items) => items.some((item) => item.trim()), "Thêm ít nhất một ý."),
  }),
  z.object({ id, type: z.literal("image"), image: imageRefSchema("Chọn ảnh cho khối này."), caption: z.string() }),
  z.object({
    id,
    type: z.literal("imagePair"),
    images: z.tuple([imageRefSchema("Chọn ảnh bên trái."), imageRefSchema("Chọn ảnh bên phải.")]),
  }),
  z.object({ id, type: z.literal("quote"), text: requiredText("Nhập câu trích dẫn."), cite: z.string() }),
  z.object({ id, type: z.literal("cta"), label: requiredText("Nhập nội dung liên kết."), href: hrefSchema }),
]);

const introCtaSchema = z
  .object({ enabled: z.boolean(), label: z.string(), href: z.string() })
  .superRefine((cta, ctx) => {
    if (!cta.enabled) return;
    if (!cta.label.trim()) ctx.addIssue({ code: "custom", path: ["label"], message: "Nhập nội dung liên kết." });
    const href = hrefSchema.safeParse(cta.href);
    if (!href.success) {
      ctx.addIssue({
        code: "custom",
        path: ["href"],
        message: href.error.issues[0]?.message ?? "Đường dẫn không hợp lệ.",
      });
    }
  });

/** `takenSlugs`: slugs of the other posts (a post's slug must be unique). */
export function buildPostSchema(takenSlugs: string[]) {
  return z.object({
    title: requiredText("Nhập tiêu đề bài viết."),
    slug: slugSchema.refine((slug) => !takenSlugs.includes(slug), "Đường dẫn này đã được dùng cho bài viết khác."),
    kicker: requiredText("Nhập nhãn ngắn cho thẻ bài viết."),
    intro: z.string().refine((html) => Boolean(htmlToText(html)), "Nhập đoạn mở đầu."),
    introCta: introCtaSchema,
    cover: imageRefSchema("Chọn ảnh bìa."),
    blocks: z.array(blockSchema),
    tags: z.array(z.string()),
    author: requiredText("Nhập tên tác giả."),
    status: publishStatusSchema,
    publishedAt: z.string().optional(),
    seo: z.object({ title: z.string(), description: z.string(), image: optionalImageSchema }),
  });
}

export type PostForm = z.infer<ReturnType<typeof buildPostSchema>>;
export type PostFormBlock = PostForm["blocks"][number];

export const DEFAULT_AUTHOR = "Hooked Entertainment";

export function emptyPostForm(): PostForm {
  return {
    title: "",
    slug: "",
    kicker: "",
    intro: "",
    introCta: { enabled: false, label: "", href: "" },
    cover: undefined as never,
    blocks: [],
    tags: [],
    author: DEFAULT_AUTHOR,
    status: "draft",
    publishedAt: undefined,
    seo: { title: "", description: "", image: undefined },
  };
}

function blockToForm(block: PostBlock): PostFormBlock {
  switch (block.type) {
    case "image":
      return { ...block, caption: block.caption ?? "" };
    case "quote":
      return { ...block, cite: block.cite ?? "" };
    case "list":
      return { ...block, items: [...block.items] };
    default:
      return { ...block } as PostFormBlock;
  }
}

function blockToItem(block: PostFormBlock): PostBlock {
  switch (block.type) {
    case "image":
      return { ...block, caption: block.caption.trim() || undefined };
    case "quote":
      return { ...block, cite: block.cite.trim() || undefined };
    case "list":
      return { ...block, items: block.items.filter((item) => item.trim()) };
    default:
      return block;
  }
}

export function postToForm(post: Post): PostForm {
  return {
    title: post.title,
    slug: post.slug,
    kicker: post.kicker,
    intro: post.intro,
    introCta: { enabled: Boolean(post.introCta), label: post.introCta?.label ?? "", href: post.introCta?.href ?? "" },
    cover: post.cover,
    blocks: (post.blocks ?? []).map(blockToForm),
    tags: post.tags ?? [],
    author: post.author ?? DEFAULT_AUTHOR,
    status: post.status,
    publishedAt: post.publishedAt,
    seo: { title: post.seo?.title ?? "", description: post.seo?.description ?? "", image: post.seo?.image },
  };
}

export function formToPost(values: PostForm): Omit<Post, "id" | "createdAt" | "updatedAt"> {
  return {
    slug: values.slug,
    title: values.title.trim(),
    kicker: values.kicker.trim(),
    intro: values.intro.trim(),
    introCta: values.introCta.enabled
      ? { label: values.introCta.label.trim(), href: values.introCta.href.trim() }
      : undefined,
    cover: values.cover,
    blocks: values.blocks.map(blockToItem),
    tags: values.tags,
    author: values.author.trim(),
    status: values.status,
    // Publishing without a date publishes now.
    publishedAt: values.status === "published" ? (values.publishedAt ?? new Date().toISOString()) : values.publishedAt,
    seo: {
      title: values.seo.title.trim() || undefined,
      description: values.seo.description.trim() || undefined,
      image: values.seo.image?.url ? values.seo.image : undefined,
    },
  };
}
