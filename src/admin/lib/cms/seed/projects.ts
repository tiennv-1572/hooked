import { projectDetails } from "@/data/project-details";
import { projectFilters, projects as siteProjects } from "@/data/projects";
import { paragraphsToHtml } from "@/lib/html-text";

import type { Project, ProjectCategory, ProjectsLayout, ProjectsPage } from "../types/projects";
import { img, stamp } from "./helpers";

export const projectCategorySeed: ProjectCategory[] = projectFilters
  .filter((filter) => filter.id !== "all")
  .map((filter, index) => ({ ...stamp(filter.id, 200), slug: filter.id, label: filter.label, order: index }));

export const projectSeed: Project[] = siteProjects.map((summary, index) => {
  const detail = projectDetails.find((item) => item.slug === summary.slug);
  if (!detail) throw new Error(`Missing project detail for ${summary.slug}`);
  return {
    ...stamp(summary.slug, 180 - index * 20, 14 - index * 2),
    slug: summary.slug,
    name: detail.name,
    categoryIds: [...summary.services],
    partners: [...detail.partners],
    description: paragraphsToHtml([detail.description]),
    cover: img(summary.cover),
    heroImage: img(detail.cover.image),
    photos: detail.photos.map((photo) => ({ id: photo.id, ...img(photo) })),
    videos: detail.videos.map((video) => ({
      id: video.id,
      youtubeId: video.id,
      title: video.title,
      thumbnail: img(video.thumbnail, video.title),
    })),
    featuredVideoId: detail.featuredVideoId,
    albumLink: { ...detail.albumLink },
    status: "published",
    order: index,
  };
});

/** Figma "Tất cả" grid: the original projects in order (Landscape · Portrait · Wide · Compact · Panorama). */
export const projectsLayoutSeed: ProjectsLayout = {
  slots: siteProjects.map((summary, index) => ({
    id: `slot-${index + 1}`,
    format: summary.format,
    projectId: summary.slug,
  })),
};

export const projectsPageSeed: ProjectsPage = {
  seo: { title: "Projects", description: "Các dự án sự kiện, media và booking của Hooked Entertainment." },
};
