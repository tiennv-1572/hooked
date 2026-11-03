import { StatusPill } from "@/admin/components/cms/status-badge";

import { POST_STATE_LABEL, type PostState } from "./post-utils";

const STATE_TONE: Record<PostState, "muted" | "info" | "success"> = {
  draft: "muted",
  scheduled: "info",
  published: "success",
};

/** "Bản nháp" / "Đã lên lịch" / "Đã xuất bản". */
export function PostStateBadge({ state }: { state: PostState }) {
  return <StatusPill tone={STATE_TONE[state]}>{POST_STATE_LABEL[state]}</StatusPill>;
}
