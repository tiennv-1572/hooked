import Image from "next/image";

import { ArticleCta } from "@/components/blog/article-cta";
import type { BlogArticleData } from "@/components/blog/blog-content";
import { RichText } from "@/components/blog/rich-text";

type ArticleIntroProps = Pick<BlogArticleData, "intro" | "introCta" | "hero">;

/**
 * CMS / Introduction and cover · Dovetail (Figma desktop 2712:4696, mobile 2713:4696).
 * Desktop: 600px introduction (20/32) + optional CTA on the left, 664px cover on the right, 80px apart —
 * the columns keep that 600:664 ratio between 1200 and 1440. Mobile/tablet: intro, CTA, then the cover.
 * The cover keeps its natural aspect ratio (3:2 for posts 11–12, 720×404 for post 13).
 */
export function ArticleIntro({ intro, introCta, hero }: ArticleIntroProps) {
  return (
    <div className="flex flex-col gap-7 tablet:gap-10 desktop:grid desktop:grid-cols-[minmax(0,600fr)_minmax(0,664fr)] desktop:items-start desktop:gap-20">
      <div className="flex flex-col gap-5 tablet:max-w-[760px] desktop:gap-6">
        <p className="text-[17px] leading-7 text-white tablet:text-xl tablet:leading-8">
          <RichText content={intro} />
        </p>
        {introCta ? <ArticleCta href={introCta.href}>{introCta.label}</ArticleCta> : null}
      </div>
      <Image
        src={hero.src}
        alt={hero.alt}
        width={hero.width}
        height={hero.height}
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1440px) 664px, (min-width: 1200px) 47vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
        className="h-auto w-full"
      />
    </div>
  );
}
