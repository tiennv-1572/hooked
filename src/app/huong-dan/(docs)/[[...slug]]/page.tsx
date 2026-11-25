import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";

import { getGuideMdxComponents } from "@/components/guide/mdx";
import { requireGuideSession } from "@/lib/guide/session";
import { guideSource } from "@/lib/guide/source";

type GuidePageProps = { params: Promise<{ slug?: string[] }> };

export default async function GuidePage({ params }: GuidePageProps) {
  await requireGuideSession(); // see requireGuideSession: each segment checks for itself
  const page = guideSource.getPage((await params).slug);
  if (!page) notFound();

  const MDX = page.data.body;
  return (
    <DocsPage full={page.data.full} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getGuideMdxComponents({ a: createRelativeLink(guideSource, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return guideSource.generateParams();
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const page = guideSource.getPage((await params).slug);
  if (!page) notFound();
  return { description: page.data.description, title: page.data.title };
}
