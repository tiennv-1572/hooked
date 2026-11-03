"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Grid2x2,
  List,
  Pencil,
  Plus,
  Search,
  Star,
  StarOff,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader } from "@/admin/components/cms/data-table";
import { PageHeader } from "@/admin/components/cms/page-header";
import { ReorderButton } from "@/admin/components/cms/reorder-button";
import { PublishBadge, StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { Checkbox } from "@/admin/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Separator } from "@/admin/components/ui/separator";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { Textarea } from "@/admin/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import { useCollection, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Student } from "@/admin/lib/cms/types/academy";
import { formatRelative } from "@/admin/lib/format";
import { htmlToText } from "@/lib/html-text";
import { cn } from "@/lib/utils";

import { FacetPopover, publishFilterOptions } from "./shared";
import { StudentPortrait } from "./student-portrait";

const storyHref = (slug: string) => `/academy/students?story=${encodeURIComponent(slug)}`;
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

/** Student stories: portrait grid (or table), filters, featured toggle, carousel/grid order. */
export function StudentsList() {
  const { data, isLoading } = useCollection("students");
  const remove = useDeleteItems("students");
  const update = useUpdateItem("students", { silent: true });
  const confirm = useConfirm();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [featured, setFeatured] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [featuring, setFeaturing] = useState<Student | null>(null);

  const students = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return students.filter((student) => {
      if (roles.length && !roles.includes(student.role)) return false;
      if (featured.length && !featured.includes(student.featured ? "featured" : "regular")) return false;
      if (statuses.length && !statuses.includes(student.status)) return false;
      return !q || normalize(`${student.name} ${student.slug} ${student.affiliation}`).includes(q);
    });
  }, [students, query, roles, featured, statuses]);
  const featuredList = students.filter((student) => student.featured);
  const isFiltered = Boolean(query || roles.length || featured.length || statuses.length);
  const selectedRows = students.filter((student) => selected.has(student.id));

  const countBy = (predicate: (student: Student) => boolean) => students.filter(predicate).length;

  const askDelete = async (rows: Student[]) => {
    const ok = await confirm({
      title: rows.length === 1 ? `Xóa học viên "${rows[0].name}"?` : `Xóa ${rows.length} học viên?`,
      description:
        "Câu chuyện sẽ biến mất khỏi trang Học viên tiêu biểu (và carousel Academy nếu đang được chọn). Không thể hoàn tác.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) {
      await remove.mutateAsync(rows.map((row) => row.id));
      setSelected(new Set());
    }
    return ok;
  };

  const setStatus = async (rows: Student[], status: Student["status"]) => {
    // Sequential: the storage adapter rewrites the whole collection per update, so parallel writes would race.
    for (const row of rows.filter((item) => item.status !== status)) {
      await update.mutateAsync({ id: row.id, patch: { status } });
    }
    toast.success(
      status === "published"
        ? `Đã xuất bản ${rows.length} học viên.`
        : `Đã chuyển ${rows.length} học viên về bản nháp.`,
    );
  };

  const toggleFeatured = async (student: Student) => {
    if (!student.featured && !student.headline?.trim()) {
      setFeaturing(student);
      return;
    }
    await update.mutateAsync({ id: student.id, patch: { featured: !student.featured } });
    toast.success(
      student.featured
        ? `Đã bỏ ${student.name} khỏi carousel Academy.`
        : `Đã đưa ${student.name} vào carousel Academy.`,
    );
  };

  const actionsFor = (student: Student) => [
    { label: "Chỉnh sửa", icon: <Pencil />, href: `/admin/students/${student.id}` },
    {
      label: student.featured ? "Bỏ khỏi carousel" : "Đưa vào carousel",
      icon: student.featured ? <StarOff /> : <Star />,
      onSelect: () => toggleFeatured(student),
    },
    {
      label: student.status === "published" ? "Chuyển về bản nháp" : "Xuất bản",
      icon: student.status === "published" ? <EyeOff /> : <Eye />,
      onSelect: () => setStatus([student], student.status === "published" ? "draft" : "published"),
    },
    { label: "Xem trên website", icon: <ExternalLink />, href: storyHref(student.slug), external: true },
    { label: "Xóa", icon: <Trash2 />, destructive: true, separatorBefore: true, onSelect: () => askDelete([student]) },
  ];

  const columns: ColumnDef<Student, unknown>[] = [
    {
      accessorKey: "name",
      meta: { label: "Học viên" },
      header: ({ column }) => <SortHeader column={column} title="Học viên" />,
      cell: ({ row }) => (
        <div className="flex min-w-48 items-center gap-3">
          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
            <StudentPortrait portrait={row.original.portrait} crop={row.original.crop} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">{row.original.affiliation}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      meta: { label: "Vai trò" },
      header: ({ column }) => <SortHeader column={column} title="Vai trò" />,
      cell: ({ row }) => <StatusPill tone="info">{row.original.role}</StatusPill>,
    },
    {
      accessorKey: "featured",
      meta: { label: "Tiêu biểu" },
      header: "Tiêu biểu",
      enableSorting: false,
      cell: ({ row }) => <FeatureStar student={row.original} onToggle={() => toggleFeatured(row.original)} />,
    },
    {
      accessorKey: "status",
      meta: { label: "Trạng thái" },
      header: ({ column }) => <SortHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => <PublishBadge status={row.original.status} />,
    },
    {
      accessorKey: "order",
      meta: { label: "Thứ tự" },
      header: ({ column }) => <SortHeader column={column} title="Thứ tự" />,
      cell: ({ row }) => <span className="text-muted-foreground tabular-nums">#{row.original.order + 1}</span>,
    },
    {
      accessorKey: "updatedAt",
      meta: { label: "Cập nhật" },
      header: ({ column }) => <SortHeader column={column} title="Cập nhật" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">{formatRelative(row.original.updatedAt)}</span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      cell: ({ row }) => <RowActions actions={actionsFor(row.original)} />,
    },
  ];

  const bulkButtons = (rows: Student[], clear: () => void) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await setStatus(rows, "published");
          clear();
        }}
      >
        <Eye /> Xuất bản
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await setStatus(rows, "draft");
          clear();
        }}
      >
        <EyeOff /> Chuyển về nháp
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
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Học viên"
        description="Câu chuyện học viên trên trang Học viên tiêu biểu; học viên được gắn sao xuất hiện ở carousel trang Academy."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Học viên" }]}
        actions={
          <>
            <ReorderButton
              collection="students"
              items={data}
              description="Kéo thả để đổi thứ tự lưới câu chuyện và carousel học viên tiêu biểu."
              renderItem={(student) => (
                <>
                  <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded border bg-muted">
                    <StudentPortrait portrait={student.portrait} crop={student.crop} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{student.name}</span>
                  <span className="text-muted-foreground text-xs">{student.role}</span>
                  {student.featured ? <Star className="fill-primary text-primary size-3.5" /> : null}
                </>
              )}
            />
            <Button asChild size="sm">
              <Link href="/admin/students/new">
                <Plus /> Thêm học viên
              </Link>
            </Button>
          </>
        }
      />

      <FeaturedStrip students={featuredList} isLoading={isLoading} onFilter={() => setFeatured(["featured"])} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm học viên…"
            className="h-8 pl-8"
            aria-label="Tìm học viên"
          />
        </div>
        <FacetPopover
          title="Vai trò"
          selected={roles}
          onChange={setRoles}
          options={[...new Set(students.map((student) => student.role))].map((role) => ({
            label: role,
            value: role,
            count: countBy((student) => student.role === role),
          }))}
        />
        <FacetPopover
          title="Tiêu biểu"
          selected={featured}
          onChange={setFeatured}
          options={[
            { label: "Trong carousel", value: "featured", count: countBy((student) => student.featured) },
            { label: "Không", value: "regular", count: countBy((student) => !student.featured) },
          ]}
        />
        <FacetPopover
          title="Trạng thái"
          selected={statuses}
          onChange={setStatuses}
          options={publishFilterOptions.map((option) => ({
            ...option,
            count: countBy((student) => student.status === option.value),
          }))}
        />
        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setRoles([]);
              setFeatured([]);
              setStatuses([]);
            }}
          >
            Xóa lọc <X />
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground text-xs tabular-nums">
            {visible.length}/{students.length} học viên
          </span>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as "grid" | "table")}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="grid" aria-label="Dạng lưới">
              <Grid2x2 />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Dạng bảng">
              <List />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={isLoading ? undefined : visible}
          isLoading={isLoading}
          initialSorting={[{ id: "order", desc: false }]}
          getRowHref={(row) => `/admin/students/${row.id}`}
          bulkActions={bulkButtons}
          pageSize={20}
          emptyState={{
            title: isFiltered ? "Không có học viên phù hợp" : "Chưa có học viên",
            description: isFiltered ? "Thử từ khóa hoặc bộ lọc khác." : "Thêm câu chuyện học viên đầu tiên.",
            icon: <Users />,
          }}
        />
      ) : (
        <>
          {selectedRows.length ? (
            <div className="bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="font-medium">Đã chọn {selectedRows.length}</span>
              <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
              {bulkButtons(selectedRows, () => setSelected(new Set()))}
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
                Bỏ chọn
              </Button>
            </div>
          ) : null}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[381/520] rounded-xl" />
              ))}
            </div>
          ) : visible.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {visible.map((student) => (
                <StudentGridCard
                  key={student.id}
                  student={student}
                  index={students.indexOf(student)}
                  selected={selected.has(student.id)}
                  selecting={selected.size > 0}
                  onSelect={(value) =>
                    setSelected((current) => {
                      const next = new Set(current);
                      if (value) next.add(student.id);
                      else next.delete(student.id);
                      return next;
                    })
                  }
                  onToggleFeatured={() => toggleFeatured(student)}
                  actions={actionsFor(student)}
                />
              ))}
            </div>
          ) : (
            <Empty className="rounded-xl border border-dashed py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>{isFiltered ? "Không có học viên phù hợp" : "Chưa có học viên"}</EmptyTitle>
                <EmptyDescription>
                  {isFiltered ? "Thử từ khóa hoặc bộ lọc khác." : "Thêm câu chuyện học viên đầu tiên."}
                </EmptyDescription>
              </EmptyHeader>
              {isFiltered ? null : (
                <EmptyContent>
                  <Button asChild size="sm">
                    <Link href="/admin/students/new">
                      <Plus /> Thêm học viên
                    </Link>
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          )}
        </>
      )}

      <FeatureDialog
        student={featuring}
        onOpenChange={(open) => !open && setFeaturing(null)}
        onConfirm={async (headline) => {
          if (!featuring) return;
          await update.mutateAsync({ id: featuring.id, patch: { featured: true, headline } });
          toast.success(`Đã đưa ${featuring.name} vào carousel Academy.`);
          setFeaturing(null);
        }}
      />
    </div>
  );
}

