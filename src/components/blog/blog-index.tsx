import type { BlogPostCardData } from "@/components/blog/blog-content";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { EditorialContainer } from "@/components/blog/editorial-container";
import { Eyebrow } from "@/components/ui/links";
import { siteConfig } from "@/lib/site";
import { pad2 } from "@/lib/utils";

type BlogIndexProps = {
  /** `BLOG_INDEX_COPY.title` (display heading, set in caps by CSS). */
  title: string;
  /** `BLOG_INDEX_COPY.description` (lead paragraph). */
  description: string;
  /** Published posts, newest first. */
  posts: BlogPostCardData[];
};

/**
 * Blog index (`/blog`) — not in Figma; designed in the site's language: ink + grain page with a faint
 * ember glow, Manrope ExtraBold uppercase display heading, peach/accent labels, editorial 1344px grid.
 * Cards: 1 column mobile, 2 tablet (first post spans both), 3 desktop.
 */
export function BlogIndex({ title, description, posts }: BlogIndexProps) {
  return (
    <div className="grain bg-[radial-gradient(90%_55%_at_100%_0%,rgba(152,58,15,0.32)_0%,transparent_70%)]">
      <EditorialContainer className="flex flex-col gap-10 pt-10 pb-16 tablet:gap-12 tablet:pt-14 tablet:pb-24 desktop:gap-14 desktop:pt-18 desktop:pb-28">
        <header className="flex flex-col gap-5 desktop:grid desktop:grid-cols-[minmax(0,1fr)_minmax(0,460px)] desktop:items-end desktop:gap-20">
          <div className="flex flex-col gap-3 desktop:gap-4">
            <Eyebrow>Hooked Entertainment</Eyebrow>
            <h1 className="text-[clamp(44px,16.5vw,56px)] leading-[60px] font-extrabold tracking-[-0.03em] text-white uppercase tablet:text-[88px] tablet:leading-[92px] desktop:text-[120px] desktop:leading-[120px]">
              {title}
            </h1>
          </div>
          <p className="text-[17px] leading-7 text-muted tablet:max-w-[600px] tablet:text-lg tablet:leading-[30px] desktop:pb-3">
            {description}
          </p>
        </header>

        <div className="flex items-center justify-between gap-4 border-t border-line pt-4 text-xs leading-5 font-bold tracking-[0.04em] text-muted uppercase">
          <span>
            <span className="text-accent">{pad2(posts.length)}</span> bài viết
          </span>
          <span>{siteConfig.tagline}</span>
        </div>

        <ul className="grid gap-12 tablet:grid-cols-2 tablet:gap-x-8 tablet:gap-y-14 desktop:grid-cols-3 desktop:gap-x-8">
          {posts.map((post, index) => (
            <li key={post.slug} className={index === 0 ? "tablet:col-span-2 desktop:col-span-1" : undefined}>
              <BlogPostCard post={post} featured={index === 0} priority={index === 0} />
            </li>
          ))}
        </ul>
      </EditorialContainer>
    </div>
  );
}
