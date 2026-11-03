"use client";

import { useParams } from "next/navigation";
import { useWatch } from "react-hook-form";
import { z } from "zod";

import { EntityEditor, useEntityEditor } from "@/admin/components/cms/entity-editor";
import { FormSection, SwitchField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField, Thumb } from "@/admin/components/cms/image-fields";
import { imageRefSchema } from "@/admin/lib/cms/schemas";

/**
 * REFERENCE MODULE — editor pattern for every collection item:
 * zod schema → useEntityEditor (load/create/update/delete/duplicate) → <EntityEditor> with sections + aside.
 */
const schema = z.object({
  name: z.string().trim().min(1, "Nhập tên đối tác."),
  logo: imageRefSchema("Chọn logo."),
  website: z.union([z.literal(""), z.url("Đường dẫn không hợp lệ.")]).optional(),
  showOnHome: z.boolean(),
  showOnPartnersPage: z.boolean(),
});
type PartnerForm = z.infer<typeof schema>;

export function PartnerEditor() {
  const { id } = useParams<{ id: string }>();
  const editor = useEntityEditor({
    collection: "partners",
    id,
    schema,
    basePath: "/admin/partners",
    empty: (): PartnerForm => ({
      name: "",
      logo: undefined as never,
      website: "",
      showOnHome: true,
      showOnPartnersPage: true,
    }),
    toForm: (item) => ({
      name: item.name,
      logo: item.logo,
      website: item.website ?? "",
      showOnHome: item.showOnHome,
      showOnPartnersPage: item.showOnPartnersPage,
    }),
    toItem: (values, item) => ({
      ...values,
      website: values.website || undefined,
      order: item?.order ?? Number.MAX_SAFE_INTEGER,
    }),
  });

  const name = useWatch({ control: editor.form.control, name: "name" });

  return (
    <EntityEditor
      editor={editor}
      title={editor.isNew ? "Đối tác mới" : name || "Đối tác"}
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Đối tác", href: "/admin/partners" },
        { label: editor.isNew ? "Thêm mới" : name || "Chỉnh sửa" },
      ]}
      publicHref="/partners"
      aside={
        <>
          <FormSection title="Hiển thị">
            <SwitchField name="showOnHome" label="Dải logo trang chủ" description="Logo chạy ngang ở cuối trang chủ." />
            <SwitchField name="showOnPartnersPage" label="Trang Partners" />
          </FormSection>
          <LogoPreview />
        </>
      }
    >
      <FormSection title="Thông tin đối tác">
        <TextField name="name" label="Tên đối tác" required placeholder="Sun Group" />
        <TextField name="website" label="Website" type="url" placeholder="https://…" description="Không bắt buộc." />
        <ImageField
          name="logo"
          label="Logo"
          required
          aspect="3/1"
          folder="partners"
          previewBg="dark"
          description="Nên dùng logo màu trắng, nền trong suốt."
        />
      </FormSection>
    </EntityEditor>
  );
}

/** How the logo looks on the site's dark background. */
function LogoPreview() {
  const logo = useWatch({ name: "logo" });
  return (
    <FormSection title="Xem trước">
      <div className="flex h-28 items-center justify-center rounded-lg bg-[#050101] p-6">
        {logo?.url ? (
          <Thumb image={logo} fit="contain" checker={false} className="max-h-14 w-full" />
        ) : (
          <span className="text-xs text-white/50">Chưa có logo</span>
        )}
      </div>
    </FormSection>
  );
}
