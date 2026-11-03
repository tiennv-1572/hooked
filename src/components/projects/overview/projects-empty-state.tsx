import { HookedMark } from "@/components/brand/hooked-logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/site";

type ProjectsEmptyStateProps = {
  /** `PROJECTS_COPY.emptyState.title` + active filter, e.g. "Chưa có dự án cho “DJ Contest”". */
  title: string;
  /** `PROJECTS_COPY.emptyState.body`. */
  body: string;
  onReset: () => void;
};

/**
 * "No projects for this filter" — not drawn in Figma (plan/03 §10: filter rỗng ✗), so it reuses the site's
 * language: 16:9 coal panel with grain and an ember glow like the page background, brand mark,
 * Manrope ExtraBold ivory headline, muted copy, accent "Tất cả dự án" action + outline contact action.
 */
export function ProjectsEmptyState({ title, body, onReset }: ProjectsEmptyStateProps) {
  return (
    <div className="grain relative flex min-h-[320px] flex-col items-center justify-center gap-6 overflow-hidden rounded-[15px] border border-white/10 bg-[radial-gradient(90%_70%_at_50%_120%,rgba(229,86,36,0.35)_0%,rgba(42,31,25,0.5)_45%,var(--color-coal)_80%)] px-6 py-14 text-center tablet:aspect-[21/9] tablet:min-h-0 tablet:px-12">
      <HookedMark className="h-6 w-[39.6px]" />
      <div className="flex max-w-[560px] flex-col gap-3">
        <h3 className="text-[22px] leading-8 font-extrabold text-ivory uppercase tablet:text-[26px] tablet:leading-9">
          {title}
        </h3>
        <p className="text-sm leading-[21px] text-muted tablet:text-base tablet:leading-6">{body}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onReset} className="gap-3">
          Xem tất cả dự án
          <Icon name="arrow-up-right-dark-20" />
        </Button>
        <ButtonLink href={routes.contact} variant="outline">
          Liên hệ Hooked
        </ButtonLink>
      </div>
    </div>
  );
}
