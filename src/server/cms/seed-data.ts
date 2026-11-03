import type { CollectionKey, CollectionMap, SingletonMap } from "@/admin/lib/cms/registry";
import {
  academyPageSeed,
  courseCategorySeed,
  courseSeed,
  leadSeed,
  studentSeed,
  studentsPageSeed,
} from "@/admin/lib/cms/seed/academy";
import { blogPageSeed, postSeed } from "@/admin/lib/cms/seed/blog";
import {
  aboutPageSeed,
  contactPageSeed,
  homeSeed,
  navigationSeed,
  partnerSeed,
  partnersPageSeed,
  settingsSeed,
} from "@/admin/lib/cms/seed/pages";
import { projectCategorySeed, projectSeed, projectsLayoutSeed, projectsPageSeed } from "@/admin/lib/cms/seed/projects";
import { mediaSeed, userSeed } from "@/admin/lib/cms/seed/system";

/** Initial content = the website's current static data (src/data), mapped to CMS entities. */
export const collectionSeeds: { [K in CollectionKey]: CollectionMap[K][] } = {
  courseCategories: courseCategorySeed,
  courses: courseSeed,
  students: studentSeed,
  leads: leadSeed,
  projects: projectSeed,
  projectCategories: projectCategorySeed,
  posts: postSeed,
  partners: partnerSeed,
  media: mediaSeed,
  users: userSeed,
};

export const singletonSeeds: SingletonMap = {
  settings: settingsSeed,
  navigation: navigationSeed,
  home: homeSeed,
  academyPage: academyPageSeed,
  studentsPage: studentsPageSeed,
  projectsPage: projectsPageSeed,
  projectsLayout: projectsLayoutSeed,
  blogPage: blogPageSeed,
  aboutPage: aboutPageSeed,
  contactPage: contactPageSeed,
  partnersPage: partnersPageSeed,
};
