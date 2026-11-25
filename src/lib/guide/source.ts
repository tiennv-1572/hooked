import { loader } from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons";
import { guide } from "fumadocs-mdx:collections/server";

/** Base path of the CMS guide (Fumadocs), and of every page link it builds. */
export const GUIDE_BASE_PATH = "/huong-dan";

/**
 * The live website, for links a reader clicks in the guide ("mở trang …"). Screenshots are taken on a local
 * copy, but readers act on the real site — change it here if the domain changes.
 */
export const GUIDE_SITE_URL = "https://hooked.vn";

/** The guide's pages: MDX under `content/huong-dan`, compiled by fumadocs-mdx (`source.config.ts`). */
export const guideSource = loader({
  baseUrl: GUIDE_BASE_PATH,
  // `icon` in a folder's meta.json names a Lucide icon, the same ones as the CMS sidebar (nav-config.ts).
  plugins: [lucideIconsPlugin()],
  source: guide.toFumadocsSource(),
});
