"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, ExternalLink, GraduationCap, Inbox, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader } from "@/admin/components/cms/data-table";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { ReorderButton } from "@/admin/components/cms/reorder-button";
import { PublishBadge, StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { useCollection, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Course } from "@/admin/lib/cms/types/academy";
import { formatRelative } from "@/admin/lib/format";

import { publishFilterOptions, useCourseCategories, useLeadCountsByCourse } from "./shared";

/** Courses: Academy carousel + directory. Ordered (carousel order), with per-course registration counts. */
export function CoursesList() {
  const { data, isLoading } = useCollection("courses");
  const { counts } = useLeadCountsByCourse();
  const categories = useCourseCategories();
  const categoryRank = new Map(categories.list.map((category, index) => [category.id, index]));
  const remove = useDeleteItems("courses");
  const update = useUpdateItem("courses", { silent: true });
  const confirm = useConfirm();

  const askDelete = async (rows: Course[]) => {
    const linked = rows.reduce((sum, row) => sum + (counts.get(row.id)?.total ?? 0), 0);
    const ok = await confirm({
      title: rows.length === 1 ? `Xóa khóa học "${rows[0].title}"?` : `Xóa ${rows.length} khóa học?`,
      description: (
        <>
          Khóa học sẽ biến mất khỏi carousel và danh sách trên trang Academy.
          {linked
            ? ` ${linked} đăng ký tư vấn đang gắn với ${rows.length === 1 ? "khóa này" : "các khóa này"} vẫn được giữ lại.`
            : null}{" "}
          Hành động không thể hoàn tác.
        </>
      ),
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) await remove.mutateAsync(rows.map((row) => row.id));
    return ok;
  };

  const setStatus = async (rows: Course[], status: Course["status"]) => {
    const targets = rows.filter((row) => row.status !== status);
    // Sequential: the storage adapter rewrites the whole collection per update, so parallel writes would race.
    for (const row of targets) await update.mutateAsync({ id: row.id, patch: { status } });
    toast.success(
      status === "published"
        ? `Đã xuất bản ${targets.length || rows.length} khóa học.`
        : `Đã chuyển ${targets.length || rows.length} khóa học về bản nháp.`,
    );
  };

  const columns: ColumnDef<Course, unknown>[] = [
    {
      accessorKey: "title",
      meta: { label: "Khóa học" },
      header: ({ column }) => <SortHeader column={column} title="Khóa học" />,
      cell: ({ row }) => (
        <div className="flex min-w-56 items-center gap-3">
          <Thumb image={row.original.image} className="h-11 w-18 shrink-0 rounded-md border" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.title}</p>
            <p className="text-muted-foreground truncate text-xs">{row.original.duration}</p>
          </div>
        </div>
      ),
    },
    {
      // Value = category id (faceted filter); sorted by the category order of "Danh mục khóa học".
      id: "category",
      accessorFn: (course) => course.categoryId,
      sortingFn: (a, b) =>
        (categoryRank.get(a.original.categoryId) ?? 99) - (categoryRank.get(b.original.categoryId) ?? 99),
      meta: { label: "Danh mục" },
      header: ({ column }) => <SortHeader column={column} title="Danh mục" />,
      cell: ({ row }) => {
        const label = categories.labelOf(row.original.categoryId);
        return label ? (
          <StatusPill tone="info">{label}</StatusPill>
        ) : (
          <StatusPill tone="warning">Chưa có danh mục</StatusPill>
        );
      },
    },
    {
      accessorKey: "tuition",
      meta: { label: "Học phí" },
      header: "Học phí",
      enableSorting: false,
      cell: ({ row }) => <span className="whitespace-nowrap tabular-nums">{row.original.tuition}</span>,
    },
    {
      accessorKey: "status",
      meta: { label: "Trạng thái" },
      header: ({ column }) => <SortHeader column={column} title="Trạng thái" />,
      cell: ({ row }) => <PublishBadge status={row.original.status} />,
    },
    {
      id: "leads",
      accessorFn: (row) => counts.get(row.id)?.total ?? 0,
      meta: { label: "Đăng ký" },
      header: ({ column }) => <SortHeader column={column} title="Đăng ký" />,
      cell: ({ row }) => {
        const count = counts.get(row.original.id);
        if (!count?.total) return <span className="text-muted-foreground">—</span>;
        return (
          <Link
            href={`/admin/leads?course=${encodeURIComponent(row.original.id)}`}
            className="group/leads -mx-1.5 inline-flex items-center gap-2 rounded-md px-1.5 py-0.5 hover:bg-muted"
            title="Xem đăng ký tư vấn của khóa này"
          >
            <span className="group-hover/leads:text-primary font-medium tabular-nums">{count.total}</span>
            {count.new ? <StatusPill tone="primary">{count.new} mới</StatusPill> : null}
          </Link>
        );
      },
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
      cell: ({ row }) => (
        <RowActions
          actions={[
            { label: "Chỉnh sửa", icon: <Pencil />, href: `/admin/courses/${row.original.id}` },
            {
              label: row.original.status === "published" ? "Chuyển về bản nháp" : "Xuất bản",
              icon: row.original.status === "published" ? <EyeOff /> : <Eye />,
              onSelect: () => setStatus([row.original], row.original.status === "published" ? "draft" : "published"),
            },
            {
              label: "Xem đăng ký tư vấn",
              icon: <Inbox />,
              href: `/admin/leads?course=${encodeURIComponent(row.original.id)}`,
            },
            { label: "Xem trang Academy", icon: <ExternalLink />, href: "/academy", external: true },
            {
              label: "Xóa",
              icon: <Trash2 />,
              destructive: true,
              separatorBefore: true,
              onSelect: () => askDelete([row.original]),
            },
          ]}
        />
      ),
    },
  ];

  const published = data?.filter((course) => course.status === "published").length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Khóa học"
        description={
          data
            ? `${data.length} khóa học · ${published} đang hiển thị trên trang Academy.`
            : "Khóa học hiển thị trên trang Academy."
        }
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Khóa học" }]}
        actions={
          <>
            <ReorderButton
              collection="courses"
              items={data}
              description="Kéo thả để đổi thứ tự khóa học trong carousel và danh sách trên trang Academy."
              renderItem={(course) => (
                <>
                  <Thumb image={course.image} className="h-8 w-12 shrink-0 rounded border" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{course.title}</span>
                  {course.status === "draft" ? <StatusPill tone="muted">Nháp</StatusPill> : null}
                </>
              )}
            />
            <Button asChild size="sm">
              <Link href="/admin/courses/new">
                <Plus /> Thêm khóa học
              </Link>
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchKeys={["title"]}
        searchPlaceholder="Tìm khóa học…"
        initialSorting={[{ id: "order", desc: false }]}
        filters={[
          {
            columnId: "category",
            title: "Danh mục",
            options: categories.options.map(({ label, value }) => ({ label, value })),
          },
          { columnId: "status", title: "Trạng thái", options: publishFilterOptions },
        ]}
        getRowHref={(row) => `/admin/courses/${row.id}`}
        bulkActions={(rows, clear) => (
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
        )}
        emptyState={{
          title: "Chưa có khóa học",
          description: "Tạo khóa học đầu tiên để hiển thị trên trang Academy.",
          icon: <GraduationCap />,
          action: (
            <Button asChild size="sm">
              <Link href="/admin/courses/new">
                <Plus /> Thêm khóa học
              </Link>
            </Button>
          ),
        }}
      />
    </div>
  );
}
