"use client";

import { Check, ImageIcon, Link2, Search, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/admin/components/ui/tabs";
import { useCollection, useUpload } from "@/admin/lib/cms/hooks";
import type { ImageRef, MediaAsset } from "@/admin/lib/cms/types/shared";
import { formatBytes } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

export function assetToImage(asset: MediaAsset): ImageRef {
  return { url: asset.url, alt: asset.alt, width: asset.width, height: asset.height };
}

type MediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen images (one unless `multiple`). */
  onSelect: (images: ImageRef[]) => void;
  multiple?: boolean;
  /** Upload destination folder. */
  folder?: string;
  title?: string;
};

/**
 * Media library dialog: browse/search/filter existing assets, upload new ones, or paste an image URL.
 * Used by ImageField / GalleryField, and anywhere an image must be chosen.
 */
export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  folder = "uploads",
  title,
}: MediaPickerProps) {
  const { data: assets, isLoading } = useCollection("media");
  const upload = useUpload();
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [tab, setTab] = useState("library");
  const fileInput = useRef<HTMLInputElement>(null);

  const folders = useMemo(
    () => [...new Set(assets?.filter((a) => a.mime !== "image/svg+xml").map((a) => a.folder))].sort(),
    [assets],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (assets ?? []).filter(
      (asset) =>
        asset.folder !== "icons" &&
        (folderFilter === "all" || asset.folder === folderFilter) &&
        (!q || asset.name.toLowerCase().includes(q) || asset.alt.toLowerCase().includes(q)),
    );
  }, [assets, query, folderFilter]);

  const reset = () => {
    setSelected([]);
    setQuery("");
    setUrl("");
    setTab("library");
  };

  const close = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const confirm = () => {
    const chosen = selected.map((id) => assets?.find((asset) => asset.id === id)).filter(Boolean) as MediaAsset[];
    onSelect(chosen.map(assetToImage));
    close(false);
  };

  const toggle = (id: string) => {
    if (!multiple) {
      setSelected([id]);
      return;
    }
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const uploaded: MediaAsset[] = [];
    for (const file of Array.from(files)) {
      const asset = await upload.mutateAsync({ file, folder }).catch(() => null);
      if (asset) uploaded.push(asset);
    }
    if (!uploaded.length) return;
    if (multiple) setSelected((current) => [...current, ...uploaded.map((asset) => asset.id)]);
    else setSelected([uploaded[0].id]);
    setTab("library");
    setFolderFilter("all");
  };

  const useUrl = () => {
    const image = new Image();
    image.onload = () => {
      onSelect([{ url, alt: "", width: image.naturalWidth, height: image.naturalHeight }]);
      close(false);
    };
    image.onerror = () => {
      onSelect([{ url, alt: "" }]);
      close(false);
    };
    image.src = url;
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="flex max-h-[min(760px,calc(100dvh-32px))] flex-col gap-4 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title ?? (multiple ? "Chọn ảnh" : "Chọn một ảnh")}</DialogTitle>
          <DialogDescription>Chọn từ thư viện, tải ảnh mới lên hoặc dùng đường dẫn ảnh.</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1">
          <TabsList>
            <TabsTrigger value="library">
              <ImageIcon /> Thư viện
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload /> Tải lên
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 /> Đường dẫn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-48 flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên…"
                  className="pl-8"
                />
              </div>
              <Select value={folderFilter} onValueChange={setFolderFilter}>
                <SelectTrigger className="w-56">
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
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg">
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <Skeleton key={index} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : visible.length ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {visible.map((asset) => {
                    const active = selected.includes(asset.id);
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => toggle(asset.id)}
                        onDoubleClick={() => {
                          if (!multiple) {
                            onSelect([assetToImage(asset)]);
                            close(false);
                          }
                        }}
                        className={cn(
                          "group bg-checker ring-offset-background relative overflow-hidden rounded-lg border text-left ring-offset-2 transition",
                          active ? "ring-primary ring-2" : "hover:border-primary/50",
                        )}
                        title={asset.name}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={asset.url}
                          alt={asset.alt}
                          loading="lazy"
                          className="aspect-square w-full object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-1 text-[11px] text-white">
                          {asset.name}
                        </span>
                        {active ? (
                          <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full">
                            <Check className="size-3.5" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <Empty className="py-10">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ImageIcon />
                    </EmptyMedia>
                    <EmptyTitle>Không có ảnh phù hợp</EmptyTitle>
                    <EmptyDescription>Thử từ khóa khác hoặc tải ảnh mới lên.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onFiles(event.dataTransfer.files);
              }}
              className="hover:border-primary hover:bg-primary/5 flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors"
            >
              {upload.isPending ? (
                <Spinner className="text-primary size-6" />
              ) : (
                <Upload className="text-muted-foreground size-6" />
              )}
              <span className="font-medium">
                {upload.isPending ? "Đang tải lên…" : "Kéo thả ảnh vào đây hoặc bấm để chọn"}
              </span>
              <span className="text-muted-foreground text-xs">PNG, JPG, WebP, SVG · tối đa 8 MB mỗi ảnh</span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple={multiple}
              className="hidden"
              onChange={(event) => {
                onFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </TabsContent>

          <TabsContent value="url" className="flex flex-col gap-3">
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://… hoặc /images/…"
            />
            {url ? (
              <div className="bg-checker overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="max-h-72 w-full object-contain" />
              </div>
            ) : null}
            <Button type="button" disabled={!url} onClick={useUrl} className="w-fit">
              Dùng ảnh này
            </Button>
          </TabsContent>
        </Tabs>

        {tab === "library" ? (
          <DialogFooter className="items-center sm:justify-between">
            <span className="text-muted-foreground text-xs">
              {selected.length ? `Đã chọn ${selected.length}` : `${visible.length} ảnh`}
              {selected.length === 1 && assets
                ? (() => {
                    const asset = assets.find((item) => item.id === selected[0]);
                    return asset ? ` · ${asset.width}×${asset.height} · ${formatBytes(asset.size)}` : "";
                  })()
                : ""}
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Hủy
              </Button>
              <Button type="button" disabled={!selected.length} onClick={confirm}>
                {multiple ? `Chọn ${selected.length || ""} ảnh` : "Chọn ảnh"}
              </Button>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
