import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { GUIDE_BASE_PATH } from "@/lib/guide/source";
import { getSessionUser } from "@/server/auth/session";

/**
 * The signed-in CMS account reading the guide; anyone else goes to the CMS login and back to the guide.
 *
 * Called by EVERY segment of the guide (root layout, docs layout, page), not only the root layout: with Cache
 * Components a segment that reads no request data is prerendered, and its prerendered payload can be fetched on its own
 * (segment prefetch) — a check in the layout would not cover the page. Reading the session keeps each segment out of
 * the static output. `cache` makes it one check (one MySQL read) per request.
 */
export const requireGuideSession = cache(async () => {
  const user = await getSessionUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(GUIDE_BASE_PATH)}`);
  return user;
});
