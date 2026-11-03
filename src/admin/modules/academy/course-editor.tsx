"use client";

import { useParams } from "next/navigation";
import { Controller, get, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { EntityEditor, useEntityEditor } from "@/admin/components/cms/entity-editor";
import {
  FieldRow,
  FormSection,
  SelectField,
  StringListField,
  TextareaField,
  TextField,
} from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { PublishBadge, StatusPill } from "@/admin/components/cms/status-badge";
import { Field, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { imageRefSchema, publishStatusSchema, requiredText } from "@/admin/lib/cms/schemas";
import type { InfoLine } from "@/admin/lib/cms/types/academy";

import { PublishStatusField, useCourseCategories } from "./shared";

const lineList = (message: string) => z.array(z.string()).refine((list) => list.some((line) => line.trim()), message);

const courseSchema = z.object({
  id: z.string().optional(),
  title: requiredText("Nhập tên khóa học.").max(60, "Tối đa 60 ký tự."),
  categoryId: requiredText("Chọn danh mục."),
  description: requiredText("Nhập mô tả khóa học.").max(600, "Mô tả tối đa 600 ký tự."),
  instructors: z
    .array(z.object({ label: requiredText("Nhập vai trò."), value: requiredText("Nhập tên giảng viên.") }))
    .min(1, "Thêm ít nhất 1 giảng viên."),
  duration: requiredText("Nhập lộ trình (ví dụ: Từ 2 đến 3 tháng)."),
  schedule: z
    .array(z.object({ label: z.string(), value: requiredText("Nhập nội dung dòng.") }))
    .min(1, "Thêm ít nhất 1 dòng giờ học."),
  tuition: requiredText("Nhập học phí."),
  modules: lineList("Thêm ít nhất 1 học phần."),
  benefits: lineList("Thêm ít nhất 1 quyền lợi."),
  image: imageRefSchema("Chọn ảnh khóa học."),
  zoomTopLeft: z.boolean(),
  status: publishStatusSchema,
});
type CourseForm = z.infer<typeof courseSchema>;

const clean = (list: string[]) => list.map((line) => line.trim()).filter(Boolean);

export function CourseEditor() {
  const { id } = useParams<{ id: string }>();

  const editor = useEntityEditor({
    collection: "courses",
    id,
    schema: courseSchema,
    basePath: "/admin/courses",
    empty: (): CourseForm => ({
      id: undefined,
      title: "",
      categoryId: "",
      description: "",
      instructors: [{ label: "Giảng viên chính", value: "" }],
      duration: "",
      schedule: [{ label: "", value: "" }],
      tuition: "",
      modules: [""],
      benefits: [""],
      image: undefined as never,
      zoomTopLeft: false,
      status: "draft",
    }),
    toForm: (item) => ({
      id: item.id,
      title: item.title,
      categoryId: item.categoryId,
      description: item.description,
      instructors: item.instructors.map((line) => ({ ...line })),
      duration: item.duration,
      schedule: item.schedule.map((line) => ({ label: line.label ?? "", value: line.value })),
      tuition: item.tuition,
      modules: [...item.modules],
      benefits: [...item.benefits],
      image: item.image,
      zoomTopLeft: Boolean(item.zoomTopLeft),
      status: item.status,
    }),
    toItem: (values, item) => ({
      ...values,
      schedule: values.schedule.map((line): InfoLine =>
        line.label.trim() ? { label: line.label.trim(), value: line.value.trim() } : { value: line.value.trim() },
      ),
      modules: clean(values.modules),
      benefits: clean(values.benefits),
      // Hidden legacy option tied to the current photo: replacing the image drops it.
      zoomTopLeft: (values.zoomTopLeft && values.image?.url === item?.image?.url) || undefined,
      // New courses go last in the carousel (the adapter assigns max + 1 when order is missing).
      order: item?.order as number,
    }),
  });

  const [title, status, categoryId] = useWatch({
    control: editor.form.control,
    name: ["title", "status", "categoryId"],
  });
  const categoryLabel = useCourseCategories().labelOf(categoryId);

  return (
    <EntityEditor
      editor={editor}
      title={editor.isNew ? "Khóa học mới" : title || "Khóa học"}
      meta={
        <>
          <PublishBadge status={status} />
          {categoryLabel ? <StatusPill tone="info">{categoryLabel}</StatusPill> : null}
        </>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Khóa học", href: "/admin/courses" },
        { label: editor.isNew ? "Thêm mới" : title || "Chỉnh sửa" },
      ]}
      publicHref="/academy"
      aside={
        <>
          <FormSection title="Xuất bản">
            <PublishStatusField
              label={null}
              publishedHint="Hiển thị ở carousel và danh sách khóa học, có trong form đăng ký."
              draftHint="Ẩn khỏi trang Academy, chỉ quản trị viên thấy."
            />
          </FormSection>
          <CategorySection />
        </>
      }
    >
      <FormSection title="Ảnh khóa học">
        <ImageField name="image" required aspect="16/9" folder="academy" />
      </FormSection>
      <FormSection title="Thông tin chung">
        <TextField name="title" label="Tên khóa học" required maxLength={60} placeholder="DJ cơ bản" />
        <TextareaField
          name="description"
          label="Mô tả"
          required
          rows={4}
          maxLength={400}
          placeholder="Khoá học dành cho những bạn muốn…"
        />
        <TuitionField />
      </FormSection>

      <FormSection title="Giảng viên & lịch học">
        <RepeaterField<{ label: string; value: string }>
          name="instructors"
          label="Giảng viên"
          newItem={() => ({ label: "Trợ giảng", value: "" })}
          itemTitle={(line) => (line.value ? `${line.label || "Giảng viên"}: ${line.value}` : "Giảng viên mới")}
          addLabel="Thêm giảng viên"
          max={6}
          defaultExpanded
          renderItem={(index) => (
            <FieldRow>
              <TextField name={`instructors.${index}.label`} label="Vai trò" required placeholder="Giảng viên chính" />
              <TextField name={`instructors.${index}.value`} label="Tên" required placeholder="Marcuz" />
            </FieldRow>
          )}
        />
        <ArrayRootError name="instructors" />
        <TextField name="duration" label="Lộ trình" required placeholder="Từ 2 đến 3 tháng" />
        <RepeaterField<{ label: string; value: string }>
          name="schedule"
          label="Giờ học"
          newItem={() => ({ label: "", value: "" })}
          itemTitle={(line) => (line.value ? (line.label ? `${line.label}: ${line.value}` : line.value) : "Dòng mới")}
          addLabel="Thêm dòng giờ học"
          max={6}
          defaultExpanded
          renderItem={(index) => (
            <FieldRow className="sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <TextField name={`schedule.${index}.label`} label="Nhãn (không bắt buộc)" placeholder="Thời lượng" />
              <TextField name={`schedule.${index}.value`} label="Nội dung" required placeholder="1 tiếng/ca" />
            </FieldRow>
          )}
        />
        <ArrayRootError name="schedule" />
      </FormSection>

      <FormSection title="Chương trình học">
        <StringListField name="modules" placeholder="Mixing cơ bản" addLabel="Thêm học phần" max={20} />
      </FormSection>

      <FormSection title="Quyền lợi">
        <StringListField name="benefits" placeholder="Học 1:1 cùng với giảng viên" addLabel="Thêm quyền lợi" max={12} />
      </FormSection>
    </EntityEditor>
  );
}

/** Tuition: free text, but bare numbers are formatted as "15.000.000 VND" on blur. */
function TuitionField() {
  const { control, formState } = useFormContext();
  const error = get(formState.errors, "tuition") as { message?: string } | undefined;
  return (
    <Controller
      control={control}
      name="tuition"
      render={({ field }) => (
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="tuition">
            Học phí<span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="tuition"
            inputMode="numeric"
            placeholder="15.000.000 VND"
            aria-invalid={error ? true : undefined}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={() => {
              const digits = String(field.value ?? "").replace(/[.,\s]/g, "");
              if (/^\d{4,}$/.test(digits)) field.onChange(`${Number(digits).toLocaleString("vi-VN")} VND`);
              field.onBlur();
            }}
            ref={field.ref}
            className="sm:max-w-64"
          />
          <FieldError>{error?.message}</FieldError>
        </Field>
      )}
    />
  );
}

/** Root-level error of an array field (min items) — RepeaterField only shows per-row errors. */
function ArrayRootError({ name }: { name: string }) {
  const { formState } = useFormContext();
  const error = get(formState.errors, name) as { message?: string; root?: { message?: string } } | undefined;
  const message = error?.message ?? error?.root?.message;
  return message ? <p className="text-destructive -mt-3 text-sm">{message}</p> : null;
}

function CategorySection() {
  const { options } = useCourseCategories();
  return (
    <FormSection title="Phân loại">
      <SelectField name="categoryId" label="Danh mục" required placeholder="Chọn danh mục" options={options} />
    </FormSection>
  );
}
