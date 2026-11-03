"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Eye, EyeOff, Handshake, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { DataTable, RowActions, SortHeader } from "@/admin/components/cms/data-table";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { ReorderButton } from "@/admin/components/cms/reorder-button";
import { StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { useCollection, useDeleteItems, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Partner } from "@/admin/lib/cms/types/pages";
import { formatRelative } from "@/admin/lib/format";

/**
 * REFERENCE MODULE — list page pattern for every collection:
 * PageHeader (+ reorder + create) → DataTable (search, facets, row link, row actions, bulk actions).
 */
export function PartnersList() {
  const { data, isLoading } = useCollection("partners");
  const remove = useDeleteItems("partners");
  const update = useUpdateItem("partners", { silent: true });
  const confirm = useConfirm();

  const askDelete = async (rows: Partner[]) => {
    const ok = await confirm({
      title: rows.length === 1 ? `Xóa đối tác "${rows[0].name}"?` : `Xóa ${rows.length} đối tác?`,
      description: "Logo sẽ không còn hiển thị trên trang chủ và trang Partners.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) await remove.mutateAsync(rows.map((row) => row.id));
    return ok;
  };

  const columns: ColumnDef<Partner, unknown>[] = [
    {
      accessorKey: "name",
      meta: { label: "Đối tác" },
      header: ({ column }) => <SortHeader column={column} title="Đối tác" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Thumb image={row.original.logo} fit="contain" className="h-10 w-20 rounded-md border bg-[#050101] p-1.5" />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            {row.original.website ? (
              <p className="text-muted-foreground truncate text-xs">{row.original.website}</p>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: "placement",
      accessorFn: (row) => [row.showOnHome ? "home" : null, row.showOnPartnersPage ? "partners" : null].filter(Boolean),
      meta: { label: "Hiển thị" },
      header: "Hiển thị",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.showOnHome ? <StatusPill tone="primary">Trang chủ</StatusPill> : null}
          {row.original.showOnPartnersPage ? <StatusPill tone="info">Trang Partners</StatusPill> : null}
          {!row.original.showOnHome && !row.original.showOnPartnersPage ? (
            <StatusPill tone="muted">Ẩn</StatusPill>
          ) : null}
        </div>
      ),
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
      cell: ({ row }) => <span className="text-muted-foreground">{formatRelative(row.original.updatedAt)}</span>,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 48,
      cell: ({ row }) => (
        <RowActions
          actions={[
            { label: "Chỉnh sửa", icon: <Pencil />, href: `/admin/partners/${row.original.id}` },
            {
              label: row.original.showOnHome ? "Ẩn khỏi trang chủ" : "Hiện trên trang chủ",
              icon: row.original.showOnHome ? <EyeOff /> : <Eye />,
              onSelect: () => update.mutate({ id: row.original.id, patch: { showOnHome: !row.original.showOnHome } }),
            },
            { label: "Xem trang Partners", icon: <ExternalLink />, href: "/partners", external: true },
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Đối tác"
        description="Logo thương hiệu đồng hành — hiển thị ở dải logo trang chủ và trang Partners."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Đối tác" }]}
        actions={
          <>
            <ReorderButton
              collection="partners"
              items={data}
              renderItem={(partner) => (
                <>
                  <Thumb image={partner.logo} fit="contain" className="h-8 w-16 rounded border bg-[#050101] p-1" />
                  <span className="truncate text-sm font-medium">{partner.name}</span>
                </>
              )}
            />
            <Button asChild size="sm">
              <Link href="/admin/partners/new">
                <Plus /> Thêm đối tác
              </Link>
            </Button>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        searchKeys={["name", "website"]}
        searchPlaceholder="Tìm đối tác…"
        initialSorting={[{ id: "order", desc: false }]}
        filters={[
          {
            columnId: "placement",
            title: "Hiển thị",
            options: [
              { label: "Trang chủ", value: "home" },
              { label: "Trang Partners", value: "partners" },
            ],
          },
        ]}
        getRowHref={(row) => `/admin/partners/${row.id}`}
        bulkActions={(rows, clear) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await Promise.all(rows.map((row) => update.mutateAsync({ id: row.id, patch: { showOnHome: true } })));
                clear();
              }}
            >
              <Eye /> Hiện trên trang chủ
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
          title: "Chưa có đối tác",
          description: "Thêm logo thương hiệu đầu tiên.",
          icon: <Handshake />,
          action: (
            <Button asChild size="sm">
              <Link href="/admin/partners/new">
                <Plus /> Thêm đối tác
              </Link>
            </Button>
          ),
        }}
      />
    </div>
  );
}
