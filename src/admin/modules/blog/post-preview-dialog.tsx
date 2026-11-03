"use client";

import { AlertCircle, LayoutTemplate, Monitor, Smartphone, X } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/admin/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/admin/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/admin/components/ui/toggle-group";
import { useSingleton } from "@/admin/lib/cms/hooks";
import { htmlExcerpt } from "@/lib/html-text";
import { cn } from "@/lib/utils";

import type { PostForm } from "./post-schema";
import { postWordCount, readingMinutes } from "./post-utils";
import { ArticlePreview, PostCardPreview, SearchPreview } from "./previews";

type Device = "desktop" | "mobile" | "listing";

/**
 * Full-screen read-only preview of the unsaved post. Full viewport width so the "Máy tính" view uses the
 * site's real desktop layout; "Điện thoại" renders inside a 390px phone frame.
 */
export function PostPreviewDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        // Focus the dialog itself (not the first toggle) — Tab still reaches every control, Esc closes.
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
        className="bg-background data-open:zoom-in-100 data-closed:zoom-out-100 top-0 left-0 flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 ring-0 sm:max-w-none"
      >
        {open ? <PreviewBody onClose={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PreviewBody({ onClose }: { onClose: () => void }) {
  const values = useWatch() as PostForm;
  const { formState } = useFormContext<PostForm>();
  const [openedAt] = useState(() => formState.submitCount);
  const [device, setDevice] = useState<Device>("desktop");
  const { data: settings } = useSingleton("settings");

  const title = values.title?.trim() ?? "";
  const failedSave = formState.submitCount > openedAt && Object.keys(formState.errors).length > 0;
  const article = {
    title: values.title ?? "",
    intro: values.intro ?? "",
    introCta: values.introCta?.enabled ? values.introCta : undefined,
    cover: values.cover,
    blocks: values.blocks ?? [],
  };
  const template = settings?.seo?.titleTemplate;
  const seoTitle = values.seo?.title?.trim() || title;

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-4">
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-sm font-semibold">Xem trước bài viết</DialogTitle>
          <DialogDescription className="truncate text-xs">
            {title || "Chưa có tiêu đề"} · nội dung chưa lưu
          </DialogDescription>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={device}
          onValueChange={(value) => value && setDevice(value as Device)}
        >
          {(
            [
              { value: "desktop", label: "Máy tính", icon: Monitor },
              { value: "mobile", label: "Điện thoại", icon: Smartphone },
              { value: "listing", label: "Thẻ & Google", icon: LayoutTemplate },
            ] as const
          ).map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} aria-label={option.label} className="px-2.5">
              <option.icon />
              <span className="hidden md:inline">{option.label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X /> <span className="hidden sm:inline">Đóng</span>
        </Button>
      </div>

      {failedSave ? (
        <div className="border-destructive/30 bg-destructive/8 text-destructive flex items-center gap-2 border-b px-4 py-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">Chưa lưu được — còn trường chưa hợp lệ.</span>
          <Button type="button" size="sm" variant="outline" onClick={onClose}>
            Quay lại sửa
          </Button>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50">
        {device === "desktop" ? (
          <ArticlePreview post={article} className="min-h-full" />
        ) : device === "mobile" ? (
          <div className="flex justify-center px-4 py-6 sm:py-10">
            <div className="w-full max-w-[390px] overflow-hidden rounded-[2.25rem] border-[7px] border-neutral-900 shadow-2xl dark:border-neutral-700">
              <ArticlePreview post={article} />
            </div>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:py-12">
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Thẻ trên trang Blog</h3>
              <PostCardPreview
                cover={values.cover}
                kicker={values.kicker ?? ""}
                title={title}
                excerpt={htmlExcerpt(values.intro ?? "")}
                minutes={readingMinutes(postWordCount(article))}
              />
            </section>
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Kết quả tìm kiếm Google</h3>
              <SearchPreview
                title={seoTitle && template?.includes("%s") ? template.replace("%s", seoTitle) : seoTitle}
                description={values.seo?.description?.trim() || htmlExcerpt(values.intro ?? "")}
                path={`/blog/${values.slug ?? ""}`}
              />
              <h3 className="mt-4 text-sm font-medium">Ảnh khi chia sẻ</h3>
              <ShareImage image={values.seo?.image?.url ? values.seo.image : values.cover} />
            </section>
          </div>
        )}
      </div>
    </>
  );
}

function ShareImage({ image }: { image?: { url: string; alt: string } }) {
  return (
    <div className={cn("aspect-[1.91/1] overflow-hidden rounded-lg border bg-muted", !image?.url && "bg-checker")}>
      {image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.url} alt={image.alt} className="size-full object-cover" />
      ) : null}
    </div>
  );
}
