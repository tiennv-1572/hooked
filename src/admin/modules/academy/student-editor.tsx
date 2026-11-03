"use client";

import { Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { EntityEditor, useEntityEditor } from "@/admin/components/cms/entity-editor";
import { FieldRow, FormSection, SwitchField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { RichTextEditorField } from "@/admin/components/cms/rich-text-editor";
import { PublishBadge, StatusPill } from "@/admin/components/cms/status-badge";
import { useCollection } from "@/admin/lib/cms/hooks";
import { imageRefSchema, publishStatusSchema, requiredText } from "@/admin/lib/cms/schemas";

import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { htmlToText } from "@/lib/html-text";

import { PublishStatusField } from "./shared";
import { FeaturedSlidePreview, StoryCardPreview } from "./student-portrait";

const DEFAULT_CROP = { scale: 1.4, top: 4 };

const studentSchema = z
  .object({
    id: z.string().optional(),
    name: requiredText("Nhập tên học viên.").max(40, "Tối đa 40 ký tự."),
    role: requiredText("Nhập vai trò.").max(32, "Tối đa 32 ký tự."),
    affiliation: requiredText("Nhập đơn vị (ví dụ: Hooked Academy).").max(60, "Tối đa 60 ký tự."),
    portrait: imageRefSchema("Chọn ảnh chân dung."),
    // No longer editable: kept so an existing manual crop still applies on the site.
    cropEnabled: z.boolean(),
    cropScale: z.number().min(1, "Tối thiểu 1×.").max(3, "Tối đa 3×."),
    cropTop: z.number().min(0, "Tối thiểu 0%.").max(60, "Tối đa 60%."),
    story: z.string().refine((html) => Boolean(htmlToText(html)), "Viết câu chuyện."),
    featured: z.boolean(),
    headline: z.string().trim().max(160, "Tối đa 160 ký tự."),
    status: publishStatusSchema,
  })
  .superRefine(
    (values, context) => {
      if (values.featured && !String(values.headline ?? "").trim()) {
        context.addIssue({
          code: "custom",
          path: ["headline"],
          message: "Nhập câu trích dẫn để hiển thị trong carousel Academy.",
        });
      }
    },
    // Run even when other fields are invalid, so every error shows at once.
    { when: () => true },
  );
type StudentForm = z.infer<typeof studentSchema>;

export function StudentEditor() {
  const { id } = useParams<{ id: string }>();
  const { data: students } = useCollection("students");

  const editor = useEntityEditor({
    collection: "students",
    id,
    schema: studentSchema,
    basePath: "/admin/students",
    empty: (): StudentForm => ({
      id: undefined,
      name: "",
      role: "DJ",
      affiliation: "Hooked Academy",
      portrait: undefined as never,
      cropEnabled: false,
      cropScale: DEFAULT_CROP.scale,
      cropTop: DEFAULT_CROP.top,
      story: "",
      featured: false,
      headline: "",
      status: "draft",
    }),
    toForm: (item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      affiliation: item.affiliation,
      portrait: item.portrait,
      cropEnabled: Boolean(item.crop),
      cropScale: item.crop?.scale ?? DEFAULT_CROP.scale,
      cropTop: item.crop ? Math.round(item.crop.top * 1000) / 10 : DEFAULT_CROP.top,
      story: item.story,
      featured: item.featured,
      headline: item.headline ?? "",
      status: item.status,
    }),
    toItem: ({ cropEnabled, cropScale, cropTop, headline, ...values }, item) => ({
      ...values,
      // Kept for existing students; empty for new ones → the server makes a unique slug from the name.
      slug: item?.slug ?? "",
      // A stored crop belongs to its photo: replacing the portrait drops it.
      crop:
        cropEnabled && values.portrait?.url === item?.portrait?.url
          ? { scale: Math.round(cropScale * 1000) / 1000, top: Math.round(cropTop * 10) / 1000 }
          : undefined,
      headline: headline || undefined,
      order: item?.order as number,
    }),
  });

  const [name, status, featured] = useWatch({
    control: editor.form.control,
    name: ["name", "status", "featured"],
  });
  const featuredCount = students?.filter((student) => student.featured && student.id !== editor.item?.id).length ?? 0;
  const position = editor.item
    ? (students?.findIndex((student) => student.id === editor.item?.id) ?? -1)
    : (students?.length ?? 0);

  return (
    <EntityEditor
      editor={editor}
      title={editor.isNew ? "Học viên mới" : name || "Học viên"}
      meta={
        <>
          <PublishBadge status={status} />
          {featured ? (
            <StatusPill tone="primary">
              <Star className="size-3 fill-current" /> Tiêu biểu
            </StatusPill>
          ) : null}
        </>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Học viên", href: "/admin/students" },
        { label: editor.isNew ? "Thêm mới" : name || "Chỉnh sửa" },
      ]}
      publicHref={
        editor.item?.slug ? `/academy/students?story=${encodeURIComponent(editor.item.slug)}` : "/academy/students"
      }
      aside={
        <>
          <FormSection title="Xuất bản">
            <PublishStatusField
              label={null}
              publishedHint="Hiển thị trên trang Học viên tiêu biểu."
              draftHint="Ẩn khỏi website, chỉ quản trị viên thấy."
            />
          </FormSection>
          <StoryCardSection index={position >= 0 ? position : 0} />
          <FormSection
            title="Học viên tiêu biểu"
            description={
              <>
                Carousel trên trang Academy · hiện có{" "}
                <span className="text-foreground font-medium">{featuredCount + (featured ? 1 : 0)}</span> học viên.
              </>
            }
          >
            <SwitchField
              name="featured"
              label="Đưa vào carousel Academy"
              description="Hiển thị ảnh, tên và câu trích dẫn trong mục “Học viên tiêu biểu”."
            />
            {featured ? (
              <>
                <TextareaField
                  name="headline"
                  label="Câu trích dẫn"
                  required
                  rows={3}
                  maxLength={160}
                  placeholder="Top 3 Xóm Húc 2024 và Á quân Spin Awards…"
                  description="Một câu về thành tích nổi bật."
                />
                <FeaturedPreview />
              </>
            ) : null}
          </FormSection>
        </>
      }
    >
      <FormSection title="Thông tin học viên">
        <TextField name="name" label="Tên / nghệ danh" required maxLength={40} placeholder="JGRAYSON" />
        <FieldRow>
          <TextField name="role" label="Vai trò" required maxLength={32} placeholder="DJ" />
          <TextField name="affiliation" label="Đơn vị" required placeholder="Hooked Academy" />
        </FieldRow>
      </FormSection>

      <FormSection title="Ảnh chân dung">
        <ImageField name="portrait" required aspect="3/4" folder="students" className="w-full max-w-60" />
      </FormSection>

      <FormSection title="Câu chuyện">
        <RichTextEditorField name="story" placeholder="Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment…" />
      </FormSection>
    </EntityEditor>
  );
}

