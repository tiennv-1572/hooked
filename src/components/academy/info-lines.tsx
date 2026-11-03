import type { InfoLine } from "@/data/academy";

type InfoLinesProps = {
  lines: InfoLine[];
  /** Figma bolds the label part ("**Giảng viên chính**: Marcuz") on the carousel, not inside the overlays. */
  boldLabels?: boolean;
};

/** Renders course fact lines (instructors, schedule) — one paragraph per line. */
export function InfoLines({ lines, boldLabels = true }: InfoLinesProps) {
  return lines.map((line) =>
    typeof line === "string" ? (
      <p key={line}>{line}</p>
    ) : (
      <p key={line.label}>
        <span className={boldLabels ? "font-bold" : undefined}>{line.label}</span>: {line.value}
      </p>
    ),
  );
}
