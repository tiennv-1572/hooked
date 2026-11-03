"use client";

import { useWatch } from "react-hook-form";

import { FieldRow, FormSection, StringListField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField, Thumb } from "@/admin/components/cms/image-fields";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { createId } from "@/admin/lib/cms/ids";
import type { HomeService } from "@/admin/lib/cms/types/pages";
import { cn } from "@/lib/utils";

import { TabLayout } from "../editor-tabs";
import { RowTitle } from "../form-bits";
import { LinkField } from "../link-field";
import { PreviewCard, PreviewEmpty, SiteCanvas, SiteHeading } from "../site-preview";

export function ServicesTab() {
  // Preview below the list, full width, every card shown (the site's strip scrolls; here nothing is cut off).
  return (
    <TabLayout>
      <FormSection title="Dịch vụ" description="Khối “OUR SERVICE” trên trang chủ, theo thứ tự này.">
        <RepeaterField<HomeService>
          name="services"
          label="Danh sách dịch vụ"
          addLabel="Thêm dịch vụ"
          duplicable
          newItem={() => ({
            id: createId("service"),
            title: "",
            description: "",
            href: "/projects",
            image: undefined as never,
          })}
          itemLeading={(item) => <Thumb image={item.image} className="h-14 w-[60px] shrink-0 rounded-md" />}
          itemTitle={(item, index) => <RowTitle name={`services.${index}`}>{item.title || "Dịch vụ mới"}</RowTitle>}
          renderItem={(index) => (
            <>
              <FieldRow>
                <TextField name={`services.${index}.title`} label="Tên dịch vụ" required placeholder="MEDIA" />
                <LinkField name={`services.${index}.href`} label="Liên kết" required />
              </FieldRow>
              <StringListField
                name={`services.${index}.titleLines`}
                label="Xuống dòng trên desktop"
                max={3}
                placeholder="ARTISTS MANAGEMENT"
                addLabel="Thêm dòng"
                description="Không bắt buộc. Để trống sẽ dùng tên dịch vụ."
              />
              <TextareaField name={`services.${index}.description`} label="Mô tả" required rows={3} maxLength={220} />
              {/* Smaller inside the open row: half width (the list thumbnail is the quick view). */}
              <ImageField
                name={`services.${index}.image`}
                label="Ảnh"
                required
                aspect="344/320"
                folder="home"
                className="w-full sm:w-1/2"
              />
            </>
          )}
        />
      </FormSection>
      <ServicesPreview />
    </TabLayout>
  );
}

/** Desktop cards (364px on the site) drawn with container units, all visible at once. */
function ServicesPreview() {
  const items = (useWatch({ name: "services" }) as HomeService[] | undefined) ?? [];
  return (
    <PreviewCard href="/">
      <SiteCanvas className="flex flex-col gap-5 bg-[linear-gradient(180deg,#050101_0%,#2b1206_100%)] p-6">
        <SiteHeading>OUR SERVICE</SiteHeading>
        {items.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {items.map((service, index) => {
              const lines = service.titleLines?.filter((line) => line.trim());
              return (
                <div
                  key={service.id ?? index}
                  className={cn(
                    "@container flex flex-col overflow-hidden rounded-[15px] p-2.5",
                    index === 0 ? "bg-[#e55624] text-white" : "bg-[#2a1f19] text-[#e55624]",
                  )}
                >
                  <div className="aspect-[344/320] overflow-hidden rounded-[11px] bg-black/30">
                    {service.image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={service.image.url} alt={service.image.alt} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-col items-center gap-[2.2cqw] px-[6cqw] py-[2.75cqw] text-center">
                    <p className="font-sans text-[5.5cqw] leading-tight font-bold uppercase">
                      {lines?.length
                        ? lines.map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))
                        : service.title || "…"}
                    </p>
                    <p className="font-sans text-[3.3cqw] leading-snug">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <PreviewEmpty>Chưa có dịch vụ</PreviewEmpty>
        )}
      </SiteCanvas>
    </PreviewCard>
  );
}
