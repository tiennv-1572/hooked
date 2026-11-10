import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { cmsTag } from "../api/http";
import { getSingleton, listItems } from "../cms/repository";
import type {
  CollaborationDto,
  CourseCategoryDto,
  CourseDto,
  HomeDto,
  PaginationMeta,
  PartnerDto,
  PostDto,
  PostSummaryDto,
  ProjectCategoryDto,
  ProjectDto,
  ProjectGridCellDto,
  ProjectPreviewDto,
  ProjectSummaryDto,
  SiteDto,
  StudentDto,
} from "./dto";
import {
  categoryDto,
  collaborationDto,
  courseCategoryDto,
  courseDto,
  image,
  isPublished,
  partnerDto,
  postDto,
  postSummaryDto,
  projectDto,
  projectPreviewDto,
  projectSummaryDto,
  studentDto,
} from "./mappers";
import { sanitizeRichText } from "./rich-text";

/*
 * Read side of the website: cached, published-only content as public DTOs.
 * Used by the REST endpoints in src/app/api/v1/** AND directly by the website's Server Components
 * (same functions, same shapes — no HTTP round trip to itself).
 * Each function is tagged `cms:<key>`; admin writes invalidate those tags (src/server/api/admin-keys.ts).
 */

function tags(...keys: string[]) {
  cacheTag(...keys.map(cmsTag));
  cacheLife("hours");
}

// ---------------------------------------------------------------------------------------------------------
// Site & pages

export async function getSite(): Promise<SiteDto> {
  "use cache";
  tags("settings", "navigation");
  const [settings, navigation] = await Promise.all([getSingleton("settings"), getSingleton("navigation")]);
  const visible = (items: typeof navigation.desktop) =>
    items
      .filter((item) => item.visible)
      .map((item) => ({ label: item.label, href: item.href, newTab: Boolean(item.newTab) }));
  return {
    name: settings.siteName,
    tagline: settings.tagline,
    description: settings.description,
    company: {
      legalName: settings.company.legalName,
      address: settings.company.address,
      email: settings.company.email,
      phone: { display: settings.company.phoneDisplay, href: settings.company.phoneHref },
    },
    socials: settings.socials.map((social) => ({ label: social.label, href: social.href })),
    seo: {
      titleTemplate: settings.seo.titleTemplate,
      defaultTitle: settings.seo.defaultTitle,
      ogImage: settings.seo.ogImage?.url ? image(settings.seo.ogImage, settings.siteName) : null,
    },
    navigation: {
      desktop: visible(navigation.desktop),
      mobile: visible(navigation.mobile),
      footer: visible(navigation.footer),
    },
  };
}

export async function getHomePage(): Promise<HomeDto> {
  "use cache";
  tags("home", "partners", "settings");
  const [home, partners, settings] = await Promise.all([
    getSingleton("home"),
    listItems("partners"),
    getSingleton("settings"),
  ]);
  return {
    hero: {
      // Slides have no title of their own: the site name describes them.
      slides: home.hero.slides.map((slide) => ({
        id: slide.id,
        type: slide.youtubeId ? "video" : "image",
        image: image(slide.image, settings.siteName),
        youtubeId: slide.youtubeId || null,
      })),
    },
    intro: { titleLines: home.intro.titleLines, body: home.intro.body },
    highlights: home.highlights.map((item) => ({
      id: item.id,
      title: item.title,
      href: item.href,
      align: item.align,
      image: image(item.image, item.title),
    })),
    services: home.services.map((service) => ({
      id: service.id,
      title: service.title,
      titleLines: service.titleLines?.length ? service.titleLines : null,
      description: service.description,
      href: service.href,
      image: image(service.image, service.title),
    })),
    blogCarousel: {
      initialIndex: Math.min(home.blogCarousel.initialIndex, Math.max(home.blogCarousel.items.length - 1, 0)),
      items: home.blogCarousel.items.map((item) => ({
        id: item.id,
        title: item.title,
        lines: item.lines,
        href: item.href,
        image: image(item.image, item.title),
      })),
    },
    partners: {
      titleLines: home.partners.titleLines,
      body: home.partners.body,
      cta: home.partners.cta,
      logos: partners.filter((partner) => partner.showOnHome).map(partnerDto),
    },
  };
}

