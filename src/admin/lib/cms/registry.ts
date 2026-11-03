import type { AcademyPage, Course, CourseCategory, Lead, Student, StudentsPage } from "./types/academy";
import type { BlogPage, Post } from "./types/blog";
import type { AboutPage, ContactPage, HomePage, Navigation, Partner, PartnersPage, SiteSettings } from "./types/pages";
import type { Project, ProjectCategory, ProjectsLayout, ProjectsPage } from "./types/projects";
import type { AdminUser, MediaAsset } from "./types/shared";

/**
 * The CMS content model in one place.
 * - Collections: lists of entities with id/createdAt/updatedAt (CRUD + optional ordering).
 * - Singletons: one document each (page copy, settings, navigation).
 * The API client will expose the same keys (e.g. GET /cms/courses, PUT /cms/singletons/home).
 */
export type CollectionMap = {
  courseCategories: CourseCategory;
  courses: Course;
  students: Student;
  leads: Lead;
  projects: Project;
  projectCategories: ProjectCategory;
  posts: Post;
  partners: Partner;
  media: MediaAsset;
  users: AdminUser;
};

export type SingletonMap = {
  settings: SiteSettings;
  navigation: Navigation;
  home: HomePage;
  academyPage: AcademyPage;
  studentsPage: StudentsPage;
  projectsPage: ProjectsPage;
  projectsLayout: ProjectsLayout;
  blogPage: BlogPage;
  aboutPage: AboutPage;
  contactPage: ContactPage;
  partnersPage: PartnersPage;
};

export type CollectionKey = keyof CollectionMap;
export type SingletonKey = keyof SingletonMap;
export type CollectionItem<K extends CollectionKey> = CollectionMap[K];

/** Fields the adapter fills in on create. */
export type NewItem<K extends CollectionKey> = Omit<CollectionMap[K], "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

type CollectionMeta = {
  /** Plural label ("Khóa học"). */
  label: string;
  /** Singular label used in toasts ("khóa học"). */
  singular: string;
  /** Items carry an `order` field and can be reordered by drag & drop. */
  ordered: boolean;
  /** Field used as the human label in toasts. */
  titleField: string;
  /** No slug field in the editor: a new item gets a unique slug made from `titleField` (see `autoSlug`). */
  autoSlug?: boolean;
};

export const collectionMeta: Record<CollectionKey, CollectionMeta> = {
  courseCategories: { label: "Danh mục khóa học", singular: "danh mục", ordered: true, titleField: "label" },
  courses: { label: "Khóa học", singular: "khóa học", ordered: true, titleField: "title" },
  students: { label: "Học viên", singular: "học viên", ordered: true, titleField: "name", autoSlug: true },
  leads: { label: "Đăng ký tư vấn", singular: "đăng ký", ordered: false, titleField: "name" },
  projects: { label: "Dự án", singular: "dự án", ordered: true, titleField: "name" },
  projectCategories: { label: "Danh mục dự án", singular: "danh mục", ordered: true, titleField: "label" },
  posts: { label: "Bài viết", singular: "bài viết", ordered: false, titleField: "title" },
  partners: { label: "Đối tác", singular: "đối tác", ordered: true, titleField: "name" },
  media: { label: "Thư viện media", singular: "tệp", ordered: false, titleField: "name" },
  users: { label: "Người dùng", singular: "người dùng", ordered: false, titleField: "name" },
};

export const singletonMeta: Record<SingletonKey, { label: string; publicPath?: string }> = {
  settings: { label: "Thông tin website" },
  navigation: { label: "Menu & điều hướng" },
  home: { label: "Trang chủ", publicPath: "/" },
  academyPage: { label: "Trang Academy", publicPath: "/academy" },
  studentsPage: { label: "Trang Học viên tiêu biểu", publicPath: "/academy/students" },
  projectsPage: { label: "Trang Projects", publicPath: "/projects" },
  projectsLayout: { label: "Cài đặt hiển thị dự án", publicPath: "/projects" },
  blogPage: { label: "Trang Blog", publicPath: "/blog" },
  aboutPage: { label: "Trang About", publicPath: "/about" },
  contactPage: { label: "Trang Contact", publicPath: "/contact" },
  partnersPage: { label: "Trang Partners", publicPath: "/partners" },
};
