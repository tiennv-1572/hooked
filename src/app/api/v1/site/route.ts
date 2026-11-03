import { withPublic } from "@/server/api/http";
import { getSite } from "@/server/content/queries";

/** GET /api/v1/site — site settings, contact info, socials and menus (header, mobile menu, footer). */
export const GET = withPublic(async () => Response.json({ data: await getSite() }));
