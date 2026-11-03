import { errorResponse, withPublic } from "@/server/api/http";
import {
  getAboutPage,
  getAcademyPage,
  getBlogPage,
  getContactPage,
  getHomePage,
  getPartnersPage,
  getProjectsGrid,
  getProjectsPage,
  getStudentsPage,
} from "@/server/content/queries";

const PAGES = {
  home: getHomePage,
  academy: getAcademyPage,
  students: getStudentsPage,
  projects: async () => {
    const [page, cardLayout] = await Promise.all([getProjectsPage(), getProjectsGrid()]);
    return { ...page, cardLayout };
  },
  blog: getBlogPage,
  about: getAboutPage,
  contact: getContactPage,
  partners: getPartnersPage,
} as const;

type Context = { params: Promise<{ page: string }> };

/** GET /api/v1/pages/{page} — editable copy of one page (home, academy, students, projects, blog, about, contact, partners). */
export const GET = withPublic<Context>(async (_request, { params }) => {
  const { page } = await params;
  const load = PAGES[page as keyof typeof PAGES];
  if (!load) return errorResponse(404, "not_found", `Trang "${page}" không tồn tại.`);
  return Response.json({ data: await load() });
});
