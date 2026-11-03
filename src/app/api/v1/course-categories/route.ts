import { withPublic } from "@/server/api/http";
import { getCourseCategories } from "@/server/content/queries";

/** GET /api/v1/course-categories — course categories ("Danh mục khóa học") in CMS order. */
export const GET = withPublic(async () => {
  const data = await getCourseCategories();
  return Response.json({ data, meta: { total: data.length } });
});
