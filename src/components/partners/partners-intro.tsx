import { editorialGrid, editorialReadingColumn } from "@/components/about/editorial-page";
import { Eyebrow } from "@/components/ui/links";
import { RichHtml } from "@/components/ui/rich-html";

/** `body`: sanitized CMS rich text (one or more paragraphs). */
type PartnersIntroProps = { eyebrow: string; title: string; body: string };

/**
 * "Partners / Introduction · Mother Design reference".
 * Desktop (2746:4707): orange "PARTNERS" label in the first editorial column; reading column (2746:4709) with the
 * 52px uppercase heading (1004px) and the 18px muted introduction (760px).
 * Mobile (2746:5945): label, 30px heading and 16px copy stacked with 24px gaps.
 */
export function PartnersIntro({ eyebrow, title, body }: PartnersIntroProps) {
  return (
    <section aria-labelledby="partners-title" className={`flex flex-col gap-6 ${editorialGrid}`}>
      <Eyebrow className="text-xs leading-5 tracking-normal">{eyebrow}</Eyebrow>
      <div className={`flex flex-col gap-6 desktop:gap-8 ${editorialReadingColumn}`}>
        <h1
          id="partners-title"
          className="text-[30px] leading-[39px] font-bold tracking-[-0.03em] text-white uppercase tablet:text-[40px] tablet:leading-[50px] desktop:text-[52px] desktop:leading-16"
        >
          {title}
        </h1>
        <RichHtml
          html={body}
          className="max-w-[760px] gap-4 text-base leading-[26px] text-muted tablet:text-lg tablet:leading-[30px]"
        />
      </div>
    </section>
  );
}
