import type { ReactNode } from "react";

import { ArticleBody } from "@/components/blog/article-body";
import { ArticleHeader } from "@/components/blog/article-header";
import { ArticleIntro } from "@/components/blog/article-intro";
import type { BlogArticleData } from "@/components/blog/blog-content";
import { EditorialContainer } from "@/components/blog/editorial-container";

/** Ink + grain page frame and vertical rhythm shared by the article and its loading shell. */
function ArticleFrame({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <div className="grain">
      <EditorialContainer>
        <article
          aria-busy={busy || undefined}
          className="flex flex-col gap-10 pt-10 pb-16 tablet:gap-12 tablet:pt-14 tablet:pb-24 desktop:gap-16 desktop:pt-18 desktop:pb-28"
        >
          {children}
        </article>
      </EditorialContainer>
    </div>
  );
}

/**
 * Blog post template (Figma "11–13 · Blog": desktop 2553:3835 / 2553:3836 / 2553:3837,
 * mobile 2553:3839 / 2553:3840 / 2553:3841). One data-driven layout for every article:
 * heading → introduction & cover → reading layout, on the ink + grain page background
 * (the footer carries the orange gradient).
 *
 * Vertical rhythm — mobile: 40 top / 40 gaps / 64 bottom; desktop: 72 top / 64 gaps / 112 bottom.
 */
export function BlogArticle({ post }: { post: BlogArticleData }) {
  return (
    <ArticleFrame>
      <ArticleHeader title={post.title} />
      <ArticleIntro intro={post.intro} introCta={post.introCta} hero={post.hero} />
      <ArticleBody blocks={post.body} />
    </ArticleFrame>
  );
}

/** Loading shell (not in Figma): same frame with muted bars, shown only for slugs that are not prerendered. */
export function BlogArticleSkeleton() {
  const bar = "rounded-sm bg-white/8 motion-safe:animate-pulse";
  return (
    <ArticleFrame busy>
      <div className="flex flex-col gap-6 desktop:gap-8">
        <div className={`h-5 w-20 ${bar}`} />
        <div className={`h-[78px] w-full max-w-[1000px] tablet:h-[108px] desktop:h-32 ${bar}`} />
      </div>
      <div className="flex flex-col gap-7 desktop:grid desktop:grid-cols-[minmax(0,600fr)_minmax(0,664fr)] desktop:gap-20">
        <div className={`h-56 ${bar}`} />
        <div className={`aspect-[3/2] ${bar}`} />
      </div>
      <span className="sr-only">Đang tải bài viết…</span>
    </ArticleFrame>
  );
}
