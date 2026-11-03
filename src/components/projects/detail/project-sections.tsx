import Link from "next/link";
import type { ReactNode } from "react";

import { MaskIcon } from "@/components/projects/detail/media-icons";
import { AlbumButton, GalleryPhoto, VideoCard } from "@/components/projects/detail/media-tiles";
import type { ProjectDetailData } from "@/components/projects/project-content";
import { RichHtml } from "@/components/ui/rich-html";
import type { MediaRef } from "@/data/project-details";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const sectionTitle = "text-[28px] leading-[37px] font-extrabold text-ivory tablet:text-[40px] tablet:leading-[52px]";

/**
 * `Project heading` (desktop 2226:559 / mobile 2226:801): H1 in caps + orange line of category labels.
 * Manrope ExtraBold 48/84 desktop, 32/52 mobile.
 */
export function ProjectHeading({ name, categories }: Pick<ProjectDetailData, "name" | "categories">) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className="text-[32px] leading-[52px] font-extrabold text-ivory uppercase tablet:text-[40px] tablet:leading-[60px] desktop:text-5xl desktop:leading-[84px]">
        {name}
      </h1>
      {categories.length ? (
        <p className="text-lg leading-6 font-semibold text-accent">{categories.join(" · ")}</p>
      ) : null}
    </header>
  );
}

/**
 * `04 · Project information` (desktop 2226:568 / mobile 2226:810): "Về dự án", Đối tác + Dịch vụ cung cấp (the
 * category labels; 2 columns from tablet, stacked on mobile; no partners → services take the first column, as
 * Xóm Húc 2327:1291), then "Mô tả dự án" (CMS rich text).
 */
export function ProjectInfo({
  partners,
  categories,
  description,
}: Pick<ProjectDetailData, "partners" | "categories" | "description">) {
  return (
    <section aria-labelledby="project-about" className="flex flex-col gap-8">
      <h2 id="project-about" className={sectionTitle}>
        Về dự án
      </h2>
      <dl className="grid gap-6 tablet:grid-cols-2">
        {partners.length > 0 ? <InfoList label="Đối tác" items={partners} /> : null}
        {categories.length > 0 ? <InfoList label="Dịch vụ cung cấp" items={categories} /> : null}
      </dl>
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl leading-8 font-extrabold text-ivory tablet:text-[28px] tablet:leading-[37px]">
          Mô tả dự án
        </h3>
        <RichHtml html={description} className="max-w-[790px] gap-4 text-lg leading-6 text-muted" />
      </div>
    </section>
  );
}

function InfoList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-sm leading-[19px] text-muted">{label}</dt>
      <dd>
        <ul className="text-xl leading-[26px] font-semibold text-ivory">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

/**
 * `05 · Photo & Video album` (desktop 2226:580 / mobile 2226:822) → `Mixed media / Masonry` (2407:1653 / 2407:1657).
 * Figma hand-places every tile, with a different column order per breakpoint, so the album renders the 3-column
 * desktop arrangement ≥ 1200px and the 2-column mobile one below (tablet reuses it with desktop type sizes).
 * The hidden arrangement is `display: none`, so its lazy images are never fetched. CMS projects without a Figma
 * arrangement get balanced columns (src/server/content/views/projects.ts).
 */
export function ProjectAlbum({ project }: { project: ProjectDetailData }) {
  const { albumLink, photos, videos } = project;
  // Nothing to show yet (CMS project without media or external album).
  if (!photos.length && !videos.length && !albumLink?.href) return null;
  return (
    <section aria-labelledby="project-album" className="flex flex-col gap-4 tablet:gap-6">
      <h2 id="project-album" className={sectionTitle}>
        Ảnh &amp; video
      </h2>
      <MasonryColumns project={project} columns={project.masonry.mobile} className="desktop:hidden" />
      <MasonryColumns project={project} columns={project.masonry.desktop} className="hidden desktop:flex" />
      {albumLink?.href ? (
        <a
          href={albumLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-base leading-[19px] text-muted transition-colors duration-150 hover:text-accent"
        >
          {albumLink.label}
          <span className="sr-only"> (mở tab mới)</span>
        </a>
      ) : albumLink && photos[0] ? (
        <AlbumButton label={albumLink.label} firstPhoto={photos[0]} />
      ) : null}
    </section>
  );
}

function MasonryColumns({
  project,
  columns,
  className,
}: {
  project: ProjectDetailData;
  columns: MediaRef[][];
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 tablet:gap-4", className)}>
      {columns.map((column, columnIndex) => (
        <ul key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3 tablet:gap-4">
          {column.map((ref) => (
            <li key={`${ref.type}-${ref.id}`}>{renderTile(project, ref)}</li>
          ))}
        </ul>
      ))}
    </div>
  );
}

function renderTile(project: ProjectDetailData, ref: MediaRef): ReactNode {
  if (ref.type === "photo") {
    const photo = project.photos.find((entry) => entry.id === ref.id);
    return photo ? <GalleryPhoto photo={photo} /> : null;
  }
  const video = project.videos.find((entry) => entry.id === ref.id);
  return video ? <VideoCard video={video} /> : null;
}

/**
 * `06 · Return to gallery` (desktop 2437:4243 / mobile 2437:4314): full-width "Tất cả dự án ↗" → /projects.
 * Ivory SemiBold 20/26, accent on hover.
 */
export function ReturnLink() {
  return (
    <Link
      href={routes.projects}
      className="group flex items-center justify-between gap-3 text-xl leading-[26px] font-semibold text-ivory transition-colors duration-150 hover:text-accent"
    >
      Tất cả dự án
      <MaskIcon
        name="projects-arrow-up-right"
        size={24}
        className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