export async function getAcademyPage() {
  "use cache";
  tags("academyPage");
  return getSingleton("academyPage");
}

export async function getStudentsPage() {
  "use cache";
  tags("studentsPage");
  return getSingleton("studentsPage");
}

export async function getProjectsPage() {
  "use cache";
  tags("projectsPage");
  return getSingleton("projectsPage");
}

/**
 * Cells of the /projects "Tất cả" grid ("Cài đặt hiển thị dự án"), top to bottom: cells whose project is not published
 * are skipped. When no cell is left, every published project gets a full-width row, so "Tất cả" is never empty while
 * projects are published.
 */
export async function getProjectsGrid(): Promise<ProjectGridCellDto[]> {
  "use cache";
  tags("projectsLayout", "projects");
  const [layout, projects] = await Promise.all([getSingleton("projectsLayout"), getProjects()]);
  const published = new Set(projects.map((project) => project.id));
  const cells = (layout.slots ?? []).flatMap((slot) =>
    slot.projectId && published.has(slot.projectId) ? [{ format: slot.format, projectId: slot.projectId }] : [],
  );
  return cells.length ? cells : projects.map((project) => ({ format: "panorama", projectId: project.id }));
}

export async function getBlogPage() {
  "use cache";
  tags("blogPage");
  return getSingleton("blogPage");
}

export async function getAboutPage() {
  "use cache";
  tags("aboutPage");
  const page = await getSingleton("aboutPage");
  // Photos carry the page title as alt (no per-image alt in the CMS).
  const block = (photos: typeof page.photos.top | undefined) =>
    (photos ?? []).map((photo) => image(photo, page.intro.title));
  return { ...page, photos: { top: block(page.photos?.top), bottom: block(page.photos?.bottom) } };
}

export async function getContactPage() {
  "use cache";
  tags("contactPage", "settings");
  const [page, settings] = await Promise.all([getSingleton("contactPage"), getSingleton("settings")]);
  return {
    ...page,
    contact: {
      email: settings.company.email,
      phone: { display: settings.company.phoneDisplay, href: settings.company.phoneHref },
      address: settings.company.address,
      legalName: settings.company.legalName,
      socials: settings.socials.map((social) => ({ label: social.label, href: social.href })),
    },
  };
}

export async function getPartnersPage() {
  "use cache";
  tags("partnersPage", "partners");
  const [page, partners] = await Promise.all([getSingleton("partnersPage"), listItems("partners")]);
  return {
    ...page,
    body: sanitizeRichText(page.body),
    logos: partners.filter((partner) => partner.showOnPartnersPage).map(partnerDto),
    collaborations: (page.collaborations ?? []).map(collaborationDto),
  };
}

// ---------------------------------------------------------------------------------------------------------
// Academy

/** All course categories in CMS order (`/api/v1/course-categories`). */
export async function getCourseCategories(): Promise<CourseCategoryDto[]> {
  "use cache";
  tags("courseCategories");
  return (await listItems("courseCategories")).map(courseCategoryDto);
}

/** Published courses in display order (each with its category). */
export async function getCourses(): Promise<CourseDto[]> {
  "use cache";
  tags("courses", "courseCategories");
  const [courses, categories] = await Promise.all([listItems("courses"), listItems("courseCategories")]);
  return courses.filter(isPublished).map((course) => courseDto(course, categories));
}

export async function getCourse(id: string): Promise<CourseDto | null> {
  "use cache";
  tags("courses", "courseCategories");
  const [courses, categories] = await Promise.all([listItems("courses"), listItems("courseCategories")]);
  const course = courses.find((item) => isPublished(item) && item.id === id);
  return course ? courseDto(course, categories) : null;
}

