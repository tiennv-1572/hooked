"use client";

import { ArrowLeftRight, Plus, TextAlignEnd, TextAlignStart } from "lucide-react";
import type { ReactNode } from "react";
import { get, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { FormSection, TextField } from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { Button } from "@/admin/components/ui/button";
import { FieldError } from "@/admin/components/ui/field";
import { createId } from "@/admin/lib/cms/ids";
import type { HomeHighlight, HomePage } from "@/admin/lib/cms/types/pages";
import { cn } from "@/lib/utils";

import { SegmentedField } from "../form-bits";
import { LinkField } from "../link-field";
import { PreviewCard, SiteCanvas, SiteHeading } from "../site-preview";

const POSITION = ["Thẻ trái", "Thẻ phải"];

export function HighlightsTab() {
  const { control, formState } = useFormContext<HomePage>();
  const { fields, swap, append } = useFieldArray({ control, name: "highlights" });
  const arrayError = get(formState.errors, "highlights") as
    { message?: string; root?: { message?: string } } | undefined;
  const message = arrayError?.message ?? arrayError?.root?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {fields.map((field, index) => (
          <FormSection key={field.id} title={POSITION[index] ?? `Thẻ ${index + 1}`}>
            <TextField
              name={`highlights.${index}.title`}
              label="Tiêu đề"
              required
              placeholder="ACADEMY"
              maxLength={14}
            />
            <LinkField name={`highlights.${index}.href`} label="Liên kết" required />
            <SegmentedField
              name={`highlights.${index}.align`}
              label="Vị trí chữ trên desktop"
              options={[
                { value: "start", label: "Bên trái", icon: <TextAlignStart /> },
                { value: "end", label: "Bên phải", icon: <TextAlignEnd /> },
              ]}
            />
            <ImageField name={`highlights.${index}.image`} label="Ảnh nền" required aspect="584/379" folder="home" />
          </FormSection>
        ))}
        {fields.length < 2 ? (
          <Button
            type="button"
            variant="outline"
            className="w-fit border-dashed"
            onClick={() =>
              append({
                id: createId("highlight"),
                title: "",
                href: "",
                align: fields.length ? "start" : "end",
                image: undefined as never,
              })
            }
          >
            <Plus /> Thêm thẻ
          </Button>
        ) : null}
      </div>
      {/* Preview below the two card forms, full width. */}
      <HighlightsPreview
        toolbar={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <FieldError>{message}</FieldError>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              disabled={fields.length < 2}
              onClick={() => swap(0, 1)}
            >
              <ArrowLeftRight /> Đổi vị trí 2 thẻ
            </Button>
          </div>
        }
      />
    </div>
  );
}

/** Desktop layout at full width; sizes follow the site's 584 × 379 card through container units. */
function HighlightsPreview({ toolbar }: { toolbar?: ReactNode }) {
  const items = (useWatch({ name: "highlights" }) as HomeHighlight[] | undefined) ?? [];
  return (
    <PreviewCard href="/" toolbar={toolbar}>
      <SiteCanvas className="flex flex-col gap-5 p-6">
        <SiteHeading>HIGHLIGHT</SiteHeading>
        <div className="grid grid-cols-2 gap-6">
          {items.map((item, index) => {
            const end = item.align === "end";
            return (
              <div key={item.id ?? index} className="@container relative aspect-[584/379] overflow-hidden bg-[#2d2d2d]">
                {item.image?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image.url} alt={item.image.alt} className="absolute inset-0 size-full object-cover" />
                ) : null}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col justify-end p-[4.1cqw]",
                    end ? "items-end text-right" : "items-start",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/brand/hooked-vector.svg" alt="" className="h-auto w-[30.8cqw]" />
                  <span className="mt-[1cqw] text-[8.9cqw] leading-[1.1] font-extrabold uppercase">
                    {item.title || "…"}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={end ? "/icons/turn-left-tile.svg" : "/icons/turn-right-tile.svg"}
                    alt=""
                    className="mt-[1.7cqw] size-[7.5cqw]"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}
