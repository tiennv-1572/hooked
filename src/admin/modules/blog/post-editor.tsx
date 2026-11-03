"use client";

import { Clock3, Eye, PenLine } from "lucide-react";
import { useParams } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";

import { EntityEditor, useEntityEditor } from "@/admin/components/cms/entity-editor";
import {
  FieldRow,
  FormSection,
  RichTextField,
  SlugField,
  SwitchField,
  TagsField,
  TextareaField,
  TextField,
} from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { Field, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Tabs, TabsList, TabsTrigger } from "@/admin/components/ui/tabs";
import { Textarea } from "@/admin/components/ui/textarea";
import { useCollection, useSingleton } from "@/admin/lib/cms/hooks";
import { excerptOf } from "@/admin/lib/cms/inline";

import { BlockEditor } from "./block-editor";
import { HrefField } from "./href-field";
import { buildPostSchema, emptyPostForm, formToPost, postToForm, type PostForm } from "./post-schema";
import { PostStateBadge } from "./post-state-badge";
import { blogPostHref, postState, postWordCount, readingMinutes, useNow } from "./post-utils";
import { PostPreviewDialog } from "./post-preview-dialog";
import { PostCardPreview, SearchPreview } from "./previews";
import { AuthorField, PublishDateField, PublishStateNote, StatusToggle } from "./publish-fields";

/**
 * Blog post editor: writing column (title, slug, card copy, intro, block editor) + publishing aside,
 * and a full-screen "Xem trước" that renders the unsaved article in the site's editorial style.
 */
export function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const { data: posts } = useCollection("posts");

  // RHF picks up the latest resolver on every render, so the slug check follows the loaded posts.
  const schema = useMemo(
    () => buildPostSchema((posts ?? []).filter((post) => post.id !== id).map((post) => post.slug)),
    [posts, id],
  );

  const editor = useEntityEditor({
    collection: "posts",
    id,
    schema,
    basePath: "/admin/posts",
    empty: emptyPostForm,
    toForm: postToForm,
    toItem: (values) => formToPost(values),
  });

  const { control } = editor.form;
  const title = useWatch({ control, name: "title" });
  const status = useWatch({ control, name: "status" });
  const publishedAt = useWatch({ control, name: "publishedAt" });
  const now = useNow();
  const state = postState({ status, publishedAt }, now);

  const [previewOpen, setPreviewOpen] = useState(false);
  // The preview is transient: close it when Next hides this page in <Activity> on navigation.
  useLayoutEffect(() => () => setPreviewOpen(false), []);

  const tags = useMemo(() => [...new Set((posts ?? []).flatMap((post) => post.tags))].sort(), [posts]);

  return (
    <EntityEditor
      editor={editor}
      title={editor.isNew ? "Bài viết mới" : title || "Bài viết"}
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Bài viết", href: "/admin/posts" },
        { label: editor.isNew ? "Viết bài mới" : title || "Chỉnh sửa" },
      ]}
      meta={<PostStateBadge state={state} />}
      publicHref={editor.item && editor.item.status === "published" ? blogPostHref(editor.item.slug) : undefined}
      aside={<PostAside tagSuggestions={tags} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={previewOpen ? "preview" : "write"} onValueChange={(value) => setPreviewOpen(value === "preview")}>
          <TabsList className="h-9">
            <TabsTrigger value="write" className="px-3">
              <PenLine /> Soạn thảo
            </TabsTrigger>
            <TabsTrigger value="preview" className="px-3">
              <Eye /> Xem trước
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <PostStats />
      </div>
      <WritingColumn />
      <PostPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </EntityEditor>
  );
}

