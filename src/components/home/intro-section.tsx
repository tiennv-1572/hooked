import Image from "next/image";

import { Container } from "@/components/ui/container";

type IntroSectionProps = {
  titleLines: string[];
  body: string;
};

/**
 * "SUPPORTING LOCAL ARTISTS." statement.
 * Desktop (03 · About Hooked, 142:35): centered Inter Black 75 over a cropped amber glow + dark gradient.
 * Mobile (Home / Support local artists, 2824:5039): left-aligned Manrope 44/49 on the page background.
 * The desktop paragraph is 3 lines in the design. Figma's box is 714px wide in "Young Display"; with the Inter
 * fallback (that font isn't supplied yet) the same copy needs 780px, and it is clamped to 3 lines like the CMS limit.
 */
export function IntroSection({ titleLines, body }: IntroSectionProps) {
  return (
    <section
      aria-labelledby="intro-title"
      className="relative overflow-hidden desktop:flex desktop:min-h-[610px] desktop:items-center"
    >
      <div aria-hidden className="absolute inset-0 hidden desktop:block">
        {/* Crop values copied from the Figma image fill (h 1074.67%, w 239.76%). */}
        <Image
          src="/images/photos/about-glow.png"
          alt=""
          width={632}
          height={1200}
          sizes="240vw"
          className="absolute top-[-377.49%] left-[-139.76%] h-[1074.67%] w-[239.76%] max-w-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(51,34,12,0.7)_0%,#020000_100%)]" />
      </div>

      <Container className="relative flex flex-col gap-6 py-10 tablet:py-15 desktop:items-center desktop:gap-[38px] desktop:py-15 desktop:text-center">
        <h1
          id="intro-title"
          className="text-[clamp(36px,13vw,44px)] leading-[1.114] font-extrabold text-white uppercase desktop:font-inter desktop:text-[75px] desktop:leading-[1.022] desktop:font-black"
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        {/* The clamp clips at the box edge, which cut the stacked accents of capitals on the first line ("BỀ" showed
            as "BÊ"): 12px of top padding (pulled back with a negative margin) gives them room. */}
        <p className="max-w-[560px] text-base leading-6 text-muted desktop:-mt-3 desktop:line-clamp-3 desktop:max-w-[780px] desktop:pt-3 desktop:font-display desktop:text-[32px] desktop:leading-10 desktop:font-bold desktop:text-white desktop:uppercase">
          {body}
        </p>
      </Container>
    </section>
  );
}
