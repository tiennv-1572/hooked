"use client";

import { Images, Info, Network } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { FieldRow, FormSection, StringListField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import { createId } from "@/admin/lib/cms/ids";
import type { AboutCapability, AboutPage } from "@/admin/lib/cms/types/pages";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

import { EditorTabs, TabLayout } from "./editor-tabs";
import { RowTitle } from "./form-bits";
import { LinkField } from "./link-field";
import { PreviewCard, SiteCanvas } from "./site-preview";
import { aboutSchema } from "./site-schemas";

type PhotoBlock = keyof AboutPage["photos"];

/** The two photo blocks of /about: their slots in order, with the shape each photo has on the website. */
const PHOTO_BLOCKS: Record<
  PhotoBlock,
  { title: string; description: string; slots: { label: string; aspect: string }[] }
> = {
  top: {
    title: "Khối ảnh trên",
    description: "Hiển thị ngay sau phần mở đầu.",
    slots: [
      { label: "Ảnh lớn", aspect: "3/2" },
      { label: "Ảnh ngang", aspect: "3/2" },
      { label: "Ảnh dọc trái", aspect: "2/3" },
      { label: "Ảnh dọc phải", aspect: "2/3" },
    ],
  },
  bottom: {
    title: "Khối ảnh dưới",
    description: "Hiển thị sau phần hệ sinh thái, cuối trang.",
    slots: [
      { label: "Ảnh lớn", aspect: "3/2" },
      { label: "Ảnh dọc", aspect: "2/3" },
      { label: "Ảnh ngang trái", aspect: "3/2" },
      { label: "Ảnh ngang phải", aspect: "3/2" },
    ],
  },
};

/** `/admin/pages/about` — intro, ecosystem (capabilities + portfolio) and the two photo blocks. */
export function AboutPageEditor() {
  const editor = useSingletonEditor("aboutPage", aboutSchema);
  return (
    <SingletonEditor editor={editor} title="Trang About">
      <AboutTabs />
    </SingletonEditor>
  );
}

function AboutTabs() {
  const { control } = useFormContext<AboutPage>();
  const [capabilities, photos] = useWatch({ control, name: ["ecosystem.capabilities", "photos"] });
  const photoCount = [...(photos?.top ?? []), ...(photos?.bottom ?? [])].filter((photo) => photo?.url).length;
  return (
    <EditorTabs
      tabs={[
        { value: "intro", label: "Mở đầu", icon: Info, fields: ["intro"], content: <IntroTab /> },
        {
          value: "ecosystem",
          label: "Hệ sinh thái",
          icon: Network,
          fields: ["ecosystem", "portfolio"],
          count: capabilities?.length,
          content: <EcosystemTab />,
        },
        {
          value: "photos",
          label: "Hình ảnh",
          icon: Images,
          fields: ["photos"],
          count: photoCount,
          content: <PhotosTab />,
        },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------

function IntroTab() {
  return (
    <TabLayout preview={<IntroPreview />}>
      <FormSection title="Tiêu đề">
        <FieldRow>
          <TextField name="intro.title" label="Tiêu đề trang" required placeholder="ABOUT HOOKED" />
          <TextField name="intro.eyebrow" label="Dòng nhãn cam (mobile)" placeholder="SUPPORT LOCAL ARTIST" />
        </FieldRow>
        <TextareaField name="intro.lead" label="Câu mở đầu" required rows={3} maxLength={140} />
      </FormSection>
      <FormSection title="Câu chuyện">
        <FieldRow>
          <TextField name="intro.headlineLines.0" label="Tiêu đề nhỏ — dòng 1" required placeholder="TỪ TINH THẦN" />
          <TextField
            name="intro.headlineLines.1"
            label="Tiêu đề nhỏ — dòng 2"
            required
            placeholder="SUPPORT LOCAL ARTIST"
          />
        </FieldRow>
        <TextareaField name="intro.body" label="Đoạn chính" required rows={5} />
        <TextareaField name="intro.aside" label="Đoạn phụ" rows={3} description="Không bắt buộc." />
      </FormSection>
    </TabLayout>
  );
}

function IntroPreview() {
  const intro = useWatch({ name: "intro" }) as AboutPage["intro"] | undefined;
  return (
    <PreviewCard href="/about">
      <SiteCanvas className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-[9px] font-bold uppercase">{intro?.title}</p>
          {intro?.eyebrow ? <p className="text-[7px] font-bold text-[#e55624] uppercase">{intro.eyebrow}</p> : null}
        </div>
        <p className="text-lg leading-[1.2] font-bold">
          {intro?.lead || <span className="text-white/30">Câu mở đầu…</span>}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <p className="text-[7px] leading-tight font-bold uppercase">
              <span className="block">{intro?.headlineLines?.[0]}</span>
              <span className="block text-[8px]">{intro?.headlineLines?.[1]}</span>
            </p>
            <p className="line-clamp-[10] text-[8px] leading-snug">{intro?.body}</p>
          </div>
          <p className="line-clamp-[10] pt-5 text-[8px] leading-snug text-[#ccc]">{intro?.aside}</p>
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}

// ---------------------------------------------------------------------------------------------------------

function EcosystemTab() {
  return (
    <TabLayout preview={<EcosystemPreview />}>
      <FormSection title="Hệ sinh thái" description="Khối “Một hệ sinh thái cho nghệ sĩ Việt”.">
        <StringListField
          name="ecosystem.titleLines"
          label="Tiêu đề nhỏ"
          required
          max={3}
          placeholder="MỘT HỆ SINH THÁI"
        />
        <TextareaField name="ecosystem.statement" label="Câu tuyên bố" required rows={4} />
        <TextareaField name="ecosystem.body" label="Đoạn mô tả" required rows={4} />
      </FormSection>
      <FormSection title="Năng lực">
        <RepeaterField<AboutCapability>
          name="ecosystem.capabilities"
          label="Danh sách"
          addLabel="Thêm năng lực"
          newItem={() => ({ id: createId("capability"), lead: "", rest: "" })}
          itemTitle={(item, index) => (
            <RowTitle name={`ecosystem.capabilities.${index}`}>
              <span className="font-semibold">{item.lead || "Năng lực mới"}</span>
              <span className="text-muted-foreground font-normal">{item.rest}</span>
            </RowTitle>
          )}
          renderItem={(index) => (
            <>
              <TextField
                name={`ecosystem.capabilities.${index}.lead`}
                label="Phần in đậm"
                required
                placeholder="Đào tạo chuyên môn & định hướng hình ảnh"
              />
              <TextField
                name={`ecosystem.capabilities.${index}.rest`}
                label="Phần tiếp theo"
                placeholder="DJ, MC Hype & Music Producer."
                description="Nối liền sau phần in đậm — tự thêm khoảng trắng nếu cần."
              />
              <LinkField
                name={`ecosystem.capabilities.${index}.href`}
                label="Liên kết của phần in đậm"
                placeholder="Không bắt buộc"
              />
            </>
          )}
        />
      </FormSection>
      <FormSection title="Portfolio" description="Liên kết dưới đoạn mô tả, ví dụ file PDF trên Google Drive.">
        <FieldRow>
          <TextField name="portfolio.label" label="Nhãn" required placeholder="Xem full portfolio" />
          <LinkField name="portfolio.href" label="Liên kết" required sources={["pages", "projects"]} />
        </FieldRow>
      </FormSection>
    </TabLayout>
  );
}

function EcosystemPreview() {
  const [ecosystem, portfolio] = useWatch({ name: ["ecosystem", "portfolio"] }) as [
    AboutPage["ecosystem"] | undefined,
    AboutPage["portfolio"] | undefined,
  ];
  return (
    <PreviewCard href="/about">
      <SiteCanvas className="flex flex-col gap-3 p-5">
        <p className="text-[8px] leading-tight font-bold uppercase">
          {(ecosystem?.titleLines ?? []).map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </p>
        <p className="text-[13px] leading-snug font-bold">{ecosystem?.statement}</p>
        <div className="grid grid-cols-[2fr_3fr] gap-3">
          <div className="flex flex-col gap-2">
            <p className="line-clamp-[9] text-[7px] leading-snug">{ecosystem?.body}</p>
            {portfolio?.label ? <p className="text-[8px] font-bold text-[#e55624]">{portfolio.label}</p> : null}
          </div>
          <ol className="flex flex-col gap-1.5">
            {(ecosystem?.capabilities ?? []).map((item, index) => (
              <li key={item.id ?? index} className="grid grid-cols-[14px_1fr] text-[7px] leading-snug">
                <span className="text-[#e55624]">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong className={cn("font-bold", item.href && "underline decoration-white/30 underline-offset-2")}>
                    {item.lead}
                  </strong>
                  <span className="text-[#ccc]">{item.rest}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}

// ---------------------------------------------------------------------------------------------------------

function PhotosTab() {
  return (
    <div className="flex flex-col gap-6">
      <PhotoBlockSection block="top" />
      <PhotoBlockSection block="bottom" />
    </div>
  );
}

function PhotoBlockSection({ block }: { block: PhotoBlock }) {
  const { title, description, slots } = PHOTO_BLOCKS[block];
  return (
    <FormSection title={title} description={description}>
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <PhotoBlockPreview block={block} />
        <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-4">
          {slots.map((slot, index) => (
            <ImageField
              key={index}
              name={`photos.${block}.${index}`}
              label={`${index + 1} · ${slot.label}`}
              required
              aspect={slot.aspect}
              folder="about"
            />
          ))}
        </div>
      </div>
    </FormSection>
  );
}

/** The block as composed on the website (desktop), each tile numbered like its field. */
function PhotoBlockPreview({ block }: { block: PhotoBlock }) {
  const photos = (useWatch({ name: `photos.${block}` }) as (ImageRef | undefined)[] | undefined) ?? [];
  const tile = (index: number, className: string) => (
    <div className={cn("relative overflow-hidden bg-[#1a1a1a]", className)}>
      {photos[index]?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photos[index].url} alt="" className="size-full object-cover" />
      ) : null}
      <span className="absolute top-1 left-1 flex size-4 items-center justify-center rounded-full bg-black/70 text-[9px] font-semibold text-white">
        {index + 1}
      </span>
    </div>
  );
  return (
    <PreviewCard href="/about">
      <SiteCanvas className="p-3">
        {block === "top" ? (
          <div className="grid grid-cols-[905fr_204fr_204fr] gap-1">
            {tile(0, "row-span-2")}
            {tile(1, "col-span-2 aspect-[3/2]")}
            {tile(2, "aspect-[2/3]")}
            {tile(3, "aspect-[2/3]")}
          </div>
        ) : (
          <div className="grid grid-cols-[664fr_239fr_409fr] gap-1">
            {tile(0, "col-span-2 aspect-[3/2]")}
            {tile(1, "")}
            {tile(2, "aspect-[3/2]")}
            {tile(3, "col-span-2")}
          </div>
        )}
      </SiteCanvas>
    </PreviewCard>
  );
}