/** "≈ 3 phút đọc · 640 từ · 12 khối" */
function PostStats() {
  const intro = (useWatch({ name: "intro" }) as string) ?? "";
  const blocks = (useWatch({ name: "blocks" }) as PostForm["blocks"]) ?? [];
  const words = postWordCount({ intro, blocks });
  return (
    <p className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
      <Clock3 className="size-3.5" />
      <span className="text-foreground font-medium">{readingMinutes(words)} phút đọc</span>
      <span aria-hidden>·</span>
      {words.toLocaleString("vi-VN")} từ
      <span aria-hidden>·</span>
      {blocks.length} khối
    </p>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Write mode

function WritingColumn() {
  const introCtaEnabled = useWatch({ name: "introCta.enabled" }) as boolean;
  return (
    <>
      <div className="flex flex-col gap-5 rounded-xl border bg-card p-4 shadow-xs sm:p-6">
        <TitleInput />
        <SlugField name="slug" source="title" prefix="/blog/" description="Tránh đổi sau khi đã chia sẻ bài viết." />
      </div>

      <FormSection
        title="Thẻ bài viết"
        description="Hiển thị trong danh sách bài viết trên trang Blog và khi chia sẻ bài viết."
      >
        <TextField
          name="kicker"
          label="Nhãn ngắn"
          required
          maxLength={32}
          placeholder="Hooked × Sun Group"
          description="Phía trên tiêu đề thẻ, ví dụ tên đối tác hoặc chủ đề."
        />
      </FormSection>

      <FormSection title="Mở đầu">
        <RichTextField
          name="intro"
          label="Đoạn mở đầu"
          required
          rows={5}
          placeholder="Sự hợp tác chiến lược giữa Hooked Entertainment và…"
          description="Dùng **chữ đậm** và [liên kết](/duong-dan). Phần đầu đoạn này hiển thị trên thẻ bài viết ở trang Blog."
        />
        <SwitchField
          name="introCta.enabled"
          label="Liên kết dưới đoạn mở đầu"
          description="Ví dụ: dẫn tới dự án liên quan."
        />
        {introCtaEnabled ? (
          <FieldRow>
            <TextField
              name="introCta.label"
              label="Nội dung liên kết"
              required
              placeholder="Tìm hiểu thêm về Vui Fest Cát Bà"
            />
            <HrefField name="introCta.href" label="Đường dẫn" required />
          </FieldRow>
        ) : null}
      </FormSection>

      <FormSection title="Nội dung bài viết">
        <BlockEditor />
      </FormSection>
    </>
  );
}

/** Large auto-growing title (Enter does not add line breaks). */
function TitleInput() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PostForm>();
  const message = (get(errors, "title") as { message?: string } | undefined)?.message;
  return (
    <Field data-invalid={message ? true : undefined}>
      <FieldLabel htmlFor="title" className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Tiêu đề bài viết<span className="text-destructive">*</span>
      </FieldLabel>
      <Textarea
        id="title"
        rows={1}
        placeholder="Tiêu đề bài viết"
        aria-invalid={message ? true : undefined}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        className="font-brand placeholder:text-muted-foreground/45 min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-2xl leading-tight font-bold tracking-tight shadow-none focus-visible:ring-0 md:text-3xl dark:bg-transparent"
        {...register("title")}
      />
      <FieldError>{message}</FieldError>
    </Field>
  );
}

function PostAside({ tagSuggestions }: { tagSuggestions: string[] }) {
  const title = (useWatch({ name: "title" }) as string) ?? "";
  const kicker = (useWatch({ name: "kicker" }) as string) ?? "";
  const cover = useWatch({ name: "cover" }) as PostForm["cover"] | undefined;
  const slug = (useWatch({ name: "slug" }) as string) ?? "";
  const seoTitle = (useWatch({ name: "seo.title" }) as string) ?? "";
  const seoDescription = (useWatch({ name: "seo.description" }) as string) ?? "";
  const intro = (useWatch({ name: "intro" }) as string) ?? "";
  const excerpt = excerptOf(intro);
  const blocks = (useWatch({ name: "blocks" }) as PostForm["blocks"]) ?? [];
  const minutes = readingMinutes(postWordCount({ intro, blocks }));
  const { data: settings } = useSingleton("settings");

  return (
    <>
      <FormSection title="Xuất bản">
        <StatusToggle />
        <PublishStateNote />
        <PublishDateField />
        <AuthorField />
      </FormSection>

      <FormSection title="Ảnh bìa" description="Hiển thị ở đầu bài viết và trên thẻ bài viết.">
        <ImageField name="cover" required aspect="3/2" folder="blog" />
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium">Thẻ bài viết trên trang Blog</p>
          <PostCardPreview cover={cover} kicker={kicker} title={title} excerpt={excerpt} minutes={minutes} />
        </div>
      </FormSection>

      <FormSection title="Thẻ" description="Chỉ dùng để lọc bài viết trong CMS.">
        <TagsField name="tags" placeholder="Nhập thẻ rồi nhấn Enter" suggestions={tagSuggestions} />
      </FormSection>

      <FormSection title="SEO & chia sẻ" description="Cách bài viết xuất hiện trên Google và mạng xã hội.">
        <TextField
          name="seo.title"
          label="Tiêu đề SEO"
          maxLength={60}
          placeholder={title || "Mặc định dùng tiêu đề bài viết"}
          description="Để trống sẽ dùng tiêu đề bài viết."
        />
        <TextareaField
          name="seo.description"
          label="Mô tả SEO"
          rows={3}
          maxLength={160}
          placeholder={excerpt || "Mặc định dùng đoạn mở đầu"}
          description="Để trống sẽ dùng đoạn mở đầu."
        />
        <SearchPreview
          title={applyTemplate(settings?.seo?.titleTemplate, seoTitle.trim() || title.trim())}
          description={seoDescription.trim() || excerpt}
          path={`/blog/${slug}`}
        />
        <ImageField
          name="seo.image"
          label="Ảnh chia sẻ"
          aspect="1.91/1"
          folder="blog"
          description="Để trống sẽ dùng ảnh bìa."
        />
      </FormSection>
    </>
  );
}

function applyTemplate(template: string | undefined, title: string) {
  if (!title) return "";
  return template?.includes("%s") ? template.replace("%s", title) : title;
}
