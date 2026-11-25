import { createFromSource } from "fumadocs-core/search/server";

import { guideSearchTokenizer } from "@/lib/guide/search-tokenizer";
import { guideSource } from "@/lib/guide/source";
import { getSessionUser } from "@/server/auth/session";

/** Search of the CMS guide, accent-insensitive (`guideSearchTokenizer`). */
const search = createFromSource(guideSource, { tokenizer: guideSearchTokenizer });

/** Same rule as the pages: the guide is for signed-in CMS accounts only. */
export async function GET(request: Request): Promise<Response> {
  if (!(await getSessionUser())) return Response.json({ message: "Cần đăng nhập." }, { status: 401 });
  return search.GET(request);
}
