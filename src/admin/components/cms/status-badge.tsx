import type { LeadStatus } from "@/admin/lib/cms/types/academy";
import type { PublishStatus } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "muted" | "primary" | "info" | "destructive";

const TONES: Record<Tone, string> = {
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_35%)] ring-warning/30 dark:text-warning",
  muted: "bg-muted text-muted-foreground ring-border",
  primary: "bg-primary/12 text-primary ring-primary/25",
  info: "bg-chart-3/12 text-chart-3 ring-chart-3/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/25",
};

/** Small pill with a coloured dot. */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export const PUBLISH_LABEL: Record<PublishStatus, string> = { published: "Đã xuất bản", draft: "Bản nháp" };

export function PublishBadge({ status }: { status: PublishStatus }) {
  return <StatusPill tone={status === "published" ? "success" : "muted"}>{PUBLISH_LABEL[status]}</StatusPill>;
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  enrolled: "Đã ghi danh",
  closed: "Đã đóng",
};

const LEAD_TONE: Record<LeadStatus, Tone> = { new: "primary", contacted: "info", enrolled: "success", closed: "muted" };

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <StatusPill tone={LEAD_TONE[status]}>{LEAD_STATUS_LABEL[status]}</StatusPill>;
}