/** Who is in the Academy page story carousel right now. */
function FeaturedStrip({
  students,
  isLoading,
  onFilter,
}: {
  students: Student[];
  isLoading?: boolean;
  onFilter: () => void;
}) {
  if (isLoading) return <Skeleton className="h-16 rounded-xl" />;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card px-4 py-3">
      <div className="flex -space-x-2">
        {students.slice(0, 5).map((student) => (
          <div key={student.id} className="relative size-9 overflow-hidden rounded-full border-2 border-card bg-muted">
            <StudentPortrait portrait={student.portrait} crop={student.crop} />
          </div>
        ))}
        {!students.length ? (
          <span className="text-muted-foreground flex size-9 items-center justify-center rounded-full border border-dashed">
            <Star className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="min-w-48 flex-1">
        <p className="text-sm font-medium">
          {students.length
            ? `${students.length} học viên trong carousel “Học viên tiêu biểu” trang Academy`
            : "Chưa có học viên tiêu biểu"}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {students.length
            ? students.map((student) => student.name).join(" · ")
            : "Bấm ngôi sao trên thẻ học viên để đưa vào carousel trang Academy (nên chọn 3–5 người)."}
        </p>
      </div>
      {students.length ? (
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Star /> Chỉ xem tiêu biểu
        </Button>
      ) : null}
    </div>
  );
}

function FeatureStar({ student, onToggle, className }: { student: Student; onToggle: () => void; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={student.featured}
          aria-label={student.featured ? `Bỏ ${student.name} khỏi carousel` : `Đưa ${student.name} vào carousel`}
          onClick={onToggle}
          className={cn(student.featured ? "text-primary hover:text-primary" : "text-muted-foreground", className)}
        >
          <Star className={cn(student.featured && "fill-current")} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {student.featured ? "Đang ở carousel Academy — bấm để bỏ" : "Đưa vào carousel Academy"}
      </TooltipContent>
    </Tooltip>
  );
}

function StudentGridCard({
  student,
  index,
  selected,
  selecting,
  onSelect,
  onToggleFeatured,
  actions,
}: {
  student: Student;
  index: number;
  selected: boolean;
  selecting: boolean;
  onSelect: (value: boolean) => void;
  onToggleFeatured: () => void;
  actions: Parameters<typeof RowActions>[0]["actions"];
}) {
  return (
    <div
      className={cn(
        "group ring-foreground/10 relative aspect-[381.333/520] overflow-hidden rounded-xl bg-[#1a1a1a] text-white shadow-xs ring-1 transition-shadow hover:shadow-lg",
        selected && "ring-primary ring-2",
      )}
    >
      <StudentPortrait
        portrait={student.portrait}
        crop={student.crop}
        className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,1,0.35)_0%,rgba(5,2,1,0)_22%,rgba(5,2,1,0.08)_45%,rgba(5,2,1,0.7)_72%,#050201_100%)]" />
      <Link
        href={`/admin/students/${student.id}`}
        className="focus-visible:ring-ring/60 absolute inset-0 z-[1] focus-visible:ring-3 focus-visible:outline-none"
        aria-label={`Chỉnh sửa ${student.name}`}
      />

      <div className="absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-2.5">
        <label
          className={cn(
            "flex size-7 cursor-pointer items-center justify-center rounded-md bg-black/45 backdrop-blur-sm transition-opacity",
            selecting || selected
              ? "opacity-100"
              : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100",
          )}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(value) => onSelect(Boolean(value))}
            aria-label={`Chọn ${student.name}`}
            className="border-white/70 bg-transparent"
          />
        </label>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleFeatured}
                aria-pressed={student.featured}
                aria-label={student.featured ? `Bỏ ${student.name} khỏi carousel` : `Đưa ${student.name} vào carousel`}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
                  student.featured
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/45 text-white/85 hover:bg-black/65 hover:text-white",
                )}
              >
                <Star className={cn("size-3.5", student.featured && "fill-current")} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {student.featured ? "Đang ở carousel Academy — bấm để bỏ" : "Đưa vào carousel Academy"}
            </TooltipContent>
          </Tooltip>
          <div className="rounded-full bg-black/45 text-white backdrop-blur-sm [&_button]:size-7 [&_button]:rounded-full [&_button]:hover:bg-black/30 [&_button]:hover:text-white">
            <RowActions actions={actions} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex flex-col gap-1 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-white/70 tabular-nums">
            {String(index + 1).padStart(2, "0")} / HOOKED
          </span>
          {student.status === "draft" ? (
            <span className="rounded-full bg-white/90 px-1.5 py-px text-[10px] font-medium text-neutral-800">
              Bản nháp
            </span>
          ) : null}
        </div>
        <p className="truncate text-base leading-6 font-extrabold sm:text-lg">{student.name}</p>
        <p className="truncate text-xs text-white/70">
          {student.role} · {student.affiliation}
        </p>
      </div>
    </div>
  );
}

