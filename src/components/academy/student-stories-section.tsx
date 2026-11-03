import Image from "next/image";
import Link from "next/link";

import type { FeaturedStory } from "@/components/academy/academy-content";
import { StoryCarousel } from "@/components/academy/story-carousel";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { routes } from "@/lib/site";

type StudentStoriesSectionProps = {
  students: FeaturedStory[];
  /** Heading lines; mobile breaks between them ("HỌC VIÊN" / "TIÊU BIỂU"). */
  headingLines: string[];
  /** "Tất cả câu chuyện" — links to the Student Stories page. */
  ctaLabel: string;
};

/**
 * HỌC VIÊN TIÊU BIỂU (featured students = CMS students with `featured`).
 * - ≥ 768px (`Academy / Shared student stories` 2071:194): heading + outline "Tất cả câu chuyện →",
 *   then the story carousel (3 slides).
 * - < 768px (`Academy / Featured student` 2823:5099): one static student (portrait, name, headline)
 *   with "Xem câu chuyện" / "Tất cả câu chuyện" pills.
 */
export function StudentStoriesSection({ students, headingLines, ctaLabel }: StudentStoriesSectionProps) {
  const [featured] = students;
  const [firstLine, ...otherLines] = headingLines;
  if (!featured) return null;

  return (
    // The carousel bleeds 32px past the column for its card shadows; at 1200–1255px that is wider than the 24px
    // page gutter, so the section clips it horizontally instead of letting the page scroll sideways.
    <section aria-labelledby="student-stories-title" className="overflow-x-clip">
      <Container className="flex flex-col gap-4 py-10 tablet:gap-8 desktop:pt-8 desktop:pb-15">
        <div className="flex items-center justify-between gap-6">
          <h2
            id="student-stories-title"
            className="text-[28px] leading-[31px] font-extrabold text-white tablet:text-[40px] tablet:leading-[48px] tablet:tracking-[-1.2px] desktop:bg-[linear-gradient(90deg,var(--color-ivory),var(--color-white))] desktop:bg-clip-text desktop:text-5xl desktop:leading-[60px] desktop:tracking-[-1.44px] desktop:text-transparent"
          >
            <span className="block tablet:inline">{firstLine}</span>
            {otherLines.length > 0 ? ` ${otherLines.join(" ")}` : null}
          </h2>
          <Link
            href={routes.students}
            className="hidden shrink-0 items-center rounded-[15px] border border-line px-6 py-3 text-base leading-6 font-semibold whitespace-nowrap text-white transition-colors duration-150 hover:border-accent hover:text-accent tablet:flex"
          >
            {`${ctaLabel} →`}
          </Link>
        </div>

        <StoryCarousel students={students} className="hidden tablet:block" />

        {/* Mobile: single featured student */}
        <div className="flex flex-col gap-4 tablet:hidden">
          <div className="relative h-[360px] overflow-hidden">
            <Image
              src={featured.portrait.src}
              alt={featured.portrait.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <h3 className="text-[28px] leading-[31px] font-extrabold text-white">{featured.name}</h3>
          <p className="text-base leading-6 text-muted">{featured.headline}</p>
          <ButtonLink href={featured.href} variant="accent" className="w-full">
            Xem câu chuyện
            <Icon name="arrow-up-right-dark-20" />
          </ButtonLink>
          <ButtonLink href={routes.students} variant="coal" className="w-full">
            {ctaLabel}
            <Icon name="arrow-up-right-accent-20" />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
