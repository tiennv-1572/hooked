"use client";

import { useWatch } from "react-hook-form";
import { z } from "zod";

import { FormSection, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { requiredText } from "@/admin/lib/cms/schemas";

/** `seo` of the page singletons whose CMS screen is SEO only (Academy, Học viên tiêu biểu, Projects, Blog). */
export const seoSchema = z.object({
  title: requiredText("Nhập tiêu đề SEO.").max(70, "Tối đa 70 ký tự."),
  description: requiredText("Nhập mô tả SEO.").max(200, "Tối đa 200 ký tự."),
});

/** SEO fields + a search-result snippet preview. */
export function SeoSection({ path }: { path: string }) {
  const [title, description] = useWatch({ name: ["seo.title", "seo.description"] }) as [
    string | undefined,
    string | undefined,
  ];
  return (
    <FormSection
      title="SEO"
      description="Tiêu đề và mô tả khi trang xuất hiện trên Google hoặc được chia sẻ lên mạng xã hội."
    >
      <TextField
        name="seo.title"
        label="Tiêu đề SEO"
        required
        maxLength={50}
        description="Website tự thêm “· Hooked Entertainment” phía sau."
      />
      <TextareaField name="seo.description" label="Mô tả SEO" required rows={3} maxLength={160} />
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium">Xem trước kết quả tìm kiếm</p>
        <p className="text-muted-foreground truncate text-xs">hooked.vn{path}</p>
        <p className="truncate text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
          {title ? `${title} · Hooked Entertainment` : "Tiêu đề trang"}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-sm">{description || "Mô tả trang…"}</p>
      </div>
    </FormSection>
  );
}
