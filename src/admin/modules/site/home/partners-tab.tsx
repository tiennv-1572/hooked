"use client";

import { useWatch } from "react-hook-form";

import { FieldRow, FormSection, StringListField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import type { HomePage } from "@/admin/lib/cms/types/pages";

import { TabLayout } from "../editor-tabs";
import { LinkField } from "../link-field";
import { LogoRow, usePlacedPartners } from "../partner-logos";
import { PreviewCard, SiteArrow, SiteCanvas } from "../site-preview";

export function PartnersTab() {
  return (
    <TabLayout preview={<PartnersPreview />}>
      <FormSection
        title="Lời giới thiệu"
        description="Khối “đồng hành cùng các thương hiệu lớn” phía trên dải logo chạy ngang."
      >
        <StringListField
          name="partners.titleLines"
          label="Tiêu đề"
          required
          max={4}
          placeholder="HOOKED ENTERTAINMENT"
        />
        <TextareaField name="partners.body" label="Nội dung" required rows={5} maxLength={480} />
      </FormSection>
      <FormSection title="Nút kêu gọi" description="Nút bên dưới dải logo.">
        <FieldRow>
          <TextField name="partners.cta.label" label="Nhãn nút" required placeholder="Đối tác của Hooked" />
          <LinkField name="partners.cta.href" label="Liên kết" required />
        </FieldRow>
      </FormSection>
    </TabLayout>
  );
}

function PartnersPreview() {
  const section = useWatch({ name: "partners" }) as HomePage["partners"] | undefined;
  const { partners } = usePlacedPartners("home");
  const lines = (section?.titleLines ?? []).filter((line) => line.trim());
  return (
    <PreviewCard href="/">
      <SiteCanvas className="bg-[linear-gradient(180deg,#1a1a1a_0%,#1a1a1a_36%,#0d0402_72%,#240a05_100%)] px-4 pt-6 pb-5">
        <div className="grid gap-3">
          <p className="text-lg leading-[1.15] font-extrabold uppercase">
            {lines.length ? (
              lines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span className="text-white/30">TIÊU ĐỀ</span>
            )}
          </p>
          <p className="line-clamp-6 text-[9px] leading-snug text-[#ccc]">{section?.body}</p>
        </div>
        <LogoRow
          partners={partners}
          className="mt-5 [mask-image:linear-gradient(90deg,transparent_0,#000_8%,#000_92%,transparent_100%)]"
          logoClassName="h-5"
        />
        {section?.cta?.label ? (
          <div className="mt-5 flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#100c0a] text-[10px] font-bold text-[#fff4e9]">
            {section.cta.label} <SiteArrow className="size-3" />
          </div>
        ) : null}
      </SiteCanvas>
    </PreviewCard>
  );
}
