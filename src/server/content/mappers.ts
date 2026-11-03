import { excerptOf, parseInline, stripInline } from "@/admin/lib/cms/inline";
import type { Course, CourseCategory, Student } from "@/admin/lib/cms/types/academy";
import type { Post } from "@/admin/lib/cms/types/blog";
import type { Partner, PartnerCollaboration } from "@/admin/lib/cms/types/pages";
import type { Project, ProjectCategory } from "@/admin/lib/cms/types/projects";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { htmlToText } from "@/lib/html-text";

import type {
  CollaborationDto,
  CourseCategoryDto,
  CourseDto,
  ImageDto,
  PartnerDto,
  PostBlockDto,
  PostDto,
  PostSummaryDto,
  ProjectCategoryDto,
  ProjectDto,
  ProjectSummaryDto,
  ProjectVideoDto,
  StudentDto,
} from "./dto";
import { sanitizeRichText } from "./rich-text";

/** CMS entity → public DTO mappers (pure functions, no I/O). */

/**
 * Stored image → public image. `alt` is the title of the item that owns the image (course title, project name,
 * partner name…): the CMS has no per-image alt text, so captions stay in sync with the content they describe.
 */
export const image = (ref: ImageRef | undefined | null, alt: string): ImageDto => ({
  url: ref?.url ?? "",
  alt,
  ...(ref?.width ? { width: ref.width } : {}),
  ...(ref?.height ? { height: ref.height } : {}),
});

export const isPublished = (item: { status?: string }) => item.status === "published";

export const courseCategoryDto = (category: CourseCategory): CourseCategoryDto => ({
  id: category.id,
  label: category.label,
});

export function courseDto(course: Course, categories: CourseCategory[]): CourseDto {
  const category = categories.find((item) => item.id === course.categoryId);
  return {
    id: course.id,
    title: course.title,
    category: category ? courseCategoryDto(category) : null,
    description: course.description,
    instructors: course.instructors ?? [],
    duration: course.duration,
    schedule: (course.schedule ?? []).map((line) => ({ label: line.label || null, value: line.value })),
    tuition: course.tuition,
    modules: course.modules ?? [],
    benefits: course.benefits ?? [],
    image: image(course.image, course.title),
    zoomTopLeft: Boolean(course.zoomTopLeft),
  };
}

export function studentDto(student: Student): StudentDto {
  return {
    id: student.id,
    slug: student.slug,
    name: student.name,
    role: student.role,
    affiliation: student.affiliation,
    portrait: { ...image(student.portrait, student.name), crop: student.crop ?? null },
    story: sanitizeRichText(student.story),
    featured: Boolean(student.featured),
    headline: student.headline || null,
  };
}

export const categoryDto = (category: ProjectCategory): ProjectCategoryDto => ({
  id: category.id,
  slug: category.slug,
  label: category.label,
});

function videoDto(video: Project["videos"][number]): ProjectVideoDto {
  return {
    id: video.id,
    youtubeId: video.youtubeId,
    title: video.title,
    thumbnail: image(video.thumbnail, video.title),
  };
}

export function projectSummaryDto(project: Project, categories: ProjectCategory[]): ProjectSummaryDto {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const featured = project.videos?.find((video) => video.id === project.featuredVideoId);
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    categories: (project.categoryIds ?? [])
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((c) => categoryDto(c!)),
    cover: image(project.cover, project.name),
    featuredVideo: featured ? videoDto(featured) : null,
  };
}

export function projectDto(project: Project, categories: ProjectCategory[]): ProjectDto {
  return {
    ...projectSummaryDto(project, categories),
    partners: project.partners ?? [],
    description: sanitizeRichText(project.description),
    hero: { image: image(project.heroImage, project.name) },
    photos: (project.photos ?? []).map((photo, index) => ({
      id: photo.id,
      ...image(photo, `${project.name} – ảnh ${index + 1}`),
    })),
    videos: (project.videos ?? []).map(videoDto),
    albumLink: { label: project.albumLink?.label ?? "", href: project.albumLink?.href || null },
  };
}

function words(text: string) {
  return stripInline(text).split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(post: Post) {
  let count = words(post.intro ?? "");
  for (const block of post.blocks ?? []) {
    if (block.type === "paragraph") count += words(htmlToText(block.html ?? ""));
    if (block.type === "heading" || block.type === "quote") count += words(block.text);
    if (block.type === "list") count += block.items.reduce((sum, item) => sum + words(item), 0);
  }
  return Math.max(1, Math.round(count / 220)); // 220 words/min — Vietnamese editorial reading speed used by the site.
}

export function postSummaryDto(post: Post): PostSummaryDto {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    kicker: post.kicker,
    excerpt: excerptOf(post.intro ?? ""),
    cover: image(post.cover, post.title),
    tags: post.tags ?? [],
    author: post.author,
    publishedAt: post.publishedAt ?? null,
    readingMinutes: readingMinutes(post),
  };
}

function blockDto(block: Post["blocks"][number], postTitle: string): PostBlockDto {
  switch (block.type) {
    case "heading":
      return { id: block.id, type: "heading", text: block.text };
    case "paragraph":
      return { id: block.id, type: "paragraph", html: sanitizeRichText(block.html) };
    case "list":
      return { id: block.id, type: "list", items: block.items.map((text) => ({ text, parts: parseInline(text) })) };
    case "image":
      return {
        id: block.id,
        type: "image",
        image: image(block.image, block.caption || postTitle),
        caption: block.caption || null,
      };
    case "imagePair":
      return {
        id: block.id,
        type: "imagePair",
        images: [image(block.images[0], postTitle), image(block.images[1], postTitle)],
      };
    case "quote":
      return { id: block.id, type: "quote", text: block.text, cite: block.cite || null };
    case "cta":
      return { id: block.id, type: "cta", label: block.label, href: block.href };
  }
}

export function postDto(post: Post): PostDto {
  return {
    ...postSummaryDto(post),
    intro: { text: post.intro ?? "", parts: parseInline(post.intro ?? "") },
    introCta:
      post.introCta?.label && post.introCta.href ? { label: post.introCta.label, href: post.introCta.href } : null,
    blocks: (post.blocks ?? []).map((block) => blockDto(block, post.title)),
    seo: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || excerptOf(post.intro ?? ""),
      image: post.seo?.image?.url ? image(post.seo.image, post.seo.title || post.title) : null,
    },
  };
}

export const partnerDto = (partner: Partner): PartnerDto => ({
  id: partner.id,
  name: partner.name,
  logo: image(partner.logo, partner.name),
  website: partner.website || null,
});

export const collaborationDto = (item: PartnerCollaboration): CollaborationDto => ({
  id: item.id,
  title: item.title,
  partnerLabel: item.partnerLabel,
  href: item.href,
  image: image(item.image, item.title),
});
