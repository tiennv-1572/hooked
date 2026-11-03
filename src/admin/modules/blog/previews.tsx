"use client";

import { ArrowLeft, ArrowUpRight, ImageIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { parseInline } from "@/admin/lib/cms/inline";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { htmlToText } from "@/lib/html-text";
import { cn } from "@/lib/utils";

import type { PostFormBlock } from "./post-schema";

/*
 * Read-only renderings in the public site's editorial style (src/components/blog/*): ink background,
 * Manrope, brand-orange links. Container queries (@3xl ≈ tablet, @5xl ≈ desktop) make the layout follow
 * the preview frame instead of the admin viewport, so "Điện thoại" / "Máy tính" previews are faithful.
 */

const SITE = {
  ink: "bg-[#050101]",
  brand: "text-[#e55624]",
  peach: "text-[#fb9a41]",
  muted: "text-[#cccccc]",
} as const;

/** Site glow + grain-ish ink frame. */
const frame =
  "@container overflow-hidden bg-[#050101] bg-[radial-gradient(90%_55%_at_100%_0%,rgba(152,58,15,0.28)_0%,transparent_70%)] font-brand text-white antialiased";

/** Inline markdown (**bold**, [link](/href)) rendered like the site's RichText. */
export function SiteInline({ value }: { value: string }) {
  return (
    <>
      {parseInline(value).map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : part.href ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-[#e55624] decoration-1 underline-offset-[5px] transition-colors hover:text-[#ff6b00] hover:decoration-[#ff6b00]"
          >
            {part.text}
          </a>
        ) : (
          <strong key={index} className="font-bold">
            {part.text}
          </strong>
        ),
      )}
    </>
  );
}

