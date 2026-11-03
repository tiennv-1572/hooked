import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProjectDetailSkeleton, ProjectDetailView } from "@/components/projects/detail/project-detail-view";
import { getProject, getProjects } from "@/server/content/queries";
import { toProjectDetail, toProjectMetadata } from "@/server/content/views/projects";

type Params = PageProps<"/projects/[slug]">["params"];

/**
 * Cache Components needs at least one entry (an empty list fails the build), so an empty CMS prerenders this
 * placeholder, which `notFound()`s like any unknown slug.
 */
const PLACEHOLDER_SLUG = "__no-project__";

/** Published projects are prerendered; projects published later render on their first request (then get cached). */
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.length ? projects.map(({ slug }) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  return project ? toProjectMetadata(project) : {};
}

async function ProjectDetailContent({ params }: { params: Params }) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  return <ProjectDetailView project={toProjectDetail(project)} />;
}

/**
 * Project detail ×5 — Figma 05–09 (sections 2846:5175, 2846:5180, 2846:5185, 2846:5190, 2846:5195).
 * Content: the published CMS project (`getProject`). `params` is read inside <Suspense> so the route keeps an instant
 * App Shell (Next 16 instant-navigation rule). Unknown or unpublished slugs → `notFound()`.
 */
export default function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}
