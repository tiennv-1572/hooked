"use client";

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  EyeOff,
  ListFilter,
  MoreHorizontal,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Checkbox } from "@/admin/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Separator } from "@/admin/components/ui/separator";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { stripInline } from "@/admin/lib/cms/inline";
import { cn } from "@/lib/utils";

export type FacetOption = { label: string; value: string; icon?: ReactNode };
export type FacetFilter = { columnId: string; title: string; options: FacetOption[] };

type DataTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[] | undefined;
  isLoading?: boolean;
  /** Fields searched by the search box (dot paths not supported — use top-level string fields). */
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  /** Faceted multi-select filters ("Trạng thái", "Danh mục"…). Values must match the column's cell value. */
  filters?: FacetFilter[];
  /** Extra controls at the right of the toolbar. */
  toolbar?: ReactNode;
  /** Clicking a row navigates here (ignored when clicking buttons/links/checkboxes inside the row). */
  getRowHref?: (row: T) => string;
  /** Adds a checkbox column + a bulk-action bar. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  emptyState?: { title: string; description?: string; icon?: ReactNode; action?: ReactNode };
  initialSorting?: SortingState;
  initialHidden?: string[];
  pageSize?: number;
  getRowId?: (row: T) => string;
};

const includesFacet: FilterFn<unknown> = (row, columnId, values: string[]) => {
  if (!values?.length) return true;
  const value = row.getValue(columnId);
  return Array.isArray(value) ? value.some((item) => values.includes(String(item))) : values.includes(String(value));
};

/**
 * Generic admin table: search, faceted filters, sortable columns, column visibility, pagination,
 * row selection with bulk actions, clickable rows, loading skeleton and empty state.
 *
 *   <DataTable columns={columns} data={data} isLoading={isLoading} searchKeys={["title"]}
 *     filters={[{ columnId: "status", title: "Trạng thái", options: [...] }]}
 *     getRowHref={(row) => `/admin/courses/${row.id}`} bulkActions={(rows, clear) => …} />
 */
