"use client";

import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FieldRow, FormSection, TextField } from "@/admin/components/cms/form-fields";
import { ImageField, Thumb } from "@/admin/components/cms/image-fields";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { Button } from "@/admin/components/ui/button";
import { Checkbox } from "@/admin/components/ui/checkbox";
import { createId } from "@/admin/lib/cms/ids";
import type { Post } from "@/admin/lib/cms/types/blog";
import type { HomeBlogItem, HomePage } from "@/admin/lib/cms/types/pages";
import { excerptOf } from "@/admin/lib/cms/inline";
import { cn } from "@/lib/utils";

import { TabLayout } from "../editor-tabs";
import { PostPickerDialog, RowTitle, shortText } from "../form-bits";
import { LinkField } from "../link-field";
import { PreviewCard, PreviewEmpty, SiteCanvas } from "../site-preview";

function fromPost(post: Post): Omit<HomeBlogItem, "id"> {
  return {
    title: post.title.toUpperCase(),
    lines: [post.kicker, shortText(excerptOf(post.intro))],
    href: `/blog/${post.slug}`,
    image: post.cover,
  };
}

export function BlogTab() {
  const { control, getValues, setValue, formState } = useFormContext<HomePage>();
  const [items, initialIndex] = useWatch({ control, name: ["blogCarousel.items", "blogCarousel.initialIndex"] });
  const [picker, setPicker] = useState<{ mode: "add" } | { mode: "fill"; index: number } | null>(null);
  // Remounts the repeater after an outside append so its rows keep their collapsed state.
  const [repeaterKey, setRepeaterKey] = useState(0);

  // `initialIndex` is stored as a position: keep it on the same card when rows are dragged or deleted.
  const centerId = useRef<string | undefined>(undefined);
  const ids = (items ?? []).map((item) => item.id).join("|");
  useEffect(() => {
    centerId.current = getValues("blogCarousel.items")?.[initialIndex ?? 0]?.id;
  }, [initialIndex, getValues]);
  useEffect(() => {
    const list = getValues("blogCarousel.items") ?? [];
    if (!list.length) return;
    const found = list.findIndex((item) => item.id === centerId.current);
    const next = found === -1 ? 0 : found;
    if (next !== getValues("blogCarousel.initialIndex")) {
      setValue("blogCarousel.initialIndex", next, { shouldDirty: true });
    }
    centerId.current = list[next]?.id;
  }, [ids, getValues, setValue]);

  const makeCenter = (index: number) =>
    setValue("blogCarousel.initialIndex", index, { shouldDirty: true, shouldValidate: formState.isSubmitted });

  const onPick = (post: Post) => {
    if (!picker) return;
    const options = { shouldDirty: true, shouldValidate: formState.isSubmitted };
    if (picker.mode === "add") {
      const current = getValues("blogCarousel.items") ?? [];
      setValue("blogCarousel.items", [...current, { id: createId("blog"), ...fromPost(post) }], options);
      setRepeaterKey((key) => key + 1);
      toast.success(`Đã thêm “${post.title}” vào cuối danh sách.`);
    } else {
      const base = `blogCarousel.items.${picker.index}` as const;
      const next = fromPost(post);
      setValue(`${base}.title`, next.title, options);
      setValue(`${base}.lines`, next.lines, options);
      setValue(`${base}.href`, next.href, options);
      setValue(`${base}.image`, next.image, options);
    }
  };

  // Preview below the list, full width.
  return (
    <TabLayout>
      <FormSection
        title="Thẻ bài viết"
        description="Băng chuyền “BLOGPOST” trên trang chủ; “Thẻ giữa” là thẻ hiện ở giữa khi mở trang."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => setPicker({ mode: "add" })}>
            <Newspaper /> Thêm từ bài viết
          </Button>
        }
      >
        <RepeaterField<HomeBlogItem>
          key={repeaterKey}
          name="blogCarousel.items"
          label="Danh sách thẻ"
          addLabel="Thêm thẻ trống"
          duplicable
          newItem={() => ({
            id: createId("blog"),
            title: "",
            lines: ["", ""],
            href: "/blog",
            image: undefined as never,
          })}
          itemLeading={(item) => <Thumb image={item.image} className="h-16 w-12 shrink-0 rounded-md" />}
          itemTitle={(item, index) => (
            <RowTitle name={`blogCarousel.items.${index}`}>{item.title || "Thẻ mới"}</RowTitle>
          )}
          itemActions={(_, index) => {
            const center = index === (initialIndex ?? 0);
            return (
              <label
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  center ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                )}
                title={center ? "Thẻ này ở giữa khi tải trang" : "Đặt làm thẻ ở giữa khi tải trang"}
              >
                {/* Radio-like: exactly one card is the centre, so a checked box can't be unchecked. */}
                <Checkbox checked={center} onCheckedChange={(checked) => checked && makeCenter(index)} />
                <span className="hidden sm:inline">Thẻ giữa</span>
              </label>
            );
          }}
          renderItem={(index) => (
            <>
              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">
                  Điền nhanh tiêu đề, chú thích, ảnh và liên kết từ một bài viết.
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit shrink-0"
                  onClick={() => setPicker({ mode: "fill", index })}
                >
                  <Newspaper /> Điền từ bài viết
                </Button>
              </div>
              <FieldRow>
                <TextField
                  name={`blogCarousel.items.${index}.title`}
                  label="Tiêu đề"
                  required
                  placeholder="VUI FEST CÁT BÀ"
                />
                <LinkField name={`blogCarousel.items.${index}.href`} label="Liên kết" required />
              </FieldRow>
              <FieldRow>
                <TextField
                  name={`blogCarousel.items.${index}.lines.0`}
                  label="Chú thích dòng 1"
                  required
                  placeholder="Hooked × Sun Group"
                  maxLength={32}
                />
                <TextField
                  name={`blogCarousel.items.${index}.lines.1`}
                  label="Chú thích dòng 2"
                  placeholder="Bệ phóng cho nghệ sĩ trẻ"
                  maxLength={32}
                />
              </FieldRow>
              <ImageField
                name={`blogCarousel.items.${index}.image`}
                label="Ảnh"
                required
                aspect="3/4"
                folder="blog"
                className="max-w-60"
                description="Nên dùng ảnh dọc."
              />
            </>
          )}
        />
      </FormSection>
      <PostPickerDialog
        open={picker !== null}
        onOpenChange={(open) => !open && setPicker(null)}
        onPick={onPick}
        title={picker?.mode === "fill" ? `Điền thẻ ${picker.index + 1} từ bài viết` : "Thêm thẻ từ bài viết"}
      />
      <BlogPreview />
    </TabLayout>
  );
}

