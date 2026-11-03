"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FolderKanban,
  Images,
  LayoutGrid,
  List,
  Pencil,
  Play,
  Plus,
  Search,
  Tags,
  Trash2,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { DataTable, RowActions, SortHeader, type RowAction } from "@/admin/components/cms/data-table";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { ReorderButton } from "@/admin/components/cms/reorder-button";
import { PublishBadge, StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { Checkbox } from "@/admin/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Separator } from "@/admin/components/ui/separator";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import { useCollection } from "@/admin/lib/cms/hooks";
import type { Project, ProjectCategory } from "@/admin/lib/cms/types/projects";
import { formatRelative } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

import { categoryLabels, projectPublicHref } from "./project-utils";
import { FacetFilter } from "./project-visuals";
import { useProjectActions } from "./use-project-actions";

type View = "grid" | "table";
const VIEW_STORAGE_KEY = "hooked-admin-projects-view";

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

function readView(): View {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
}

/** /admin/projects — portfolio projects as poster cards (like the website overview) or a table. */
export function ProjectsList() {
  const { data, isLoading } = useCollection("projects");
  const { data: categories } = useCollection("projectCategories");
  const actions = useProjectActions();

  const [view, setView] = useState<View>(readView);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const changeView = (next: View) => {
    setView(next);
    setSelected(new Set());
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): the choice simply isn't remembered.
    }
  };

  const projects = useMemo(() => data ?? [], [data]);
  const isFiltered = Boolean(query.trim()) || categoryFilter.length > 0 || statusFilter.length > 0;
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return projects.filter((project) => {
      if (categoryFilter.length && !project.categoryIds.some((id) => categoryFilter.includes(id))) return false;
      if (statusFilter.length && !statusFilter.includes(project.status)) return false;
      if (!q) return true;
      const haystack = normalize([project.name, project.slug, ...project.partners].join(" "));
      return haystack.includes(q);
    });
  }, [projects, query, categoryFilter, statusFilter]);

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter([]);
    setStatusFilter([]);
  };

  const totals = useMemo(
    () => ({
      published: projects.filter((project) => project.status === "published").length,
      photos: projects.reduce((sum, project) => sum + project.photos.length, 0),
      videos: projects.reduce((sum, project) => sum + project.videos.length, 0),
    }),
    [projects],
  );

  const selectedRows = filtered.filter((project) => selected.has(project.id));
  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rowActions = (project: Project): RowAction[] => [
    { label: "Chỉnh sửa", icon: <Pencil />, href: `/admin/projects/${project.id}` },
    { label: "Xem trên website", icon: <ExternalLink />, href: projectPublicHref(project.slug), external: true },
    project.status === "published"
      ? { label: "Chuyển về bản nháp", icon: <EyeOff />, onSelect: () => actions.setStatus([project], "draft") }
      : { label: "Xuất bản", icon: <Eye />, onSelect: () => actions.setStatus([project], "published") },
    { label: "Nhân bản", icon: <Copy />, onSelect: () => actions.duplicate(project) },
    {
      label: "Xóa",
      icon: <Trash2 />,
      destructive: true,
      separatorBefore: true,
      onSelect: () => actions.askDelete([project]),
    },
  ];

  const bulkButtons = (rows: Project[], clear: () => void) => (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={actions.isBusy}
        onClick={() => actions.setStatus(rows, "published").then(clear)}
      >
        <Eye /> Xuất bản
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={actions.isBusy}
        onClick={() => actions.setStatus(rows, "draft").then(clear)}
      >
        <EyeOff /> Chuyển về nháp
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive"
        disabled={actions.isBusy}
        onClick={async () => {
          if (await actions.askDelete(rows)) clear();
        }}
      >
        <Trash2 /> Xóa
      </Button>
    </>
  );

  const positions = new Map(projects.map((project, index) => [project.id, index + 1]));
  const columns = projectColumns(categories, positions, rowActions);

  const createButton = (
    <Button asChild size="sm">
      <Link href="/admin/projects/new">
        <Plus /> Thêm dự án
      </Link>
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dự án"
        description="Các dự án hiển thị trên trang Projects."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Dự án" }]}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/project-categories">
                <Tags /> Danh mục
              </Link>
            </Button>
            <ReorderButton
              collection="projects"
              items={data}
              renderItem={(project) => (
                <>
                  <Thumb image={project.cover} className="aspect-video w-16 shrink-0 rounded" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{project.name}</span>
                  {project.status === "draft" ? <StatusPill tone="muted">Nháp</StatusPill> : null}
                </>
              )}
            />
            {createButton}
          </>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tên, slug, dịch vụ, đối tác…"
              className="h-8 pl-8"
              aria-label="Tìm dự án"
            />
          </div>
          <FacetFilter
            title="Danh mục"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={(categories ?? []).map((category) => ({
              value: category.id,
              label: category.label,
              count: projects.filter((project) => project.categoryIds.includes(category.id)).length,
            }))}
          />
          <FacetFilter
            title="Trạng thái"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "published", label: "Đã xuất bản", count: totals.published },
              { value: "draft", label: "Bản nháp", count: projects.length - totals.published },
            ]}
          />
          {isFiltered ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Xóa lọc <X />
            </Button>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {projects.length ? (
              <p className="text-muted-foreground hidden text-xs md:block">
                {totals.published}/{projects.length} đã xuất bản · {totals.photos} ảnh · {totals.videos} video
              </p>
            ) : null}
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={view}
              onValueChange={(value) => value && changeView(value as View)}
              aria-label="Kiểu hiển thị"
            >
              <ToggleGroupItem value="grid" aria-label="Dạng lưới">
                <LayoutGrid /> <span className="hidden sm:inline">Lưới</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Dạng bảng">
                <List /> <span className="hidden sm:inline">Bảng</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {!isLoading && !projects.length ? (
          <ListEmpty
            icon={<FolderKanban />}
            title="Chưa có dự án"
            description="Thêm dự án đầu tiên để hiển thị trên trang Projects."
            action={createButton}
          />
        ) : !isLoading && !filtered.length ? (
          <ListEmpty
            icon={<Search />}
            title="Không có dự án phù hợp"
            description="Thử từ khóa hoặc bộ lọc khác."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            }
          />
        ) : view === "table" ? (
          <DataTable
            columns={columns}
            data={isLoading ? undefined : filtered}
            isLoading={isLoading}
            initialSorting={[{ id: "order", desc: false }]}
            getRowHref={(row) => `/admin/projects/${row.id}`}
            bulkActions={bulkButtons}
            pageSize={20}
          />
        ) : (
          <>
            {selectedRows.length ? (
              <div className="bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <span className="font-medium">Đã chọn {selectedRows.length}</span>
                <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
                {bulkButtons(selectedRows, () => setSelected(new Set()))}
                <div className="ml-auto flex gap-1">
                  {selectedRows.length < filtered.length ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(new Set(filtered.map((project) => project.id)))}
                    >
                      Chọn tất cả
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      <Skeleton className="aspect-video rounded-xl" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : filtered.map((project) => (
                    <ProjectGridCard
                      key={project.id}
                      project={project}
                      position={positions.get(project.id) ?? 0}
                      tags={categoryLabels(project.categoryIds, categories)}
                      selected={selected.has(project.id)}
                      selecting={selected.size > 0}
                      onToggleSelect={() => toggleSelected(project.id)}
                      actions={rowActions(project)}
                    />
                  ))}
            </div>
            {!isLoading ? (
              <p className="text-muted-foreground px-1 text-xs">
                {isFiltered ? `${filtered.length} trên ${projects.length} dự án` : `${projects.length} dự án`} · theo
                thứ tự trên website
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function ListEmpty({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Empty className="rounded-xl border border-dashed py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

/** Poster card echoing the website overview card, with admin metadata and selection. */
function ProjectGridCard({
  project,
  position,
  tags,
  selected,
  selecting,
  onToggleSelect,
  actions,
}: {
  project: Project;
  position: number;
  tags: string[];
  selected: boolean;
  selecting: boolean;
  onToggleSelect: () => void;
  actions: RowAction[];
}) {
  const href = `/admin/projects/${project.id}`;
  return (
    <article className="group relative isolate flex min-w-0 flex-col gap-3">
      <div
        className={cn(
          "ring-offset-background relative aspect-video overflow-hidden rounded-xl bg-[#050101] ring-offset-2 transition-shadow",
          selected ? "ring-primary ring-2" : "group-hover:ring-primary/60 group-hover:ring-2",
        )}
      >
        <Thumb
          image={project.cover}
          checker={false}
          className={cn(
            "size-full transition-transform duration-300 group-hover:scale-[1.03]",
            project.status === "draft" && "opacity-70",
          )}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
        {project.featuredVideoId ? (
          <span className="group-hover:bg-primary group-hover:text-primary-foreground pointer-events-none absolute top-1/2 left-1/2 flex size-11 -translate-1/2 items-center justify-center rounded-full bg-[#fff4e9]/95 text-[#050101] shadow-lg transition-colors">
            <Play className="size-4 fill-current" />
          </span>
        ) : null}
        <label
          className={cn(
            "bg-background/90 absolute top-2.5 left-2.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md shadow-sm transition-opacity",
            selecting || selected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100",
          )}
        >
          <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label={`Chọn ${project.name}`} />
        </label>
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          {project.status === "draft" ? (
            <StatusPill tone="muted" className="bg-background/90 shadow-sm">
              Bản nháp
            </StatusPill>
          ) : null}
          <div className="bg-background/90 rounded-md shadow-sm">
            <RowActions actions={actions} label={`Thao tác cho ${project.name}`} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="flex items-start gap-2 text-base leading-6 font-extrabold tracking-tight">
          <Link
            href={href}
            className="group-hover:text-primary focus-visible:after:ring-ring min-w-0 flex-1 outline-none after:absolute after:inset-0 after:z-0 after:rounded-xl focus-visible:after:ring-2"
          >
            {project.name}
          </Link>
          <span className="text-muted-foreground shrink-0 pt-0.5 text-xs font-medium tabular-nums">#{position}</span>
        </h3>
        <p className="text-muted-foreground truncate text-xs">{tags.length ? tags.join(" · ") : "Chưa có danh mục"}</p>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Images className="size-3.5" /> {project.photos.length} ảnh
          </span>
          <span className="inline-flex items-center gap-1">
            <Video className="size-3.5" /> {project.videos.length} video
          </span>
          <span className="ml-auto">Cập nhật {formatRelative(project.updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}

function projectColumns(
  categories: ProjectCategory[] | undefined,
  positions: Map<string, number>,
  rowActions: (project: Project) => RowAction[],
): ColumnDef<Project, unknown>[] {
  return [
    {
      accessorKey: "name",
      meta: { label: "Dự án" },
      header: ({ column }) => <SortHeader column={column} title="Dự án" />,
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-3">
          <Thumb image={row.original.cover} className="aspect-video w-20 shrink-0 rounded-md border" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="text-muted-foreground truncate text-xs">/projects/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "categories",
      accessorFn: (row) => row.categoryIds,
      meta: { label: "Danh mục" },
      header: "Danh mục",
      enableSorting: false,
      cell: ({ row }) => {
        const labels = categoryLabels(row.original.categoryIds, categories);
        return (
          <div className="flex items-center gap-1">
            {labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="max-w-36 truncate rounded-full border px-2 py-0.5 text-[11px] whitespace-nowrap"
              >
                {label}
              </span>
            ))}
            {labels.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground rounded-full bg-muted px-2 py-0.5 text-[11px]">
                    +{labels.length - 2}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{labels.slice(2).join(", ")}</TooltipContent>
              </Tooltip>
            ) : null}
            {!labels.length ? <span className="text-muted-foreground text-xs">—</span> : null}
          </div>
        );
      },
    },
    {
      id: "media",
      accessorFn: (row) => row.photos.length + row.videos.length,
      meta: { label: "Media" },
      header: ({ column }) => <SortHeader column={column} title="Media" />,
      cell: ({ row }) => (
        <div className="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Images className="size-3.5" /> {row.original.photos.length}
          </span>
          <span className="inline-flex items-center gap-1">
            <Video className="size-3.5" /> {row.original.videos.length}
          </span>
          {row.original.featuredVideoId ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Play className="fill-primary text-primary size-3.5" aria-label="Có video nổi bật" />
              </TooltipTrigger>
              <TooltipContent>Có video nổi bật trên thẻ dự án</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      ),
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
      cell: ({ row }) => <span className="text-muted-foreground tabular-nums">#{positions.get(row.original.id)}</span>,
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
      cell: ({ row }) => <RowActions actions={rowActions(row.original)} />,
    },
  ];
}