function SiteCta({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href || undefined}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex w-full items-center justify-between gap-3 p-2 text-base leading-[26px] font-bold transition-colors hover:text-[#ff6b00] @3xl:w-fit @3xl:justify-start @3xl:text-lg @3xl:leading-7",
        SITE.brand,
      )}
    >
      <span className="decoration-1 underline-offset-4 group-hover:underline">{label || "Liên kết"}</span>
      <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function SiteImage({ image, className, style }: { image?: ImageRef; className?: string; style?: CSSProperties }) {
  if (!image?.url) {
    return (
      <div
        className={cn("flex aspect-[3/2] w-full items-center justify-center bg-white/6 text-white/30", className)}
        style={style}
      >
        <ImageIcon className="size-8" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.url} alt={image.alt} className={cn("h-auto w-full", className)} style={style} />;
}

const ratio = (image?: ImageRef) => (image?.width && image?.height ? image.width / image.height : 1.5);

function PreviewBlock({ block }: { block: PostFormBlock }) {
  switch (block.type) {
    case "paragraph":
      // Editor HTML (Tiptap only emits its own schema: paragraphs, marks, links, lists, quotes).
      return htmlToText(block.html ?? "") ? (
        <div
          className={cn(
            "flex flex-col gap-5 @3xl:gap-6 [&_b]:font-bold [&_em]:italic [&_strong]:font-bold [&_u]:underline",
            "[&_a]:underline [&_a]:decoration-[#e55624] [&_a]:decoration-1 [&_a]:underline-offset-[5px]",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-[#e55624] [&_blockquote]:pl-4 [&_blockquote]:italic [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
          )}
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      ) : null;
    case "heading":
      return block.text?.trim() ? (
        <h2 className="text-[23px] leading-8 font-bold @3xl:text-[28px] @3xl:leading-[38px]">{block.text}</h2>
      ) : null;
    case "list": {
      const items = (block.items ?? []).filter((item) => item.trim());
      return items.length ? (
        <ul className="flex flex-col gap-5 @3xl:gap-6">
          {items.map((item, index) => (
            <li key={index}>
              <SiteInline value={item} />
            </li>
          ))}
        </ul>
      ) : null;
    }
    case "image":
      return (
        <figure className="flex flex-col gap-3">
          <SiteImage image={block.image} />
          {block.caption?.trim() ? (
            <figcaption className={cn("text-sm leading-6", SITE.muted)}>{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "imagePair":
      return (
        <div className="flex flex-col gap-4 @3xl:flex-row">
          {(block.images ?? []).map((image, index) => (
            <div
              key={index}
              className="min-w-0 @3xl:flex-[var(--grow)_1_0%]"
              style={{ "--grow": ratio(image) } as CSSProperties}
            >
              <SiteImage image={image} />
            </div>
          ))}
        </div>
      );
    case "quote":
      return block.text?.trim() ? (
        <blockquote className="flex flex-col gap-3 border-l-2 border-[#e55624] py-1 pl-5 @3xl:pl-6">
          <p className="text-[20px] leading-8 font-semibold tracking-[-0.01em] @3xl:text-[24px] @3xl:leading-9">
            “{block.text}”
          </p>
          {block.cite?.trim() ? (
            <cite className={cn("text-xs leading-5 font-bold tracking-[0.04em] uppercase not-italic", SITE.peach)}>
              {block.cite}
            </cite>
          ) : null}
        </blockquote>
      ) : null;
    case "cta":
      return block.label?.trim() ? <SiteCta label={block.label} href={block.href} /> : null;
  }
}

export type ArticlePreviewData = {
  title: string;
  intro: string;
  introCta?: { label: string; href: string };
  cover?: ImageRef;
  blocks: PostFormBlock[];
};

/** The whole article as `/blog/<slug>` renders it (header → intro & cover → reading column). */
export function ArticlePreview({ post, className }: { post: ArticlePreviewData; className?: string }) {
  const hasBody = post.blocks.some(
    (block) => block.type === "imagePair" || block.type === "image" || blockFilled(block),
  );
  return (
    <div className={cn(frame, className)}>
      <article className="flex flex-col gap-10 px-6 pt-10 pb-16 @3xl:gap-12 @3xl:px-12 @3xl:pt-14 @3xl:pb-24 @5xl:gap-16 @5xl:pt-18">
        <header className="flex flex-col gap-6 @5xl:gap-8">
          <span className={cn("flex w-fit items-center gap-1 text-xs leading-5 font-bold", SITE.brand)}>
            <ArrowLeft className="size-3.5" /> Blogpost
          </span>
          <h1
            className={cn(
              "text-[30px] leading-[39px] font-bold tracking-[-0.03em] @3xl:text-[44px] @3xl:leading-[54px] @5xl:text-[52px] @5xl:leading-16",
              !post.title.trim() && "text-white/30",
            )}
          >
            {post.title.trim() || "Tiêu đề bài viết"}
          </h1>
        </header>

        <div className="flex flex-col gap-7 @3xl:gap-10 @5xl:grid @5xl:grid-cols-[minmax(0,600fr)_minmax(0,664fr)] @5xl:items-start @5xl:gap-20">
          <div className="flex flex-col gap-5 @3xl:max-w-[760px] @5xl:gap-6">
            <p
              className={cn("text-[17px] leading-7 @3xl:text-xl @3xl:leading-8", !post.intro.trim() && "text-white/30")}
            >
              {post.intro.trim() ? <SiteInline value={post.intro} /> : "Đoạn mở đầu của bài viết sẽ hiển thị ở đây."}
            </p>
            {post.introCta?.label ? <SiteCta label={post.introCta.label} href={post.introCta.href} /> : null}
          </div>
          <SiteImage image={post.cover} />
        </div>

        <div className="@5xl:grid @5xl:grid-cols-[minmax(0,324fr)_minmax(0,760px)_minmax(0,228fr)] @5xl:gap-4">
          <div className="flex max-w-[760px] flex-col gap-5 text-base leading-[26px] @3xl:gap-6 @3xl:text-lg @3xl:leading-[30px] @5xl:col-start-2">
            {hasBody ? (
              post.blocks.map((block) => <PreviewBlock key={block.id} block={block} />)
            ) : (
              <p className="rounded-md border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/40">
                Chưa có nội dung — thêm khối ở chế độ Soạn thảo.
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function blockFilled(block: PostFormBlock) {
  switch (block.type) {
    case "list":
      return (block.items ?? []).some((item) => item.trim());
    case "cta":
      return Boolean(block.label?.trim());
    case "paragraph":
      return Boolean(htmlToText(block.html ?? ""));
    case "heading":
    case "quote":
      return Boolean(block.text?.trim());
    default:
      return true;
  }
}

/** Index card on `/blog` (cover, kicker · reading time, title, excerpt, "Đọc bài viết ↗"). */
export function PostCardPreview({
  cover,
  kicker,
  title,
  excerpt,
  minutes,
}: {
  cover?: ImageRef;
  kicker: string;
  title: string;
  excerpt: string;
  minutes: number;
}) {
  return (
    <div className={cn(frame, "rounded-lg p-4")}>
      <div className="flex flex-col gap-4">
        <div className="aspect-[3/2] overflow-hidden rounded-[4px] bg-[#1a1a1a]">
          {cover?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.url} alt={cover.alt} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-white/30">
              <ImageIcon className="size-6" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className={cn("text-[10px] leading-4 font-bold tracking-[0.04em] uppercase", SITE.peach)}>
            {kicker.trim() || "Nhãn ngắn"}
            <span aria-hidden className="mx-1.5 text-white/40">
              ·
            </span>
            {minutes} phút đọc
          </p>
          <p className={cn("text-lg leading-6 font-bold tracking-[-0.02em]", !title.trim() && "text-white/30")}>
            {title.trim() || "Tiêu đề bài viết"}
          </p>
          <p className={cn("line-clamp-3 text-[13px] leading-5", excerpt.trim() ? SITE.muted : "text-white/30")}>
            {excerpt.trim() || "Tóm tắt hiển thị dưới tiêu đề."}
          </p>
          <span className={cn("flex items-center gap-2 pt-1 text-sm font-bold", SITE.brand)}>
            Đọc bài viết <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Google-style search result. */
export function SearchPreview({
  title,
  description,
  path,
  siteName = "Hooked Entertainment",
}: {
  title: string;
  description: string;
  path: string;
  siteName?: string;
}) {
  const crumbs = path.split("/").filter(Boolean);
  return (
    <div className="rounded-lg border bg-white p-4 font-sans dark:border-white/10 dark:bg-[#202124]">
      <div className="flex items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/10 bg-[#050101] text-[11px] font-black text-[#e55624] dark:border-white/15">
          H
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-[#202124] dark:text-[#dadce0]">{siteName}</p>
          <p className="truncate text-xs text-[#4d5156] dark:text-[#bdc1c6]">
            {["https://hooked.vn", ...crumbs].join(" › ")}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-lg leading-6 text-[#1a0dab] dark:text-[#99c3ff]">
        {title || "Tiêu đề trang"}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#4d5156] dark:text-[#bdc1c6]">
        {description || "Mô tả hiển thị dưới tiêu đề trong kết quả tìm kiếm."}
      </p>
    </div>
  );
}
