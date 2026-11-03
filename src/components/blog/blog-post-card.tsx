import Image from "next/image";
import Link from "next/link";

import type { BlogPostCardData } from "@/components/blog/blog-content";
import { Icon } from "@/components/ui/icon";
import { blogHref } from "@/lib/site";
import { cn } from "@/lib/utils";

type BlogPostCardProps = {
  post: BlogPostCardData;
  /** Tablet only: the first card spans both columns with a wider 2:1 cover. */
  featured?: boolean;
  /** Mark the cover as an LCP candidate (first card). */
  priority?: boolean;
};

/**
 * Blog index card (not in Figma). Built from the site's media-hover pattern (QA 90 · Project media hover,
 * Home highlight cards): cover with a thin accent border + slow zoom on hover, title turns accent.
 * Meta row in peach uppercase like the footer labels; CTA reuses the article's brand ↗ link style.
 */
export function BlogPostCard({ post, featured = false, priority = false }: BlogPostCardProps) {
  return (
    <Link href={blogHref(post.slug)} className="group flex h-full flex-col gap-5 desktop:gap-6">
      <div
        className={cn(
          "relative aspect-[3/2] overflow-hidden rounded-[4px] bg-surface",
          featured && "tablet:aspect-[2/1] desktop:aspect-[3/2]",
        )}
      >
        <Image
          src={post.cover.src}
          alt={post.cover.alt}
          fill
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          sizes={
            featured
              ? "(min-width: 1200px) 33vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
              : "(min-width: 1200px) 33vw, (min-width: 768px) 50vw, calc(100vw - 48px)"
          }
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent transition-colors duration-150 group-hover:border-accent" />
      </div>

      <div className={cn("flex flex-1 flex-col gap-3", featured && "tablet:max-w-[760px] desktop:max-w-none")}>
        <p className="text-xs leading-5 font-bold tracking-[0.04em] text-peach uppercase">
          {post.kicker}
          <span aria-hidden className="mx-2 text-white/40">
            ·
          </span>
          {post.readingMinutes} phút đọc
        </p>
        <h2 className="text-[22px] leading-[30px] font-bold tracking-[-0.02em] text-white transition-colors duration-150 group-hover:text-accent desktop:text-2xl desktop:leading-8">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-base leading-[26px] text-muted">{post.excerpt}</p>
        <span className="mt-auto flex w-fit items-center gap-3 pt-2 text-base leading-[26px] font-bold text-brand transition-colors duration-150 group-hover:text-accent">
          Đọc bài viết
          <Icon
            name="blog-arrow-up-right"
            size={20}
            className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
