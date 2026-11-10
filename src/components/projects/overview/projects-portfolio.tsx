import Image from "next/image";

import { ProjectGallery } from "@/components/projects/overview/project-gallery";
import type {
  ProjectCardData,
  ProjectFilterOption,
  ProjectGridCell,
  ProjectPreview,
  ProjectsEmptyCopy,
} from "@/components/projects/project-content";
import { Container } from "@/components/ui/container";
import type { ProjectVideo } from "@/data/project-details";

type ProjectsPortfolioProps = {
  title: string;
  /** Cells of the "Tất cả" grid (CMS "Cài đặt hiển thị dự án"). */
  grid: ProjectGridCell[];
  projects: ProjectCardData[];
  filters: ProjectFilterOption[];
  /** Featured video per project slug, for the card play controls. */
  videos: Record<string, ProjectVideo>;
  /** Hover preview per project slug (video or album slideshow). */
  previews: Record<string, ProjectPreview>;
  emptyState: ProjectsEmptyCopy;
};

/**
 * 02 · Portfolio — desktop 2226:380, mobile 2226:637.
 * Ambient stage light (2231:624 / 2231:625: 340px desktop, 260px mobile, 22% opacity) behind the
 * Introduction (2226:381: "Hooked Projects", ExtraBold 64/84 desktop, 40/52 mobile) and the filtered gallery.
 * The page background (00 · Background / Gradient + grain) stays ink, then warms up over the last ~230px
 * to the footer's first gradient stop (#120603 mobile/tablet, #240a05 desktop) so there is no seam.
 */
export function ProjectsPortfolio({
  title,
  grid,
  projects,
  filters,
  videos,
  previews,
  emptyState,
}: ProjectsPortfolioProps) {
  return (
    <section
      aria-labelledby="projects-title"
      className="grain relative overflow-hidden bg-[linear-gradient(180deg,var(--color-ink)_calc(100%-232px),#120603_100%)] pt-8 pb-16 tablet:pt-12 tablet:pb-24 desktop:bg-[linear-gradient(180deg,var(--color-ink)_calc(100%-232px),#0d0402_calc(100%-120px),#240a05_100%)] desktop:pt-14 desktop:pb-28"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[260px] opacity-22 desktop:h-[340px]">
        <Image
          src="/images/projects/covers/ambient-stage-light.png"
          alt=""
          fill
          // 260px tall on mobile: the 2.36:1 texture covers it 614px wide.
          sizes="(max-width: 767px) 614px, 100vw"
          className="object-cover"
        />
      </div>

      <Container data-reveal="stagger" className="relative flex flex-col gap-8 desktop:gap-12">
        <h1
          id="projects-title"
          className="pt-2 pb-4 text-[40px] leading-[52px] font-extrabold text-ivory tablet:text-[56px] tablet:leading-[72px] desktop:pb-5 desktop:text-[64px] desktop:leading-[84px]"
        >
          {title}
        </h1>
        <ProjectGallery
          grid={grid}
          projects={projects}
          filters={filters}
          videos={videos}
          previews={previews}
          emptyState={emptyState}
        />
      </Container>
    </section>
  );
}
