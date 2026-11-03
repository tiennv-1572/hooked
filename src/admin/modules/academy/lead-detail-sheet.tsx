"use client";

import { ArrowRight, Copy, ExternalLink, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Thumb } from "@/admin/components/cms/image-fields";
import { LEAD_STATUS_LABEL, LeadStatusBadge } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { Label } from "@/admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Separator } from "@/admin/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/admin/components/ui/sheet";
import { Spinner } from "@/admin/components/ui/spinner";
import { Textarea } from "@/admin/components/ui/textarea";
import { useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Course, Lead, LeadStatus } from "@/admin/lib/cms/types/academy";
import { formatDateTime, formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { formatPhone, LEAD_DOT } from "./lead-status";
import { initials, LEAD_FLOW, LEAD_STATUS_HINT } from "./shared";

const NEXT_STEP: Partial<Record<LeadStatus, { status: LeadStatus; label: string }>> = {
  new: { status: "contacted", label: "Đánh dấu đã liên hệ" },
  contacted: { status: "enrolled", label: "Xác nhận đã ghi danh" },
};

type LeadDetailSheetProps = {
  lead: Lead | undefined;
  courses: Course[];
  onClose: () => void;
  onStatus: (lead: Lead, status: LeadStatus) => void;
  onDelete: (lead: Lead) => void;
};

/** Registration detail: contact shortcuts, status workflow, course, notes and history. */
export function LeadDetailSheet({ lead, courses, onClose, onStatus, onDelete }: LeadDetailSheetProps) {
  return (
    <Sheet open={Boolean(lead)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        onOpenAutoFocus={(event) => {
          // Focus the primary action ("Gọi") rather than the first status button, which would look selected.
          event.preventDefault();
          (event.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
        }}
      >
        {lead ? (
          <LeadDetail
            key={lead.id}
            lead={lead}
            courses={courses}
            onStatus={onStatus}
            onDelete={onDelete}
            onClose={onClose}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function copy(text: string, label: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast.success(`Đã sao chép ${label}.`))
    .catch(() => toast.error("Không sao chép được."));
}

function LeadDetail({
  lead,
  courses,
  onStatus,
  onDelete,
  onClose,
}: Omit<LeadDetailSheetProps, "lead"> & { lead: Lead }) {
  const update = useUpdateItem("leads", { silent: true });
  const [note, setNote] = useState(lead.note ?? "");
  const course = courses.find((item) => item.id === lead.courseId);
  const next = NEXT_STEP[lead.status];
  const phoneDigits = lead.phone.replace(/[^\d+]/g, "");
  const zaloPhone = phoneDigits.replace(/^\+?84/, "0");
  const noteChanged = note.trim() !== (lead.note ?? "").trim();

  const events = [
    { key: "created", status: "new" as LeadStatus, at: lead.createdAt, title: "Gửi đăng ký tư vấn", by: lead.source },
    ...(lead.history ?? []).map((event, index) => ({
      key: `h-${index}`,
      status: event.status,
      at: event.at,
      title: `Chuyển sang “${LEAD_STATUS_LABEL[event.status]}”`,
      by: event.by,
    })),
  ].reverse();

  return (
    <>
      <SheetHeader className="gap-3 border-b p-5 pr-12">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {initials(lead.name)}
          </span>
          <div className="min-w-0">
            <SheetTitle className="truncate text-lg">{lead.name}</SheetTitle>
            <SheetDescription>
              Đăng ký {formatRelative(lead.createdAt)} · {formatDateTime(lead.createdAt)}
            </SheetDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <a href={`tel:${phoneDigits}`} data-autofocus>
              <Phone /> Gọi {formatPhone(lead.phone)}
            </a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`https://zalo.me/${zaloPhone}`} target="_blank" rel="noreferrer">
              <MessageCircle /> Zalo
            </a>
          </Button>
          {lead.email ? (
            <Button size="sm" variant="outline" asChild>
              <a
                href={`mailto:${lead.email}?subject=${encodeURIComponent(`Hooked Academy — tư vấn khóa ${course?.title ?? "học"}`)}`}
              >
                <Mail /> Email
              </a>
            </Button>
          ) : null}
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Trạng thái</h3>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Trạng thái đăng ký">
            {LEAD_FLOW.map((status, index) => {
              const active = status === lead.status;
              return (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={LEAD_STATUS_HINT[status]}
                  onClick={() => onStatus(lead, status)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border px-2.5 py-2 text-left text-xs whitespace-nowrap transition-colors",
                    active ? "border-primary bg-primary/5 ring-primary/30 ring-1" : "hover:bg-muted/60",
                  )}
                >
                  <span className="text-muted-foreground flex items-center gap-1.5 tabular-nums">
                    <span className={cn("size-1.5 rounded-full", LEAD_DOT[status])} />
                    {index < 3 ? `Bước ${index + 1}` : "Kết thúc"}
                  </span>
                  <span className="font-medium">{LEAD_STATUS_LABEL[status]}</span>
                </button>
              );
            })}
          </div>
          <p className="text-muted-foreground text-xs">{LEAD_STATUS_HINT[lead.status]}</p>
          {next ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => onStatus(lead, next.status)}>
                {next.label} <ArrowRight />
              </Button>
              {lead.status !== "closed" ? (
                <Button size="sm" variant="ghost" onClick={() => onStatus(lead, "closed")}>
                  Đóng đăng ký
                </Button>
              ) : null}
            </div>
          ) : null}
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Liên hệ</h3>
          <dl className="grid gap-2 text-sm">
            <InfoRow label="Điện thoại">
              <span className="font-medium tabular-nums">{formatPhone(lead.phone)}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => copy(lead.phone, "số điện thoại")}
                aria-label="Sao chép số điện thoại"
              >
                <Copy />
              </Button>
            </InfoRow>
            <InfoRow label="Email">
              {lead.email ? (
                <>
                  <span className="truncate">{lead.email}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => copy(lead.email!, "email")}
                    aria-label="Sao chép email"
                  >
                    <Copy />
                  </Button>
                </>
              ) : (
                <span className="text-muted-foreground">Không có</span>
              )}
            </InfoRow>
            <InfoRow label="Nguồn">{lead.source}</InfoRow>
            <InfoRow label="Mã đăng ký">
              <span className="text-muted-foreground font-mono text-xs">{lead.id}</span>
            </InfoRow>
          </dl>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Khóa học quan tâm</h3>
            {course ? (
              <Button variant="ghost" size="xs" asChild>
                <Link href={`/admin/courses/${course.id}`}>
                  Mở khóa học <ExternalLink />
                </Link>
              </Button>
            ) : null}
          </div>
          {course ? (
            <div className="flex items-center gap-3 rounded-lg border p-2.5">
              <Thumb image={course.image} className="h-12 w-20 shrink-0 rounded-md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{course.title}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {course.tuition} · {course.duration}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">Khóa học này đã bị xóa.</p>
          )}
          <div className="grid gap-1.5">
            <Label className="text-muted-foreground text-xs">Đổi khóa học (nếu học viên muốn học khóa khác)</Label>
            <Select
              value={course ? lead.courseId : ""}
              onValueChange={(courseId) =>
                update.mutate(
                  { id: lead.id, patch: { courseId } },
                  { onSuccess: () => toast.success("Đã đổi khóa học.") },
                )
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-2">
          <Label htmlFor="lead-note" className="text-sm font-semibold">
            Ghi chú nội bộ
          </Label>
          <Textarea
            id="lead-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nội dung trao đổi, lịch hẹn học thử, mong muốn của học viên…"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs">Chỉ đội ngũ Hooked thấy.</span>
            <Button
              size="sm"
              variant={noteChanged ? "default" : "outline"}
              disabled={!noteChanged || update.isPending}
              onClick={() =>
                update.mutate(
                  { id: lead.id, patch: { note: note.trim() || undefined } },
                  { onSuccess: () => toast.success("Đã lưu ghi chú.") },
                )
              }
            >
              {update.isPending ? <Spinner /> : null}
              Lưu ghi chú
            </Button>
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Lịch sử</h3>
          <ol className="before:bg-border relative flex flex-col gap-4 pl-5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[5px] before:w-px">
            {events.map((event) => (
              <li key={event.key} className="relative">
                <span
                  className={cn(
                    "border-background absolute top-1 -left-5 size-[11px] rounded-full border-2",
                    LEAD_DOT[event.status],
                  )}
                />
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(event.at)}
                  {event.by ? ` · ${event.by}` : ""}
                </p>
              </li>
            ))}
          </ol>
          {!lead.history?.length && lead.status !== "new" ? (
            <p className="text-muted-foreground text-xs">Trạng thái hiện tại được cập nhật trước khi có nhật ký.</p>
          ) : null}
        </section>
      </div>

      <SheetFooter className="flex-row justify-between border-t p-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(lead)}
        >
          <Trash2 /> Xóa đăng ký
        </Button>
        <Button variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </SheetFooter>
    </>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1.5">{children}</dd>
    </div>
  );
}
