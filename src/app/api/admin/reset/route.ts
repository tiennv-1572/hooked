import { invalidate, withAdmin } from "@/server/api/http";
import { resetContent } from "@/server/cms/seed";

/** POST /api/admin/reset — restore the seed content (owner only). Keeps admin accounts. */
export const POST = withAdmin(
  async () => {
    await resetContent();
    invalidate(
      "courses",
      "students",
      "projects",
      "projectCategories",
      "posts",
      "partners",
      "settings",
      "navigation",
      "home",
      "academyPage",
      "studentsPage",
      "projectsPage",
      "projectsLayout",
      "blogPage",
      "aboutPage",
      "contactPage",
      "partnersPage",
    );
    return Response.json({ ok: true });
  },
  { role: "owner" },
);