export function DataTable<T>({
  columns,
  data,
  isLoading,
  searchKeys = [],
  searchPlaceholder = "Tìm kiếm…",
  filters = [],
  toolbar,
  getRowHref,
  bulkActions,
  emptyState,
  initialSorting = [],
  initialHidden = [],
  pageSize = 10,
  getRowId,
}: DataTableProps<T>) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    Object.fromEntries(initialHidden.map((id) => [id, false])),
  );
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const allColumns = useMemo(() => {
    const withFacets = columns.map((column) => {
      const id = (column as { accessorKey?: string }).accessorKey ?? column.id;
      return filters.some((filter) => filter.columnId === id)
        ? { ...column, filterFn: includesFacet as FilterFn<T> }
        : column;
    });
    return bulkActions ? [selectionColumn<T>(), ...withFacets] : withFacets;
  }, [columns, filters, bulkActions]);

  const table = useReactTable({
    data: data ?? [],
    columns: allColumns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    getRowId: getRowId ?? ((row) => (row as { id?: string }).id ?? JSON.stringify(row)),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, value: string) => {
      const query = value.trim().toLowerCase();
      if (!query) return true;
      const normalized = query.normalize("NFD").replace(/[̀-ͯ]/g, "");
      return searchKeys.some((key) => {
        const raw = row.original[key];
        const text = stripInline(Array.isArray(raw) ? raw.join(" ") : String(raw ?? "")).toLowerCase();
        return text.includes(query) || text.normalize("NFD").replace(/[̀-ͯ]/g, "").includes(normalized);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: false,
  });

  const selected = table.getSelectedRowModel().rows.map((row) => row.original);
  const isFiltered = Boolean(globalFilter) || columnFilters.length > 0;
  const rows = table.getRowModel().rows;

  const onRowClick = (row: Row<T>, event: React.MouseEvent) => {
    if (!getRowHref) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, [role='checkbox'], [role='menuitem'], label")) return;
    const href = getRowHref(row.original);
    if (event.metaKey || event.ctrlKey) window.open(href, "_blank");
    else router.push(href);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchKeys.length ? (
          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              value={globalFilter}
              onChange={(event) => {
                setGlobalFilter(event.target.value);
                table.setPageIndex(0);
              }}
              placeholder={searchPlaceholder}
              className="h-8 pl-8"
              aria-label="Tìm kiếm"
            />
          </div>
        ) : null}
        {filters.map((filter) => {
          const column = table.getColumn(filter.columnId);
          return column ? <FacetFilterButton key={filter.columnId} column={column} filter={filter} /> : null;
        })}
        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGlobalFilter("");
              setColumnFilters([]);
            }}
          >
            Xóa lọc
            <X />
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <ColumnToggle columns={table.getAllColumns().filter((column) => column.getCanHide())} />
        </div>
      </div>

      {bulkActions && selected.length > 0 ? (
        <div className="bg-primary/5 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="font-medium">Đã chọn {selected.length}</span>
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          {bulkActions(selected, () => table.resetRowSelection())}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => table.resetRowSelection()}>
            Bỏ chọn
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="bg-muted/40 hover:bg-muted/40">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.columnDef.size !== 150 ? header.column.columnDef.size : undefined }}
                    className="h-10 first:pl-4 last:pr-4"
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {allColumns.map((_, cell) => (
                    <TableCell key={cell} className="first:pl-4 last:pr-4">
                      <Skeleton className="h-5 w-full max-w-40" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={(event) => onRowClick(row, event)}
                  className={cn(getRowHref && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 first:pl-4 last:pr-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="p-0">
                  <Empty className="py-12">
                    <EmptyHeader>
                      {emptyState?.icon ? <EmptyMedia variant="icon">{emptyState.icon}</EmptyMedia> : null}
                      <EmptyTitle>
                        {isFiltered ? "Không có kết quả phù hợp" : (emptyState?.title ?? "Chưa có dữ liệu")}
                      </EmptyTitle>
                      <EmptyDescription>
                        {isFiltered ? "Thử từ khóa hoặc bộ lọc khác." : emptyState?.description}
                      </EmptyDescription>
                    </EmptyHeader>
                    {!isFiltered && emptyState?.action ? emptyState.action : null}
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination table={table} total={table.getFilteredRowModel().rows.length} />
    </div>
  );
}

function Pagination<T>({ table, total }: { table: ReturnType<typeof useReactTable<T>>; total: number }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  if (total <= 10 && pageIndex === 0) {
    return <p className="text-muted-foreground px-1 text-xs">{total} mục</p>;
  }
  const from = total ? pageIndex * pageSize + 1 : 0;
  const to = Math.min(total, (pageIndex + 1) * pageSize);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm">
      <p className="text-muted-foreground text-xs">
        {from}–{to} trên {total} mục
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden text-xs sm:inline">Số dòng</span>
        <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
          <SelectTrigger size="sm" className="w-18">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Trang đầu"
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Trang trước"
          >
            <ChevronLeft />
          </Button>
          <span className="px-2 text-xs tabular-nums">
            {pageIndex + 1}/{Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Trang sau"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Trang cuối"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FacetFilterButton<T>({ column, filter }: { column: Column<T, unknown>; filter: FacetFilter }) {
  const selected = new Set((column.getFilterValue() as string[] | undefined) ?? []);
  const facets = column.getFacetedUniqueValues();
  const countOf = (value: string) => {
    let count = 0;
    facets.forEach((n, key) => {
      if (Array.isArray(key) ? key.map(String).includes(value) : String(key) === value) count += n;
    });
    return count;
  };
  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    column.setFilterValue(next.size ? [...next] : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <ListFilter />
          {filter.title}
          {selected.size ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selected.size > 2
                  ? `${selected.size} đã chọn`
                  : filter.options
                      .filter((o) => selected.has(o.value))
                      .map((o) => o.label)
                      .join(", ")}
              </Badge>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-1" align="start">
        <div className="max-h-72 overflow-y-auto">
          {filter.options.map((option) => {
            const active = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-sm border",
                    active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {active ? <Check className="size-3" /> : null}
                </span>
                {option.icon}
                <span className="flex-1 truncate">{option.label}</span>
                <span className="text-muted-foreground text-xs tabular-nums">{countOf(option.value)}</span>
              </button>
            );
          })}
        </div>
        {selected.size ? (
          <>
            <Separator className="my-1" />
            <button
              type="button"
              onClick={() => column.setFilterValue(undefined)}
              className="w-full rounded-md px-2 py-1.5 text-center text-sm hover:bg-muted"
            >
              Bỏ lọc
            </button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function ColumnToggle<T>({ columns }: { columns: Column<T, unknown>[] }) {
  if (!columns.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden lg:inline-flex">
          <Settings2 />
          Cột
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
            onSelect={(event) => event.preventDefault()}
          >
            {(column.columnDef.meta as { label?: string } | undefined)?.label ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function selectionColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: "__select",
    size: 36,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Chọn tất cả"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Chọn dòng"
      />
    ),
  };
}

/** Sortable column header: `header: ({ column }) => <SortHeader column={column} title="Tiêu đề" />`. */
export function SortHeader<T>({
  column,
  title,
  className,
}: {
  column: Column<T, unknown>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  const sorted = column.getIsSorted();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("-ml-2 h-7 data-[state=open]:bg-muted", className)}>
          {title}
          {sorted === "desc" ? <ArrowDown /> : sorted === "asc" ? <ArrowUp /> : <ArrowUpDown className="opacity-50" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => column.toggleSorting(false)}>
          <ArrowUp /> Tăng dần
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => column.toggleSorting(true)}>
          <ArrowDown /> Giảm dần
        </DropdownMenuItem>
        {column.getCanHide() ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => column.toggleVisibility(false)}>
              <EyeOff /> Ẩn cột
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type RowAction = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  href?: string;
  /** Opens in a new tab (public preview). */
  external?: boolean;
  destructive?: boolean;
  separatorBefore?: boolean;
};

/** "…" menu at the end of a row. */
export function RowActions({ actions, label = "Thao tác" }: { actions: RowAction[]; label?: string }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} className="data-[state=open]:bg-muted">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => (
          <div key={action.label}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem
              variant={action.destructive ? "destructive" : "default"}
              onSelect={() => {
                if (action.onSelect) action.onSelect();
                else if (action.href && action.external) window.open(action.href, "_blank");
                else if (action.href) router.push(action.href);
              }}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