/** First sentence of the story (≤ 160 chars) as a headline suggestion. */
function suggestHeadline(student: Student) {
  const text = htmlToText(student.story).replace(/\n/g, " ");
  const sentence = text.split(/(?<=[.!?])\s/)[0] ?? "";
  return sentence.length > 160 ? `${sentence.slice(0, 157).trimEnd()}…` : sentence;
}

/** Asks for the carousel quote when featuring a student without one. */
function FeatureDialog({
  student,
  onOpenChange,
  onConfirm,
}: {
  student: Student | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (headline: string) => Promise<void>;
}) {
  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {student ? (
          <FeatureForm key={student.id} student={student} onCancel={() => onOpenChange(false)} onConfirm={onConfirm} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function FeatureForm({
  student,
  onCancel,
  onConfirm,
}: {
  student: Student;
  onCancel: () => void;
  onConfirm: (headline: string) => Promise<void>;
}) {
  const [headline, setHeadline] = useState(() => suggestHeadline(student));
  const [saving, setSaving] = useState(false);
  const tooLong = headline.length > 160;
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!headline.trim() || tooLong) return;
        setSaving(true);
        await onConfirm(headline.trim()).finally(() => setSaving(false));
      }}
    >
      <DialogHeader>
        <DialogTitle>Đưa {student.name} vào carousel</DialogTitle>
        <DialogDescription>
          Carousel “Học viên tiêu biểu” trên trang Academy hiển thị một câu trích dẫn ngắn cạnh ảnh chân dung.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="feature-headline">Câu trích dẫn</Label>
          <span className={cn("text-muted-foreground text-xs tabular-nums", tooLong && "text-destructive")}>
            {headline.length}/160
          </span>
        </div>
        <Textarea
          id="feature-headline"
          rows={3}
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          autoFocus
        />
        <p className="text-muted-foreground text-xs">
          Gợi ý từ câu đầu của câu chuyện — nên là một thành tích nổi bật.
        </p>
        {student.status === "draft" ? (
          <p className="text-warning text-xs">Học viên đang là bản nháp nên chưa hiển thị trên website.</p>
        ) : null}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={!headline.trim() || tooLong || saving}>
          {saving ? <Spinner /> : <Star />} Đưa vào carousel
        </Button>
      </DialogFooter>
    </form>
  );
}
