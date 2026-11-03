import { withPublic } from "@/server/api/http";
import { getCourseCategories, getCourses } from "@/server/content/queries";

/**
 * GET /api/v1/courses — published courses in display order, each with its `category`.
 * `meta.categories`: categories that have at least one published course, in CMS order (the /academy filter chips).
 * All categories: GET /api/v1/course-categories.
 */
export const GET = withPublic(async () => {
  const [data, categories] = await Promise.all([getCourses(), getCourseCategories()]);
  const used = new Set(data.map((course) => course.category?.id));
  return Response.json({
    data,
    meta: { total: data.length, categories: categories.filter((item) => used.has(item.id)) },
  });
});
