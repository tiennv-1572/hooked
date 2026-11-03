import { editorialGrid } from "@/components/about/editorial-page";

type AboutIntroProps = {
  title: string;
  eyebrow: string;
  lead: string;
  headlineLines: [string, string];
  body: string;
  /** Muted paragraph beside the narrative; optional in the CMS. */
  aside?: string;
};

/**
 * "01 / Aino · Introduction".
 * Desktop (2684:4689): "ABOUT HOOKED" page label, 48px lead statement (736px), then the offset 4-column grid
 * (2684:4691) — empty cell · narrative (headline + paragraph) · baseline-aligned muted paragraph · empty cell.
 * Mobile (2685:4704): labels + orange "SUPPORT LOCAL ARTIST" eyebrow, 30px lead, everything stacked.
 * Tablet: desktop typography, the two paragraphs side by side (2 × 324px at 768).
 */
export function AboutIntro({ title, eyebrow, lead, headlineLines, body, aside }: AboutIntroProps) {
  return (
    <section aria-labelledby="about-title" className="flex flex-col gap-8 tablet:gap-12">
      <div className="flex flex-col gap-2">
        <h1
          id="about-title"
          className="text-sm leading-[22px] font-bold text-white desktop:text-base desktop:leading-6"
        >
          {title}
        </h1>
        <p className="text-[11px] leading-[18px] font-bold text-brand desktop:hidden">{eyebrow}</p>
      </div>

      <p className="max-w-[736px] text-[30px] leading-[39px] font-bold text-white tablet:text-[40px] tablet:leading-[50px] tablet:tracking-[-0.03em] desktop:text-5xl desktop:leading-[58px]">
        {lead}
      </p>

      <div className={`grid gap-5 tablet:grid-cols-2 tablet:gap-x-6 ${editorialGrid}`}>
        <div className="flex flex-col gap-5 desktop:col-start-2">
          <h2 className="text-xs leading-5 font-bold text-white tablet:text-sm tablet:leading-[22px]">
            <span className="block">{headlineLines[0]}</span>
            <span className="block tablet:text-lg tablet:leading-[22px]">{headlineLines[1]}</span>
          </h2>
          <p className="text-base leading-[26px] text-white tablet:text-lg tablet:leading-7">{body}</p>
        </div>
        {/* 64px top offset aligns this paragraph with the first line of the narrative paragraph. */}
        {aside && (
          <p className="text-base leading-[26px] text-muted tablet:pt-16 tablet:text-lg tablet:leading-7">{aside}</p>
        )}
      </div>
    </section>
  );
}
