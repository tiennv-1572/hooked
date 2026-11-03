import { BackLink } from "@/components/ui/links";
import { routes } from "@/lib/site";

/**
 * CMS / Article heading (Figma desktop 2712:4695, mobile 2713:4695): small brand "← Blogpost" back link
 * above the Manrope Bold title — 30/39 mobile, 44/54 tablet, 52/64 desktop, tracking −3%.
 */
export function ArticleHeader({ title }: { title: string }) {
  return (
    <header className="flex flex-col gap-6 desktop:gap-8">
      <BackLink
        href={routes.blog}
        aria-label="Quay lại trang Blogpost"
        className="w-fit gap-1 text-xs leading-5 font-bold text-brand hover:text-accent [&>svg]:size-3.5"
      >
        Blogpost
      </BackLink>
      <h1 className="text-[30px] leading-[39px] font-bold tracking-[-0.03em] text-white tablet:text-[44px] tablet:leading-[54px] desktop:text-[52px] desktop:leading-16">
        {title}
      </h1>
    </header>
  );
}
