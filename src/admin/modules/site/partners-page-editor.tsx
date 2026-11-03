"use client";

import { FormSection, TextareaField } from "@/admin/components/cms/form-fields";
import { RichTextEditorField } from "@/admin/components/cms/rich-text-editor";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";

import { PartnerCollaborationsField } from "./partner-collaborations";
import { PartnerLogosPanel } from "./partner-logos";
import { partnersPageSchema } from "./site-schemas";

/** `/admin/pages/partners` — intro copy, logo wall (from the Đối tác collection) and the collaboration cards. */
export function PartnersPageEditor() {
  const editor = useSingletonEditor("partnersPage", partnersPageSchema);
  return (
    <SingletonEditor editor={editor} title="Trang Partners" description="Logo đối tác được quản lý ở mục Đối tác.">
      <FormSection title="Giới thiệu">
        <TextareaField name="title" label="Tiêu đề" required rows={2} maxLength={90} />
        <RichTextEditorField
          name="body"
          label="Nội dung"
          required
          placeholder="Giới thiệu về các đối tác của Hooked…"
        />
      </FormSection>
      <FormSection title="Lưới logo">
        <PartnerLogosPanel placement="partners" />
      </FormSection>
      <FormSection title="Dự án hợp tác">
        <PartnerCollaborationsField />
      </FormSection>
    </SingletonEditor>
  );
}
