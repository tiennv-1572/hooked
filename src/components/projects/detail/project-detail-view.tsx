import { ProjectCover } from "@/components/projects/detail/media-tiles";
import { ProjectMediaProvider } from "@/components/projects/detail/project-media-provider";
import { ProjectAlbum, ProjectHeading, ProjectInfo, ReturnLink } from "@/components/projects/detail/project-sections";
import type { ProjectDetailData } from "@/components/projects/project-content";
import { Container } from "@/components/ui/container";
import { BackLink } from "@/components/ui/links";
import { routes } from "@/lib/site";

const pageColumn =
  "flex flex-col gap-8 pt-8 pb-16 tablet:gap-10 tablet:pt-12 tablet:pb-20 desktop:gap-12 desktop:pt-14 desktop:pb-28";

/**
 * Project detail template — Figma "05–09 · Projects / <project>", block `02 · Project detail`
 * (Devoid desktop 2226:553 / mobile 2226:795; same structure for SPIN 2327:1189, Xóm Húc 2327:1275,
 * Frequency Arena 2327:1361, Vui Fest Cát Bà 2327:1447).
 * Desktop: 56px top / 112px bottom padding, 48px between blocks. Mobile: 32 / 64, 32px gaps.
 */
export function ProjectDetailView({ project }: { project: ProjectDetailData }) {
  const coverLabel =
    project.cover.opens?.type === "video" ? `Xem video ${project.name}` : `Mở album ảnh ${project.name}`;

  return (
    <ProjectMediaProvider title={project.name} photos={project.photos} videos={project.videos}>
      <Container className={pageColumn}>
        <BackLink href={routes.projects} className="w-fit">
          Tất cả dự án
        </BackLink>
        <ProjectHeading name={project.name} categories={project.categories} />
        <ProjectCover cover={project.cover} label={coverLabel} />
        <ProjectInfo partners={project.partners} categories={project.categories} description={project.description} />
        <ProjectAlbum project={project} />
        <ReturnLink />
      </Container>
    </ProjectMediaProvider>
  );
}

/** Suspense fallback with the same rhythm as the page (back link, heading, cover). */
export function ProjectDetailSkeleton() {
  return (
    <Container aria-busy className={pageColumn}>
      <BackLink href={routes.projects} className="w-fit">
        Tất cả dự án
      </BackLink>
      <div className="flex flex-col gap-3">
        <div className="h-13 w-3/4 max-w-[640px] animate-pulse rounded-lg bg-surface desktop:h-[84px]" />
        <div className="h-6 w-1/2 max-w-[480px] animate-pulse rounded bg-surface" />
      </div>
      <div className="h-[300px] animate-pulse rounded-[15px] bg-surface tablet:aspect-[1192/620] tablet:h-auto" />
    </Container>
  );
}
