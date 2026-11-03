"use client";

import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { EntityEditor, useEntityEditor } from "@/admin/components/cms/entity-editor";
import {
  ChipsField,
  FieldRow,
  FormSection,
  SlugField,
  StringListField,
  TextField,
} from "@/admin/components/cms/form-fields";
import { GalleryField, ImageField } from "@/admin/components/cms/image-fields";
import { RichTextEditorField } from "@/admin/components/cms/rich-text-editor";
import { PublishBadge } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import { useCollection } from "@/admin/lib/cms/hooks";
import {
  hrefSchema,
  imageRefSchema,
  optionalImageSchema,
  publishStatusSchema,
  requiredText,
  slugSchema,
} from "@/admin/lib/cms/schemas";
import type { Project, ProjectCategory } from "@/admin/lib/cms/types/projects";
import type { ImageRef, PublishStatus } from "@/admin/lib/cms/types/shared";
import { htmlToText } from "@/lib/html-text";

import { StatusField } from "./project-format-fields";
import { categoryLabels, isAutoThumbnail, projectPublicHref, youtubeThumbnail } from "./project-utils";
import { ProjectVideosField } from "./project-video-fields";
import { SiteProjectCard, SiteStage } from "./project-visuals";

function buildSchema(isSlugTaken: (slug: string) => boolean) {
  return z.object({
    name: requiredText("Nhập tên dự án."),
    slug: slugSchema.refine((slug) => !isSlugTaken(slug), "Đường dẫn này đã được dùng cho dự án khác."),
    description: z.string().refine((html) => Boolean(htmlToText(html)), "Nhập mô tả dự án."),
    categoryIds: z.array(z.string()).min(1, "Chọn ít nhất 1 danh mục."),
    partners: z.array(z.string()),
    cover: imageRefSchema("Chọn ảnh bìa (poster) cho thẻ dự án."),
    heroImage: imageRefSchema("Chọn ảnh hero cho trang chi tiết."),
    photos: z.array(
      z.object({
        id: z.string(),
        url: z.string(),
        alt: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    ),
    videos: z.array(
      z.object({
        id: z.string(),
        youtubeId: z
          .string()
          .trim()
          .min(1, "Nhập link hoặc ID YouTube.")
          .regex(/^[\w-]{11}$/, "Link hoặc ID YouTube không hợp lệ."),
        title: requiredText("Nhập tiêu đề video."),
        thumbnail: optionalImageSchema,
      }),
    ),
    featuredVideoId: z.string().nullable(),
    albumLink: z.object({
      label: requiredText("Nhập nhãn liên kết."),
      href: z.union([z.literal(""), hrefSchema]).optional(),
    }),
    status: publishStatusSchema,
  });
}

type ProjectForm = z.infer<ReturnType<typeof buildSchema>>;

const emptyProject = (): ProjectForm => ({
  name: "",
  slug: "",
  description: "",
  categoryIds: [],
  partners: [],
  cover: undefined as never,
  heroImage: undefined as never,
  photos: [],
  videos: [],
  featuredVideoId: null,
  albumLink: { label: "Xem toàn bộ album ảnh", href: "" },
  status: "draft",
});

const toForm = (item: Project): ProjectForm => ({
  name: item.name,
  slug: item.slug,
  description: item.description,
  categoryIds: [...item.categoryIds],
  partners: [...item.partners],
  cover: item.cover,
  heroImage: item.heroImage,
  photos: item.photos,
  // YouTube's own poster is stored for the website but edited as "auto" (follows the id).
  videos: item.videos.map((video) => ({ ...video, thumbnail: isAutoThumbnail(video) ? undefined : video.thumbnail })),
  featuredVideoId: item.featuredVideoId,
  albumLink: { label: item.albumLink.label, href: item.albumLink.href ?? "" },
  status: item.status,
});

/** /admin/projects/[id] — create / edit a portfolio project. */
export function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const { data: projects } = useCollection("projects");
  const { data: categories } = useCollection("projectCategories");

  // react-hook-form reads the resolver on every render, so the slug check always sees the current list & id.
  const schema = useMemo(
    () => buildSchema((slug) => (projects ?? []).some((project) => project.slug === slug && project.id !== id)),
    [projects, id],
  );

  const editor = useEntityEditor({
    collection: "projects",
    id,
    schema,
    basePath: "/admin/projects",
    empty: emptyProject,
    toForm,
    toItem: (values, item) => ({
      ...values,
      partners: values.partners.map((partner) => partner.trim()).filter(Boolean),
      videos: values.videos.map((video) => ({
        id: video.id,
        youtubeId: video.youtubeId,
        title: video.title,
        thumbnail: video.thumbnail?.url
          ? (video.thumbnail as ImageRef)
          : youtubeThumbnail(video.youtubeId, video.title),
      })),
      featuredVideoId: values.videos.some((video) => video.id === values.featuredVideoId)
        ? values.featuredVideoId
        : null,
      albumLink: values.albumLink.href
        ? { label: values.albumLink.label, href: values.albumLink.href }
        : { label: values.albumLink.label },
      order: item?.order ?? (projects ?? []).reduce((max, project) => Math.max(max, project.order), -1) + 1,
    }),
  });

  const [name, status] = useWatch({ control: editor.form.control, name: ["name", "status"] });
  const loaded = editor.isNew || Boolean(editor.form.formState.defaultValues?.slug);

  return (
    <EntityEditor
      editor={editor}
      title={editor.isNew ? "Dự án mới" : name || "Dự án"}
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Dự án", href: "/admin/projects" },
        { label: editor.isNew ? "Thêm mới" : name || "Chỉnh sửa" },
      ]}
      meta={<PublishBadge status={(status as PublishStatus) ?? "draft"} />}
      publicHref={editor.item ? projectPublicHref(editor.item.slug) : undefined}
      aside={<ProjectAside categories={categories} />}
    >
      <FormSection title="Thông tin chung">
        <TextField name="name" label="Tên dự án" required placeholder="Devoid Music Festival" />
        <SlugField name="slug" source="name" prefix="/projects/" />
        <RichTextEditorField
          name="description"
          label="Mô tả dự án"
          required
          placeholder="Giới thiệu ngắn về sự kiện, quy mô, dấu ấn của Hooked…"
        />
      </FormSection>

      <FormSection
        title="Danh mục"
        action={
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href="/admin/project-categories">
              <Settings2 /> Quản lý danh mục
            </Link>
          </Button>
        }
      >
        <ChipsField
          name="categoryIds"
          required
          options={(categories ?? []).map((category) => ({ value: category.id, label: category.label }))}
          description="Hiển thị dưới tên dự án và ở mục “Dịch vụ cung cấp” theo thứ tự bạn chọn."
        />
      </FormSection>

      <FormSection title="Đối tác">
        <StringListField
          name="partners"
          placeholder="Sun Group"
          addLabel="Thêm đối tác"
          description="Để trống sẽ ẩn mục “Đối tác” trên trang chi tiết."
        />
      </FormSection>

      <FormSection title="Ảnh bìa & hero" description="Poster cho thẻ ở trang Projects và ảnh lớn đầu trang chi tiết.">
        <div className="grid items-start gap-5 md:grid-cols-2">
          <ImageField
            name="cover"
            label="Ảnh bìa (poster thẻ dự án)"
            required
            aspect="16/9"
            folder="projects/covers"
            description="Poster đã có sẵn khung và chữ trong ảnh."
          />
          <HeroImageField />
        </div>
      </FormSection>

      <FormSection title="Album ảnh" description="Hiển thị ở mục “Ảnh & video” trên trang chi tiết.">
        <GalleryField
          name="photos"
          label="Ảnh trong album"
          aspect="4/3"
          folder="projects/photos"
          description="Kéo thả để đổi thứ tự."
        />
        <FieldRow>
          <TextField
            name="albumLink.label"
            label="Nhãn liên kết dưới album"
            required
            placeholder="Xem toàn bộ album ảnh"
          />
          <TextField
            name="albumLink.href"
            label="Đường dẫn"
            placeholder="https://www.youtube.com/@…"
            description="Để trống sẽ mở album ảnh ngay trên trang."
          />
        </FieldRow>
      </FormSection>

      <FormSection title="Video" description="Video YouTube trong album và video phát từ thẻ dự án.">
        {/* Remount once the saved item is loaded so its rows start collapsed (only rows added later auto-expand). */}
        <ProjectVideosField key={loaded ? "loaded" : "loading"} />
      </FormSection>
    </EntityEditor>
  );
}

