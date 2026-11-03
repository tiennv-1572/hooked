import type { Metadata } from "next";

import { ProjectsPortfolio } from "@/components/projects/overview/projects-portfolio";
import { getProjectCategories, getProjects, getProjectsGrid, getProjectsPage } from "@/server/content/queries";
import { toProjectsMetadata, toProjectsOverview } from "@/server/content/views/projects";

export async function generateMetadata(): Promise<Metadata> {
  return toProjectsMetadata(await getProjectsPage());
}

/**
 * Projects / Overview — Figma "04 · Projects / Overview" 2341:1602 (desktop 2226:364, mobile 2226:366).
 * Content: `projectsPage` (SEO), `projectsLayout` (cells of the "Tất cả" grid), CMS
 * categories (filter chips) and published projects (cards + their featured videos — the client gallery never receives
 * the rest of a project's media).
 */
export default async function ProjectsPage() {
  const [grid, categories, projects] = await Promise.all([getProjectsGrid(), getProjectCategories(), getProjects()]);
  return <ProjectsPortfolio {...toProjectsOverview({ grid, categories, projects })} />;
}