export async function getStudents(filter: { featured?: boolean; role?: string } = {}): Promise<StudentDto[]> {
  "use cache";
  tags("students");
  return (await listItems("students"))
    .filter(isPublished)
    .filter((student) => filter.featured === undefined || student.featured === filter.featured)
    .filter((student) => !filter.role || student.role.trim().toLowerCase() === filter.role.trim().toLowerCase())
    .map(studentDto);
}

export async function getStudent(slug: string): Promise<StudentDto | null> {
  "use cache";
  tags("students");
  const student = (await listItems("students")).find((item) => isPublished(item) && item.slug === slug);
  return student ? studentDto(student) : null;
}

// ---------------------------------------------------------------------------------------------------------
// Projects

export async function getProjectCategories(): Promise<ProjectCategoryDto[]> {
  "use cache";
  tags("projectCategories");
  return (await listItems("projectCategories")).map(categoryDto);
}

export async function getProjects(filter: { category?: string } = {}): Promise<ProjectSummaryDto[]> {
  "use cache";
  tags("projects", "projectCategories");
  const [projects, categories] = await Promise.all([listItems("projects"), listItems("projectCategories")]);
  return projects
    .filter(isPublished)
    .map((project) => projectSummaryDto(project, categories))
    .filter(
      (project) =>
        !filter.category ||
        project.categories.some((category) => category.slug === filter.category || category.id === filter.category),
    );
}

/** Hover previews of the /projects cards (website only, not served by the API). */
export async function getProjectPreviews(): Promise<ProjectPreviewDto[]> {
  "use cache";
  tags("projects");
  return (await listItems("projects")).filter(isPublished).map(projectPreviewDto);
}

export async function getProject(slug: string): Promise<ProjectDto | null> {
  "use cache";
  tags("projects", "projectCategories");
  const [projects, categories] = await Promise.all([listItems("projects"), listItems("projectCategories")]);
  const project = projects.find((item) => isPublished(item) && item.slug === slug);
  return project ? projectDto(project, categories) : null;
}

// ---------------------------------------------------------------------------------------------------------
// Blog

async function publishedPosts() {
  const now = Date.now();
  return (await listItems("posts"))
    .filter((post) => isPublished(post) && (!post.publishedAt || new Date(post.publishedAt).getTime() <= now))
    .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

export async function getPosts(
  query: { tag?: string; page?: number; limit?: number } = {},
): Promise<{ data: PostSummaryDto[]; meta: PaginationMeta }> {
  "use cache";
  tags("posts");
  const limit = Math.min(Math.max(query.limit ?? 12, 1), 50);
  const all = (await publishedPosts()).filter((post) => !query.tag || post.tags?.includes(query.tag));
  const totalPages = Math.max(1, Math.ceil(all.length / limit));
  const page = Math.min(Math.max(query.page ?? 1, 1), totalPages);
  return {
    data: all.slice((page - 1) * limit, page * limit).map(postSummaryDto),
    meta: { page, limit, total: all.length, totalPages },
  };
}

export async function getPost(slug: string): Promise<PostDto | null> {
  "use cache";
  tags("posts");
  const post = (await publishedPosts()).find((item) => item.slug === slug);
  return post ? postDto(post) : null;
}

/** All published slugs (generateStaticParams). */
export async function getPostSlugs() {
  "use cache";
  tags("posts");
  return (await publishedPosts()).map((post) => post.slug);
}

// ---------------------------------------------------------------------------------------------------------
// Partners

export async function getPartners(filter: { placement?: "home" | "partners" } = {}): Promise<PartnerDto[]> {
  "use cache";
  tags("partners");
  return (await listItems("partners"))
    .filter((partner) =>
      filter.placement === "home"
        ? partner.showOnHome
        : filter.placement === "partners"
          ? partner.showOnPartnersPage
          : true,
    )
    .map(partnerDto);
}

/** "Dự án hợp tác" cards, edited on the Partners page (`partnersPage.collaborations`). */
export async function getCollaborations(): Promise<CollaborationDto[]> {
  "use cache";
  tags("partnersPage");
  return ((await getSingleton("partnersPage")).collaborations ?? []).map(collaborationDto);
}
