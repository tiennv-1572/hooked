import Image from "next/image";
import type { CSSProperties } from "react";

import { ArticleCta } from "@/components/blog/article-cta";
import type { ArticleBlock } from "@/components/blog/blog-content";
import { RichText } from "@/components/blog/rich-text";
import { RichHtml } from "@/components/ui/rich-html";
import type { Photo } from "@/data/home";

/**
 * CMS / Reading layout (Figma desktop 2712:4699, mobile 2713:4699).
 * Desktop: 760px reading column offset by an empty 324px column (16px gaps, 228px on the right) —
 * the side columns shrink proportionally below 1440. Mobile/tablet: one left-aligned column (max 760px).
 * Rhythm: 20px gaps + 16/26 copy on mobile, 24px gaps + 18/30 copy from tablet.
 */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="desktop:grid desktop:grid-cols-[minmax(0,324fr)_minmax(0,760px)_minmax(0,228fr)] desktop:gap-4">
      <div
        data-reveal="stagger"
        className="flex max-w-[760px] flex-col gap-5 text-base leading-[26px] text-white tablet:gap-6 tablet:text-lg tablet:leading-[30px] desktop:col-start-2"
      >
        {blocks.map((block, index) => (
          <ArticleBlockView key={index} block={block} />
        ))}
      </div>
    </div>
  );
}

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      // Several paragraphs may share a block: same 20/24px rhythm as between blocks.
      return <RichHtml html={block.html} className="gap-5 tablet:gap-6" />;
    case "heading":
      // CMS / Section heading (2714:4756): Manrope Bold 23/32 mobile, 28/38 tablet+.
      return <h2 className="text-[23px] leading-8 font-bold tablet:text-[28px] tablet:leading-[38px]">{block.text}</h2>;
    case "list":
      return (
        <ul className="flex flex-col gap-5 tablet:gap-6">
          {block.items.map((item, index) => (
            <li key={index}>
              <RichText content={item} />
            </li>
          ))}
        </ul>
      );
    case "imagePair":
      return <PhotographyPair images={block.images} />;
    case "image":
      return <ArticlePhoto image={block.image} caption={block.caption} />;
    case "quote":
      return <ArticleQuote text={block.text} cite={block.cite} />;
    case "cta":
      return <ArticleCta href={block.href}>{block.label}</ArticleCta>;
  }
}

/**
 * CMS single photo (not used by the Figma articles): the full reading column at the photo's own ratio, with an
 * optional muted caption — the Photography pair's treatment for one image.
 */
function ArticlePhoto({ image, caption }: { image: Photo; caption: string | null }) {
  return (
    <figure className="flex flex-col gap-3">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 1200px) 760px, (min-width: 768px) calc(100vw - 96px), calc(100vw - 48px)"
        className="h-auto w-full"
      />
      {caption ? <figcaption className="text-sm leading-[21px] text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * CMS pull quote (not used by the Figma articles): the section heading's type on a brand rule, optional muted source.
 */
function ArticleQuote({ text, cite }: { text: string; cite: string | null }) {
  return (
    <figure className="flex flex-col gap-3 border-l-2 border-brand pl-5 tablet:pl-6">
      <blockquote className="text-[23px] leading-8 font-bold tablet:text-[28px] tablet:leading-[38px]">
        <p>{text}</p>
      </blockquote>
      {cite ? <figcaption className="text-sm leading-[21px] text-muted">— {cite}</figcaption> : null}
    </figure>
  );
}

/**
 * CMS / Photography pair (desktop 2720:4695, mobile 2720:4698): stacked on mobile, side by side from
 * tablet with a 16px gap. Each photo grows by its aspect ratio, so both share one height
 * (Figma 2720:4701: 402.8 + 341.2px at 227.5px tall).
 */
function PhotographyPair({ images }: { images: [Photo, Photo] }) {
  return (
    <div className="flex flex-col gap-4 tablet:flex-row">
      {images.map((image) => (
        <div
          key={image.src}
          className="min-w-0 tablet:flex-[var(--grow)_1_0%]"
          style={{ "--grow": image.width / image.height } as CSSProperties}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1200px) 404px, (min-width: 768px) calc(50vw - 56px), calc(100vw - 48px)"
            className="h-auto w-full"
          />
        </div>
      ))}
    </div>
  );
}