function useStudentPreviewValues() {
  const [name, role, affiliation, portrait, enabled, scale, top, headline] = useWatch({
    name: ["name", "role", "affiliation", "portrait", "cropEnabled", "cropScale", "cropTop", "headline"],
  }) as [string, string, string, ImageRef | undefined, boolean, number, number, string];
  return {
    name,
    roleLabel: [role, affiliation].filter(Boolean).join(" · "),
    portrait,
    crop: enabled ? { scale: scale || 1, top: (top || 0) / 100 } : undefined,
    headline,
  };
}

function FeaturedPreview() {
  const values = useStudentPreviewValues();
  return (
    <div className="grid gap-1.5">
      <p className="text-muted-foreground text-xs font-medium">Xem trước carousel Academy</p>
      <FeaturedSlidePreview
        name={values.name}
        roleLabel={values.roleLabel}
        headline={values.headline}
        portrait={values.portrait}
      />
    </div>
  );
}

function StoryCardSection({ index }: { index: number }) {
  const values = useStudentPreviewValues();
  return (
    <FormSection title="Xem trước" description="Thẻ câu chuyện trên trang Học viên tiêu biểu.">
      <div className="mx-auto w-full max-w-64 rounded-[18px] bg-[#050101] p-2">
        <StoryCardPreview
          name={values.name}
          roleLabel={values.roleLabel}
          portrait={values.portrait}
          crop={values.crop}
          index={index}
        />
      </div>
    </FormSection>
  );
}
