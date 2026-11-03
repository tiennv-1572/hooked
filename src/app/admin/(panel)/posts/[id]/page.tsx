import type { Metadata } from "next";

import { PostEditor } from "@/admin/modules/blog/post-editor";

/** Client-rendered CMS behind a client-side auth guard: opt out of instant-navigation validation. */
export const instant = false;

export const metadata: Metadata = { title: "Bài viết" };

/** `/admin/posts/new` creates; `/admin/posts/<id>` edits. The id is read client-side (useParams). */
export default function PostEditorPage() {
  return <PostEditor />;
}