/** Hero image of the detail page, previewed whole as the site shows it, with a "use the cover" shortcut. */
function HeroImageField() {
  const { setValue } = useFormContext<ProjectForm>();
  const [cover, heroImage] = useWatch<ProjectForm>({ name: ["cover", "heroImage"] }) as [
    ImageRef | undefined,
    ImageRef | undefined,
  ];
  const canCopyCover = Boolean(cover?.url) && cover?.url !== heroImage?.url;
  return (
    <ImageField
      name="heroImage"
      label="Ảnh hero (trang chi tiết)"
      required
      aspect="auto"
      folder="projects/photos"
      description={
        canCopyCover ? (
          <button
            type="button"
            className="text-primary font-medium hover:underline"
            onClick={() => setValue("heroImage", cover as ImageRef, { shouldDirty: true, shouldValidate: true })}
          >
            Dùng ảnh bìa
          </button>
        ) : undefined
      }
    />
  );
}

/** Right column: status and the live card preview. */
function ProjectAside({ categories }: { categories: ProjectCategory[] | undefined }) {
  const values = useWatch<ProjectForm>() as Partial<ProjectForm>;
  // Tags keep the project's own order, as the website prints them.
  const tags = categoryLabels(values.categoryIds ?? [], categories);
  const featured = values.videos?.find((video) => video.id === values.featuredVideoId);

  return (
    <>
      <FormSection title="Xuất bản">
        <StatusField name="status" />
      </FormSection>

      <FormSection title="Xem trước thẻ dự án">
        <SiteStage>
          <SiteProjectCard title={values.name ?? ""} cover={values.cover} tags={tags} hasVideo={Boolean(featured)} />
        </SiteStage>
      </FormSection>
    </>
  );
}
