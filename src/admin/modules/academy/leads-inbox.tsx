"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarRange,
  ChevronDown,
  Copy,
  Download,
  Eye,
  Inbox,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader } from "@/admin/components/cms/data-table";
import { PageHeader } from "@/admin/components/cms/page-header";
import { LEAD_STATUS_LABEL } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { Input } from "@/admin/components/ui/input";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { useCollection, useDeleteItems } from "@/admin/lib/cms/hooks";
import type { Lead, LeadStatus } from "@/admin/lib/cms/types/academy";
import { downloadCsv, formatDateTime, formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { LeadCreateDialog } from "./lead-create-dialog";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { formatPhone, LEAD_DOT, LeadStatusMenu, useSetLeadStatus } from "./lead-status";
import { FacetPopover, initials, LEAD_FLOW, useCourseCategories } from "./shared";

type Range = "7" | "30" | "90" | "all";
const RANGES: { value: Range; label: string; long: string }[] = [
  { value: "7", label: "7 ngày", long: "7 ngày qua" },
  { value: "30", label: "30 ngày", long: "30 ngày qua" },
  { value: "90", label: "90 ngày", long: "90 ngày qua" },
  { value: "all", label: "Tất cả", long: "toàn bộ thời gian" },
];
const DAY = 86_400_000;
const DELETED_COURSE = "__deleted";

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

const isStatus = (value: string | null): value is LeadStatus =>
  Boolean(value && (LEAD_FLOW as string[]).includes(value));

/**
 * Registrations inbox ("Đăng ký tư vấn"). Reads `?status=` (header bell), `?course=` (course editor) and
 * `?lead=` (detail sheet) — so it renders inside a Suspense boundary (useSearchParams).
 */
export function LeadsInbox() {
  return (
    <Suspense fallback={<InboxSkeleton />}>
      <LeadsInboxContent />
    </Suspense>
  );
}

function LeadsInboxContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: leadsData, isLoading } = useCollection("leads");
  const { data: coursesData } = useCollection("courses");
  const remove = useDeleteItems("leads");
  const setLeadStatus = useSetLeadStatus();
  const confirm = useConfirm();

  const [range, setRange] = useState<Range>("all");
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [now] = useState(() => Date.now());

  const leads = useMemo(() => leadsData ?? [], [leadsData]);
  const courses = useMemo(() => coursesData ?? [], [coursesData]);
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const { labelOf: categoryLabel } = useCourseCategories();

  // URL state ------------------------------------------------------------------------------------------
  const statusParam = searchParams.get("status");
  const status: LeadStatus | "all" = isStatus(statusParam) ? statusParam : "all";
  const courseFilter = useMemo(() => searchParams.get("course")?.split(",").filter(Boolean) ?? [], [searchParams]);
  const activeId = searchParams.get("lead");

  const setParams = (patch: Record<string, string | null>, mode: "push" | "replace" = "replace") => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    window.history[mode === "push" ? "pushState" : "replaceState"](null, "", qs ? `${pathname}?${qs}` : pathname);
  };
  const openLead = (id: string) => setParams({ lead: id }, "push");

  // Filtering ------------------------------------------------------------------------------------------
  const courseKey = (lead: Lead) => (courseById.has(lead.courseId) ? lead.courseId : DELETED_COURSE);
  const inRange = (lead: Lead) => range === "all" || now - new Date(lead.createdAt).getTime() <= Number(range) * DAY;

  /** Date range + course: the KPI scope. */
  const scoped = useMemo(
    () => leads.filter((lead) => inRange(lead) && (!courseFilter.length || courseFilter.includes(courseKey(lead)))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, range, courseFilter, courseById, now],
  );
  /** + search + source: the status tab counts. */
  const narrowed = useMemo(() => {
    const q = normalize(query.trim());
    const qDigits = query.replace(/\D/g, "");
    return scoped.filter((lead) => {
      if (sources.length && !sources.includes(lead.source)) return false;
      if (!q) return true;
      if (normalize(`${lead.name} ${lead.email ?? ""}`).includes(q)) return true;
      return qDigits.length >= 3 && lead.phone.replace(/\D/g, "").includes(qDigits);
    });
  }, [scoped, query, sources]);
  const visible = useMemo(
    () => (status === "all" ? narrowed : narrowed.filter((lead) => lead.status === status)),
    [narrowed, status],
  );

  const countStatus = (list: Lead[], value: LeadStatus) => list.filter((lead) => lead.status === value).length;
  const isFiltered = Boolean(query || sources.length || courseFilter.length || range !== "all" || status !== "all");
  const allSources = useMemo(
    () => [...new Set(leads.map((lead) => lead.source))].sort((a, b) => a.localeCompare(b, "vi")),
    [leads],
  );
  const activeLead = activeId ? leads.find((lead) => lead.id === activeId) : undefined;

  // Actions --------------------------------------------------------------------------------------------
  const askDelete = async (rows: Lead[]) => {
    const ok = await confirm({
      title: rows.length === 1 ? `Xóa đăng ký của "${rows[0].name}"?` : `Xóa ${rows.length} đăng ký?`,
      description:
        "Thông tin liên hệ và ghi chú sẽ bị xóa vĩnh viễn. Nên dùng trạng thái “Đã đóng” nếu chỉ muốn lưu trữ.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) {
      if (rows.some((row) => row.id === activeId)) setParams({ lead: null });
      await remove.mutateAsync(rows.map((row) => row.id));
    }
    return ok;
  };

  const exportCsv = (rows: Lead[]) => {
    if (!rows.length) {
      toast.info("Không có đăng ký nào để xuất.");
      return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`dang-ky-tu-van-${stamp}.csv`, [
      ["Mã", "Họ và tên", "Số điện thoại", "Email", "Khóa học", "Trạng thái", "Nguồn", "Ghi chú", "Thời gian đăng ký"],
      ...rows.map((lead) => [
        lead.id,
        lead.name,
        lead.phone,
        lead.email,
        courseById.get(lead.courseId)?.title ?? "Khóa học đã xóa",
        LEAD_STATUS_LABEL[lead.status],
        lead.source,
        lead.note,
        formatDateTime(lead.createdAt),
      ]),
    ]);
    toast.success(`Đã xuất ${rows.length} đăng ký ra CSV.`);
  };

  const copyPhone = (lead: Lead) =>
    navigator.clipboard
      ?.writeText(lead.phone)
      .then(() => toast.success("Đã sao chép số điện thoại."))
      .catch(() => toast.error("Không sao chép được."));

  // Columns --------------------------------------------------------------------------------------------
  const columns: ColumnDef<Lead, unknown>[] = [
    {
      accessorKey: "name",
      meta: { label: "Người đăng ký" },
      header: ({ column }) => <SortHeader column={column} title="Người đăng ký" />,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex min-w-52 items-center gap-3">
            <span
              className={cn(
                "relative flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                lead.status === "new" ? "bg-primary/12 text-primary" : "text-muted-foreground bg-muted",
              )}
            >
              {initials(lead.name)}
              {lead.status === "new" ? (
                <span className="bg-primary absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card" />
              ) : null}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "flex items-center gap-1.5 truncate",
                  lead.status === "new" ? "font-semibold" : "font-medium",
                )}
              >
                <span className="truncate">{lead.name}</span>
                {lead.note ? (
                  <MessageSquareText className="text-muted-foreground size-3.5 shrink-0" aria-label="Có ghi chú" />
                ) : null}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                <span className="tabular-nums">{formatPhone(lead.phone)}</span>
                {lead.email ? ` · ${lead.email}` : ""}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "course",
      accessorFn: (lead) => courseById.get(lead.courseId)?.title ?? "",
      meta: { label: "Khóa học" },
      header: ({ column }) => <SortHeader column={column} title="Khóa học" />,
      cell: ({ row }) => {
        const course = courseById.get(row.original.courseId);
        return course ? (
          <div className="min-w-32">
            <p className="truncate text-sm">{course.title}</p>
            <p className="text-muted-foreground text-xs">{categoryLabel(course.categoryId)}</p>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm italic">Khóa học đã xóa</span>
        );
      },
    },
    {
      accessorKey: "source",
      meta: { label: "Nguồn" },
      header: ({ column }) => <SortHeader column={column} title="Nguồn" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground block max-w-44 truncate text-xs">{row.original.source}</span>
      ),
    },
    {
      accessorKey: "status",
      meta: { label: "Trạng thái" },
      header: ({ column }) => <SortHeader column={column} title="Trạng thái" />,
      sortingFn: (a, b) => LEAD_FLOW.indexOf(a.original.status) - LEAD_FLOW.indexOf(b.original.status),
      cell: ({ row }) => (
        <LeadStatusMenu lead={row.original} onChange={(next) => setLeadStatus([row.original], next)} />
      ),
    },
    {
      accessorKey: "createdAt",
      meta: { label: "Thời gian" },
      header: ({ column }) => <SortHeader column={column} title="Thời gian" />,
      cell: ({ row }) => (
        <div className="whitespace-nowrap" title={formatDateTime(row.original.createdAt)}>
          <p className="text-sm">{formatRelative(row.original.createdAt)}</p>
          <p className="text-muted-foreground text-xs tabular-nums">{formatDateTime(row.original.createdAt)}</p>
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <RowActions
            actions={[
              { label: "Xem chi tiết", icon: <Eye />, onSelect: () => openLead(lead.id) },
              { label: "Gọi điện", icon: <Phone />, onSelect: () => (window.location.href = `tel:${lead.phone}`) },
              ...(lead.email
                ? [
                    {
                      label: "Gửi email",
                      icon: <Mail />,
                      onSelect: () => (window.location.href = `mailto:${lead.email}`),
                    },
                  ]
                : []),
              { label: "Sao chép số điện thoại", icon: <Copy />, onSelect: () => copyPhone(lead) },
              {
                label: "Xóa",
                icon: <Trash2 />,
                destructive: true,
                separatorBefore: true,
                onSelect: () => askDelete([lead]),
              },
            ]}
          />
        );
      },
    },
  ];

  // Facets ---------------------------------------------------------------------------------------------
  const rangeScoped = leads.filter(inRange);
  const courseOptions = [
    ...courses.map((course) => ({
      label: course.title,
      value: course.id,
      count: rangeScoped.filter((lead) => lead.courseId === course.id).length,
    })),
    ...(rangeScoped.some((lead) => !courseById.has(lead.courseId))
      ? [
          {
            label: "Khóa học đã xóa",
            value: DELETED_COURSE,
            count: rangeScoped.filter((lead) => !courseById.has(lead.courseId)).length,
          },
        ]
      : []),
  ];
  const sourceOptions = allSources.map((source) => ({
    label: source,
    value: source,
    count: scoped.filter((lead) => lead.source === source).length,
  }));
  const rangeLabel = RANGES.find((item) => item.value === range)!.long;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Đăng ký tư vấn"
        description="Thông tin học viên gửi qua form “Đăng ký tư vấn” trên trang Academy."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Đăng ký tư vấn" }]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCsv(visible)} disabled={isLoading}>
              <Download /> Xuất CSV
            </Button>
            <LeadCreateDialog
              courses={courses}
              leads={leads}
              defaultCourseId={courseFilter.length === 1 ? courseFilter[0] : undefined}
              onCreated={(lead) => openLead(lead.id)}
            />
          </>
        }
      />

      <KpiStrip
        leads={scoped}
        isLoading={isLoading}
        rangeLabel={rangeLabel}
        status={status}
        onStatus={(value) => setParams({ status: value === "all" ? null : value })}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b">
          <nav aria-label="Lọc theo trạng thái" className="-mb-px flex max-w-full gap-1 overflow-x-auto">
            {(["all", ...LEAD_FLOW] as const).map((value) => {
              const active = status === value;
              const count = value === "all" ? narrowed.length : countStatus(narrowed, value);
              return (
                <button
                  key={value}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setParams({ status: value === "all" ? null : value })}
                  className={cn(
                    "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                    active
                      ? "border-primary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground border-transparent",
                  )}
                >
                  {value === "all" ? null : <span className={cn("size-1.5 rounded-full", LEAD_DOT[value])} />}
                  {value === "all" ? "Tất cả" : LEAD_STATUS_LABEL[value]}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs tabular-nums",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(value) => value && setRange(value as Range)}
            variant="outline"
            size="sm"
            className="mb-2"
            aria-label="Khoảng thời gian"
          >
            {RANGES.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} className="px-2.5 text-xs">
                {item.value === "all" ? <CalendarRange className="size-3.5" /> : null}
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, số điện thoại, email…"
              className="h-8 pl-8"
              aria-label="Tìm đăng ký"
            />
          </div>
          <FacetPopover
            title="Khóa học"
            options={courseOptions}
            selected={courseFilter}
            onChange={(values) => setParams({ course: values.length ? values.join(",") : null })}
          />
          <FacetPopover title="Nguồn" options={sourceOptions} selected={sources} onChange={setSources} />
          {isFiltered ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setSources([]);
                setRange("all");
                setParams({ status: null, course: null });
              }}
            >
              Xóa lọc <X />
            </Button>
          ) : null}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={isLoading ? undefined : visible}
        isLoading={isLoading}
        initialSorting={[{ id: "createdAt", desc: true }]}
        pageSize={20}
        getRowHref={(lead) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("lead", lead.id);
          return `${pathname}?${params.toString()}`;
        }}
        toolbar={
          <span className="text-muted-foreground text-xs tabular-nums">
            {visible.length} đăng ký{range !== "all" ? ` · ${rangeLabel}` : ""}
          </span>
        }
        bulkActions={(rows, clear) => (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Chuyển trạng thái <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  {rows.length} đăng ký đã chọn
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {LEAD_FLOW.map((value) => (
                  <DropdownMenuItem
                    key={value}
                    onSelect={async () => {
                      await setLeadStatus(rows, value);
                      clear();
                    }}
                  >
                    <span className={cn("size-2 rounded-full", LEAD_DOT[value])} />
                    {LEAD_STATUS_LABEL[value]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={() => exportCsv(rows)}>
              <Download /> Xuất CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={async () => {
                if (await askDelete(rows)) clear();
              }}
            >
              <Trash2 /> Xóa
            </Button>
          </>
        )}
        emptyState={{
          title: isFiltered ? "Không có đăng ký phù hợp" : "Chưa có đăng ký tư vấn",
          description: isFiltered
            ? "Thử đổi trạng thái, khoảng thời gian hoặc bộ lọc khác."
            : "Đăng ký từ form trên trang Academy sẽ xuất hiện tại đây.",
          icon: <Inbox />,
        }}
      />

      <LeadDetailSheet
        lead={activeLead}
        courses={courses}
        onClose={() => setParams({ lead: null })}
        onStatus={(lead, next) => setLeadStatus([lead], next)}
        onDelete={(lead) => askDelete([lead])}
      />
    </div>
  );
}

function KpiStrip({
  leads,
  isLoading,
  rangeLabel,
  status,
  onStatus,
}: {
  leads: Lead[];
  isLoading?: boolean;
  rangeLabel: string;
  status: LeadStatus | "all";
  onStatus: (status: LeadStatus | "all") => void;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-xl" />
        ))}
      </div>
    );
  }
  const total = leads.length;
  const count = (value: LeadStatus) => leads.filter((lead) => lead.status === value).length;
  const enrolled = count("enrolled");
  const rate = total ? (enrolled / total) * 100 : 0;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        label="Tổng đăng ký"
        value={total}
        hint={rangeLabel}
        active={status === "all"}
        onClick={() => onStatus("all")}
      />
      <KpiCard
        label="Mới"
        value={count("new")}
        hint={count("new") ? "Cần liên hệ" : "Đã xử lý hết"}
        dot={LEAD_DOT.new}
        emphasis={count("new") > 0}
        active={status === "new"}
        onClick={() => onStatus("new")}
      />
      <KpiCard
        label="Đã liên hệ"
        value={count("contacted")}
        hint="Đang tư vấn"
        dot={LEAD_DOT.contacted}
        active={status === "contacted"}
        onClick={() => onStatus("contacted")}
      />
      <KpiCard
        label="Đã ghi danh"
        value={enrolled}
        hint={`${count("closed")} đã đóng`}
        dot={LEAD_DOT.enrolled}
        active={status === "enrolled"}
        onClick={() => onStatus("enrolled")}
      />
      <div className="col-span-2 rounded-xl border bg-card p-4 md:col-span-1">
        <p className="text-muted-foreground text-xs font-medium">Tỉ lệ chuyển đổi</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {rate.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="bg-success h-full rounded-full" style={{ width: `${Math.min(rate, 100)}%` }} />
        </div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          {enrolled}/{total} đăng ký đã ghi danh
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  dot,
  emphasis,
  active,
  onClick,
}: {
  label: string;
  value: number;
  hint?: ReactNode;
  dot?: string;
  emphasis?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "hover:border-primary/40 focus-visible:ring-ring/50 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-muted/30 focus-visible:ring-3 focus-visible:outline-none",
        active && "border-primary/60 ring-primary/25 ring-1",
        emphasis && "bg-primary/[0.04]",
      )}
    >
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        {dot ? <span className={cn("size-1.5 rounded-full", dot)} /> : null}
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", emphasis && "text-primary")}>
        {value.toLocaleString("vi-VN")}
      </p>
      {hint ? <p className="text-muted-foreground mt-1 truncate text-xs">{hint}</p> : null}
    </button>
  );
}

function InboxSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[104px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
