import { Fragment } from "react";

import { Breadcrumbs } from "@/components/ui/links";
import { routes } from "@/lib/site";

type StoriesIntroProps = {
  id: string;
  titleLines: readonly string[];
  description: string;
  collectionLabel: string;
  countLabel: string;
};

/**
 * Student Stories page head.
 * - Desktop: `Navigation / Breadcrumbs` (2189:2532) "Home / Academy / Học viên tiêu biểu", `Stories / Intro`
 *   (2189:2540) 64px ivory H1 + 18px lead, `Stories / Grid header` (2189:2544) hairline with
 *   "Tất cả câu chuyện" and "13 HỌC VIÊN".
 * - Mobile / tablet (`Stories / Introduction` 2823:4904, `Stories / Tablet introduction` 2830:5108):
 *   "Academy / Học viên tiêu biểu", 40px (56px tablet) H1, lead and an accent count.
 */
export function StoriesIntro({ id, titleLines, description, collectionLabel, countLabel }: StoriesIntroProps) {
  const title = titleLines.join(" ");

  return (
    <header className="flex flex-col gap-4 desktop:gap-10">
      <Breadcrumbs
        items={[{ label: "Home", href: routes.home }, { label: "Academy", href: routes.academy }, { label: title }]}
        className="desktop:[&_li]:gap-3 max-desktop:[&_li:first-child]:hidden max-tablet:[&_ol]:text-xs max-tablet:[&_ol]:leading-[18px] tablet:[&_ol]:leading-[21px] desktop:[&_ol]:gap-3 desktop:[&_ol]:leading-[22px]"
      />

      <div className="flex flex-col gap-4">
        <h1
          id={id}
          className="text-[40px] leading-[45px] font-extrabold text-white tablet:text-[56px] tablet:leading-[63px] desktop:text-[64px] desktop:leading-[76px] desktop:text-ivory"
        >
          {titleLines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? " " : null}
              <span className="block tablet:inline">{line}</span>
            </Fragment>
          ))}
        </h1>
        <p className="text-base leading-6 text-muted tablet:text-lg tablet:leading-[27px] desktop:max-w-[850px] desktop:leading-7">
          {description}
        </p>
      </div>

      <p className="text-xs leading-[18px] font-semibold text-accent tablet:text-sm tablet:leading-[21px] desktop:hidden">
        {countLabel}
      </p>

      <div className="hidden h-12 items-center justify-between gap-4 border-t border-line pt-4 desktop:flex">
        <h2 className="text-base leading-6 font-semibold text-white">{collectionLabel}</h2>
        <p className="text-sm leading-[22px] text-muted">{countLabel}</p>
      </div>
    </header>
  );
}
