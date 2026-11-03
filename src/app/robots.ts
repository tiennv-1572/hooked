import type { MetadataRoute } from "next";

import { siteUrl } from "@/server/content/views/site";

/** The admin CMS and its API stay out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/admin"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
