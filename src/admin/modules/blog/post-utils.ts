import { ArrowUpRight, Columns2, Heading2, ImageIcon, List, type LucideIcon, Pilcrow, Quote } from "lucide-react";
import { useSyncExternalStore } from "react";

import { createId } from "@/admin/lib/cms/ids";
import { stripInline } from "@/admin/lib/cms/inline";
import { htmlToText } from "@/lib/html-text";
import type { Post, PostBlock, PostBlockType } from "@/admin/lib/cms/types/blog";
import type { PublishStatus } from "@/admin/lib/cms/types/shared";

/** Displayed state of a post: `published` with a future `publishedAt` reads as "scheduled". */
export type PostState = "draft" | "scheduled" | "published";

export const POST_STATE_LABEL: Record<PostState, string> = {
  draft: "Bản nháp",
  scheduled: "Đã lên lịch",
  published: "Đã xuất bản",
};

export function postState(post: { status: PublishStatus; publishedAt?: string }, now: number): PostState {
  if (post.status !== "published") return "draft";
  if (post.publishedAt && Date.parse(post.publishedAt) > now) return "scheduled";
  return "published";
}

const MINUTE = 60_000;
const subscribeMinute = (onChange: () => void) => {
  const timer = setInterval(onChange, MINUTE);
  return () => clearInterval(timer);
};
const minuteSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/** Current time, refreshed every minute (stable between renders — safe to use in render). */
export function useNow() {
  return useSyncExternalStore(subscribeMinute, minuteSnapshot, minuteSnapshot);
}

// ---------------------------------------------------------------------------------------------------------
// Reading time

/** Plain text of a block (search, summaries, word counts). */
export function blockText(block: PostBlock): string {
  switch (block.type) {
    case "heading":
      return block.text ?? "";
    case "paragraph":
      return htmlToText(block.html ?? "").replace(/\n/g, " ");
    case "list":
      return (block.items ?? []).map(stripInline).join(" ");
    case "quote":
      return [block.text, block.cite].filter(Boolean).join(" ");
    case "image":
      return block.caption ?? "";
    case "cta":
      return block.label ?? "";
    case "imagePair":
      return "";
  }
}

export function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Words of the intro + body blocks. */
export function postWordCount(post: Pick<Post, "intro" | "blocks">) {
  return countWords([htmlToText(post.intro ?? ""), ...(post.blocks ?? []).map(blockText)].join(" "));
}

/** Estimated reading time (≈ 200 words per minute, at least 1 minute). */
export function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 200));
}

// ---------------------------------------------------------------------------------------------------------
// Block types

type BlockTypeMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes of the icon tile. */
  tone: string;
};

export const BLOCK_TYPES: Record<PostBlockType, BlockTypeMeta> = {
  paragraph: {
    label: "Đoạn văn",
    description: "Một hoặc nhiều đoạn văn: chữ đậm, nghiêng, liên kết, danh sách…",
    icon: Pilcrow,
    tone: "bg-primary/10 text-primary",
  },
  heading: {
    label: "Tiêu đề mục",
    description: "Tiêu đề phân đoạn, ví dụ “1. Xóm Húc – …”.",
    icon: Heading2,
    tone: "bg-chart-3/12 text-chart-3",
  },
  list: {
    label: "Danh sách",
    description: "Các ý ngắn, thường mở đầu bằng chữ đậm.",
    icon: List,
    tone: "bg-chart-4/15 text-chart-4",
  },
  image: {
    label: "Ảnh",
    description: "Một ảnh lớn, kèm chú thích.",
    icon: ImageIcon,
    tone: "bg-chart-2/15 text-[color-mix(in_oklch,var(--chart-2),black_25%)] dark:text-chart-2",
  },
  imagePair: {
    label: "Cặp ảnh",
    description: "Hai ảnh đặt cạnh nhau.",
    icon: Columns2,
    tone: "bg-chart-2/15 text-[color-mix(in_oklch,var(--chart-2),black_25%)] dark:text-chart-2",
  },
  quote: {
    label: "Trích dẫn",
    description: "Câu nói nổi bật kèm nguồn trích.",
    icon: Quote,
    tone: "bg-chart-5/15 text-chart-5 dark:text-muted-foreground",
  },
  cta: {
    label: "Liên kết nổi bật",
    description: "Dòng liên kết có mũi tên ↗.",
    icon: ArrowUpRight,
    tone: "bg-primary/10 text-primary",
  },
};

/** Order of the "Thêm khối" menu. */
export const BLOCK_TYPE_ORDER: PostBlockType[] = ["paragraph", "heading", "list", "image", "imagePair", "quote", "cta"];

/** Empty block of a type (form shape: optional strings are "", images start empty). */
export function newBlock(type: PostBlockType): PostBlock {
  const id = createId("blk");
  switch (type) {
    case "heading":
      return { id, type, text: "" };
    case "paragraph":
      return { id, type, html: "" };
    case "list":
      return { id, type, items: ["", ""] };
    case "image":
      return { id, type, image: undefined as never, caption: "" };
    case "imagePair":
      return { id, type, images: [undefined, undefined] as never };
    case "quote":
      return { id, type, text: "", cite: "" };
    case "cta":
      return { id, type, label: "", href: "" };
  }
}

/** One-line summary shown on a collapsed block. */
export function blockSummary(block: PostBlock): string {
  switch (block.type) {
    case "list": {
      const items = (block.items ?? []).filter((item) => item.trim());
      return items.length ? `${items.length} ý · ${stripInline(items[0])}` : "";
    }
    case "image":
      return block.caption || block.image?.alt || "";
    case "imagePair":
      return (block.images ?? [])
        .map((image) => image?.alt)
        .filter(Boolean)
        .join(" · ");
    case "quote":
      return block.text ? `“${block.text}”${block.cite ? ` — ${block.cite}` : ""}` : "";
    case "cta":
      return block.label ? `${block.label} → ${block.href}` : "";
    default:
      return blockText(block);
  }
}

/** True when a block holds something worth confirming before deleting. */
export function blockHasContent(block: PostBlock) {
  if (block.type === "image") return Boolean(block.image?.url || block.caption);
  if (block.type === "imagePair") return (block.images ?? []).some((image) => image?.url);
  return blockText(block).trim().length > 0;
}

export const blogPostHref = (slug: string) => `/blog/${slug}`;

/** `base`, or `base-2`, `base-3`… when taken. */
export function uniqueSlug(base: string, taken: string[]) {
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