/** Desktop carousel at full width: sizes follow the site (260px cards in a 1200px page) through container units. */
function BlogPreview() {
  const carousel = useWatch({ name: "blogCarousel" }) as HomePage["blogCarousel"] | undefined;
  const items = carousel?.items ?? [];
  const count = items.length;
  const initial = carousel?.initialIndex ?? 0;
  const [center, setCenter] = useState(initial);
  const [seenInitial, setSeenInitial] = useState(initial);
  if (seenInitial !== initial) {
    setSeenInitial(initial);
    setCenter(initial);
  }
  const index = count ? ((center % count) + count) % count : 0;
  const at = (offset: number) => items[(index + offset + count) % count];
  const current = count ? at(0) : undefined;

  return (
    <PreviewCard
      href="/"
      description={
        count ? `Thẻ ${index + 1}/${count}${index === initial ? " · thẻ ở giữa khi tải trang" : ""}` : undefined
      }
    >
      <SiteCanvas className="@container bg-[linear-gradient(180deg,#1c0904_0%,#6e240c_60%,#e65826_100%)]">
        <div className="px-[4cqw] pt-[2.5cqw] pb-[3cqw]">
          <div className="flex items-center justify-between">
            <p className="text-[3.3cqw] leading-tight font-bold uppercase">BLOGPOST</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={count < 2}
                onClick={() => setCenter(index - 1)}
                className="rounded-full border border-white/30 p-1.5 text-white/80 hover:text-white disabled:opacity-30"
                aria-label="Thẻ trước"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                disabled={count < 2}
                onClick={() => setCenter(index + 1)}
                className="rounded-full border border-white/30 p-1.5 text-white/80 hover:text-white disabled:opacity-30"
                aria-label="Thẻ sau"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
          {current ? (
            <div className="mt-[2.5cqw] flex items-start justify-center gap-[1.4cqw] [perspective:1200px]">
              {count > 2 ? (
                <BlogCard
                  item={at(-1)}
                  className="mt-[3.3cqw] aspect-[260/374] w-[21.7cqw] [transform:rotateY(22deg)] opacity-70"
                />
              ) : null}
              <div className="flex w-[21.7cqw] flex-col items-center gap-[1cqw]">
                <BlogCard item={current} className="aspect-[260/340] w-full" />
                <p className="text-center text-[1.6cqw] leading-tight font-extrabold text-[#ff9c50] uppercase">
                  {current.title}
                </p>
                <p className="text-center font-sans text-[1.1cqw] leading-snug text-white/85">
                  {current.lines?.[0]}
                  {current.lines?.[1] ? <span className="block">{current.lines[1]}</span> : null}
                </p>
              </div>
              {count > 1 ? (
                <BlogCard
                  item={at(1)}
                  className="mt-[3.3cqw] aspect-[260/374] w-[21.7cqw] [transform:rotateY(-22deg)] opacity-70"
                />
              ) : null}
            </div>
          ) : (
            <PreviewEmpty>Chưa có thẻ nào</PreviewEmpty>
          )}
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}

function BlogCard({ item, className }: { item: HomeBlogItem; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg bg-[#080605] shadow-lg", className)}>
      {item.image?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image.url} alt={item.image.alt} className="size-full object-cover" />
      ) : null}
    </div>
  );
}
