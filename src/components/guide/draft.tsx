import { Callout } from "fumadocs-ui/components/callout";

/** Marks a section still being written, so a reader never mistakes an empty heading for the whole answer. */
export function Draft({ children }: { children?: string }) {
  return (
    <Callout title="Đang soạn" type="info">
      {children ?? "Nội dung mục này đang được viết."}
    </Callout>
  );
}
