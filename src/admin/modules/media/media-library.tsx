"use client";

import { Check, Copy, Grid2x2, ImageIcon, List, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/admin/components/ui/sheet";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/admin/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { useCollection, useDeleteItems, useUpload } from "@/admin/lib/cms/hooks";
import type { MediaAsset } from "@/admin/lib/cms/types/shared";
import { formatBytes, formatDate } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

/** Media library: browse, search, filter by folder/type, upload (drag & drop), copy URL, delete. */
export function MediaLibrary() {
  const { data: assets, isLoading } = useCollection("media");
  const upload = useUpload();
  const remove = useDeleteItems("media");
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [kind, setKind] = useState("images");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const folders = useMemo(() => [...new Set(assets?.map((asset) => asset.folder))].sort(), [assets]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (assets ?? []).filter((asset) => {
      const isIcon = asset.mime === "image/svg+xml" || asset.folder === "icons";
      if (kind === "images" && isIcon) return false;
      if (kind === "icons" && !isIcon) return false;
      if (kind === "uploads" && asset.source !== "upload") return false;
      if (folder !== "all" && asset.folder !== folder) return false;
      return !q || asset.name.toLowerCase().includes(q) || asset.alt.toLowerCase().includes(q);
    });
  }, [assets, query, folder, kind]);
  const totalSize = visible.reduce((sum, asset) => sum + asset.size, 0);
  const active = assets?.find((asset) => asset.id === activeId) ?? null;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    let count = 0;
    for (const file of Array.from(files)) {
      const asset = await upload.mutateAsync({ file, folder: folder === "all" ? "uploads" : folder }).catch(() => null);
      if (asset) count += 1;
    }
    if (count) toast.success(`Đã tải lên ${count} ảnh.`);
  };

  const askDelete = async (asset: MediaAsset) => {
    const ok = await confirm({
      title: `Xóa "${asset.name}" khỏi thư viện?`,
      description: "Nội dung đang dùng ảnh này vẫn giữ đường dẫn cũ. Hành động không thể hoàn tác.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) {
      await remove.mutateAsync([asset.id]);
      setActiveId(null);
    }
  };

  return (
    <div
      className="relative flex flex-col gap-6"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        onFiles(event.dataTransfer.files);
      }}
    >
      <PageHeader
        title="Thư viện media"
        description="Kéo thả ảnh vào trang để tải lên."
        breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Thư viện media" }]}
        actions={
          <Button size="sm" onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <Spinner /> : <Upload />} Tải ảnh lên
          </Button>
        }
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên hoặc mô tả…"
            className="h-8 pl-8"
          />
        </div>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="images">Hình ảnh</SelectItem>
            <SelectItem value="icons">Icon (SVG)</SelectItem>
            <SelectItem value="uploads">Đã tải lên</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger size="sm" className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả thư mục</SelectItem>
            {folders.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground text-xs">
          {visible.length} tệp · {formatBytes(totalSize)}
        </span>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value as "grid" | "list")}
          variant="outline"
          size="sm"
          className="ml-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Dạng lưới">
            <Grid2x2 />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Dạng danh sách">
            <List />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : !visible.length ? (
        <Empty className="rounded-xl border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ImageIcon />
            </EmptyMedia>
            <EmptyTitle>Không có tệp phù hợp</EmptyTitle>
            <EmptyDescription>Đổi bộ lọc hoặc kéo thả ảnh vào đây để tải lên.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6">
          {visible.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => setActiveId(asset.id)}
              className="group hover:border-primary/50 overflow-hidden rounded-xl border bg-card text-left transition hover:shadow-md"
            >
              <div className="bg-checker relative aspect-square overflow-hidden">
                <Thumb
                  image={asset}
                  fit={asset.mime === "image/svg+xml" ? "contain" : "cover"}
                  className="size-full transition-transform duration-300 group-hover:scale-105"
                />
                {asset.source === "upload" ? (
                  <StatusPill tone="primary" className="bg-background/90 absolute top-2 left-2">
                    Mới tải lên
                  </StatusPill>
                ) : null}
              </div>
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">{asset.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {asset.width}×{asset.height} · {formatBytes(asset.size)}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="pl-4">Tệp</TableHead>
                <TableHead>Thư mục</TableHead>
                <TableHead>Kích thước</TableHead>
                <TableHead>Dung lượng</TableHead>
                <TableHead className="pr-4">Ngày thêm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((asset) => (
                <TableRow key={asset.id} className="cursor-pointer" onClick={() => setActiveId(asset.id)}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Thumb image={asset} className="size-10 rounded-md border" />
                      <span className="max-w-72 truncate font-medium">{asset.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{asset.folder}</TableCell>
                  <TableCell className="tabular-nums">
                    {asset.width}×{asset.height}
                  </TableCell>
                  <TableCell className="tabular-nums">{formatBytes(asset.size)}</TableCell>
                  <TableCell className="text-muted-foreground pr-4">{formatDate(asset.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {dragging ? (
        <div className="bg-primary/10 pointer-events-none fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px]">
          <div className="border-primary bg-background rounded-2xl border-2 border-dashed px-10 py-8 text-center shadow-xl">
            <Upload className="text-primary mx-auto mb-2 size-8" />
            <p className="font-medium">Thả ảnh để tải lên</p>
          </div>
        </div>
      ) : null}

      <AssetSheet asset={active} onClose={() => setActiveId(null)} onDelete={askDelete} />
    </div>
  );
}

function AssetSheet({
  asset,
  onClose,
  onDelete,
}: {
  asset: MediaAsset | null;
  onClose: () => void;
  onDelete: (asset: MediaAsset) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!asset) return;
    await navigator.clipboard.writeText(
      asset.url.startsWith("data:") ? asset.url : new URL(asset.url, window.location.origin).href,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open={Boolean(asset)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        {asset ? (
          <>
            <SheetHeader>
              <SheetTitle className="truncate pr-6">{asset.name}</SheetTitle>
              <SheetDescription>
                {asset.folder} · {asset.mime}
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
              <div className="bg-checker overflow-hidden rounded-xl border">
                <Thumb image={asset} fit="contain" className="max-h-80 w-full" />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Kích thước", `${asset.width} × ${asset.height}px`],
                  ["Dung lượng", formatBytes(asset.size)],
                  ["Ngày thêm", formatDate(asset.createdAt)],
                  ["Nguồn", asset.source === "upload" ? "Tải lên" : asset.source === "url" ? "Đường dẫn" : "Website"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border p-2.5">
                    <dt className="text-muted-foreground text-xs">{label}</dt>
                    <dd className="font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="grid gap-2">
                <Label>Đường dẫn</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={asset.url.startsWith("data:") ? "(ảnh tải lên — lưu trong trình duyệt)" : asset.url}
                    className="font-mono text-xs"
                  />
                  <Button size="icon" variant="outline" onClick={copy} aria-label="Sao chép đường dẫn">
                    {copied ? <Check /> : <Copy />}
                  </Button>
                </div>
              </div>
            </div>
            <SheetFooter className={cn("flex-row border-t")}>
              <Button variant="outline" className="text-destructive" onClick={() => onDelete(asset)}>
                <Trash2 /> Xóa khỏi thư viện
              </Button>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
