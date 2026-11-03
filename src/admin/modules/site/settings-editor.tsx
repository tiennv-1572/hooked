"use client";

import { Building2, ExternalLink, Globe, Phone, Plus, Search, Share2, Trash2 } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { get, useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";

import { FieldRow, FormSection, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import { DragHandle, SortableList, type DragHandleProps } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Switch } from "@/admin/components/ui/switch";
import { useSingleton } from "@/admin/lib/cms/hooks";
import { createId } from "@/admin/lib/cms/ids";
import type { SiteSettings } from "@/admin/lib/cms/types/pages";
import { cn } from "@/lib/utils";

import { EditorTabs, TabLayout } from "./editor-tabs";
import { PreviewCard, SiteCanvas } from "./site-preview";
import { phoneToHref } from "./site-routes";
import { settingsSchema } from "./site-schemas";
import { detectPlatform, SOCIAL_PLATFORMS, SocialIcon } from "./social-icons";

/** `/admin/settings` — site identity, company & contact details, social links and SEO defaults. */
export function SettingsEditor() {
  const editor = useSingletonEditor("settings", settingsSchema);
  return (
    <SingletonEditor
      editor={editor}
      title="Cài đặt website"
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Cài đặt website" }]}
      description="Thông tin dùng chung cho toàn website: header, footer, trang Contact và thẻ chia sẻ mạng xã hội."
    >
      <SettingsTabs />
    </SingletonEditor>
  );
}

function SettingsTabs() {
  const socials = useWatch({ name: "socials" }) as SiteSettings["socials"] | undefined;
  return (
    <EditorTabs
      tabs={[
        {
          value: "general",
          label: "Thông tin chung",
          icon: Globe,
          fields: ["siteName", "tagline", "description"],
          content: <GeneralTab />,
        },
        { value: "company", label: "Công ty & liên hệ", icon: Building2, fields: ["company"], content: <CompanyTab /> },
        {
          value: "socials",
          label: "Mạng xã hội",
          icon: Share2,
          fields: ["socials"],
          count: socials?.length,
          content: <SocialsTab />,
        },
        { value: "seo", label: "SEO", icon: Search, fields: ["seo"], content: <SeoTab /> },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------
// General

function GeneralTab() {
  return (
    <TabLayout preview={<SearchPreviewCard />}>
      <FormSection title="Nhận diện" description="Dùng trong kết quả tìm kiếm Google và khi chia sẻ lên mạng xã hội.">
        <FieldRow>
          <TextField name="siteName" label="Tên website" required placeholder="Hooked Entertainment" />
          <TextField name="tagline" label="Khẩu hiệu" placeholder="Support Local Artists" />
        </FieldRow>
        <TextareaField
          name="description"
          label="Mô tả"
          required
          rows={3}
          maxLength={160}
          description="Mô tả mặc định khi một trang không có mô tả riêng."
        />
      </FormSection>
    </TabLayout>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Company & contact

function CompanyTab() {
  return (
    <TabLayout preview={<FooterPreviewCard />}>
      <FormSection title="Công ty" description="Hiển thị ở footer và cột Địa chỉ của trang Contact.">
        <TextField
          name="company.legalName"
          label="Tên pháp lý"
          required
          placeholder="CÔNG TY TNHH HOOKED ENTERTAINMENT"
        />
        <TextareaField name="company.address" label="Địa chỉ" required rows={2} />
      </FormSection>
      <FormSection title="Liên hệ">
        <TextField name="company.email" label="Email" type="email" required placeholder="hooked.vie@gmail.com" />
        <PhoneFields />
      </FormSection>
    </TabLayout>
  );
}

/** Display number + tel: link derived automatically (with a manual override). */
function PhoneFields() {
  const { control, register, setValue, getValues, formState } = useFormContext<SiteSettings>();
  const display = useWatch({ control, name: "company.phoneDisplay" }) ?? "";
  const derived = phoneToHref(display);
  const [auto, setAuto] = useState(() => {
    const href = getValues("company.phoneHref");
    return !href || href === phoneToHref(getValues("company.phoneDisplay") ?? "");
  });
  const message = (get(formState.errors, "company.phoneHref") as { message?: string } | undefined)?.message;
  const isSubmitted = formState.isSubmitted;

  useEffect(() => {
    if (auto && derived !== getValues("company.phoneHref")) {
      setValue("company.phoneHref", derived, { shouldDirty: true, shouldValidate: isSubmitted });
    }
  }, [auto, derived, getValues, setValue, isSubmitted]);

  return (
    <FieldRow>
      <TextField
        name="company.phoneDisplay"
        label="Số điện thoại"
        required
        placeholder="0966 609 807"
        description="Viết như muốn hiển thị."
      />
      <Field data-invalid={message ? true : undefined}>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="company.phoneHref">Liên kết gọi</FieldLabel>
          <label className="text-muted-foreground flex items-center gap-2 text-xs">
            Tự động
            <Switch size="sm" checked={auto} onCheckedChange={setAuto} aria-label="Tạo liên kết gọi tự động" />
          </label>
        </div>
        <div className="relative">
          <Phone className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            id="company.phoneHref"
            readOnly={auto}
            aria-invalid={message ? true : undefined}
            className={cn("pl-8 font-mono text-[13px]", auto && "text-muted-foreground bg-muted/50")}
            placeholder="tel:+84966609807"
            {...register("company.phoneHref")}
          />
        </div>
        <FieldDescription>
          {auto ? "Tạo từ số điện thoại. Tắt “Tự động” để nhập tay." : "Nhập dạng tel:+84… — chỉ gồm chữ số."}
        </FieldDescription>
        <FieldError>{message}</FieldError>
      </Field>
    </FieldRow>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Socials

function SocialsTab() {
  const { control, setFocus } = useFormContext<SiteSettings>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "socials" });
  const socials = (useWatch({ control, name: "socials" }) as SiteSettings["socials"] | undefined) ?? [];
  const used = new Set(socials.map((social) => detectPlatform(social.href, social.label)?.key).filter(Boolean));
  const suggestions = SOCIAL_PLATFORMS.filter((platform) => !used.has(platform.key));

  const add = (label = "", href = "") => {
    append({ id: createId("social"), label, href });
    requestAnimationFrame(() => setFocus(`socials.${fields.length}.${label ? "href" : "label"}`));
  };

  return (
    <TabLayout preview={<FooterPreviewCard highlight="social" />}>
      <FormSection
        title="Mạng xã hội"
        description="Hiển thị ở footer và trang Contact theo thứ tự này."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => add()}>
            <Plus /> Thêm liên kết
          </Button>
        }
      >
        {fields.length ? (
          <SortableList
            items={fields}
            getId={(field) => field.id}
            onReorder={(_, from, to) => move(from, to)}
            renderItem={(field, index, handle) => (
              <SocialRow key={field.id} index={index} handle={handle} onRemove={() => remove(index)} />
            )}
          />
        ) : (
          <Empty className="border border-dashed py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Share2 />
              </EmptyMedia>
              <EmptyTitle>Chưa có mạng xã hội</EmptyTitle>
              <EmptyDescription>Thêm Facebook, Instagram, TikTok… để hiện ở footer.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {suggestions.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground mr-1 text-xs">Thêm nhanh:</span>
            {suggestions.map((platform) => (
              <button
                key={platform.key}
                type="button"
                onClick={() => add(platform.name, "")}
                className="hover:border-primary hover:text-primary inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1 text-xs transition-colors"
              >
                <SocialIcon label={platform.key} className="size-5 rounded-full p-1" />
                {platform.name}
              </button>
            ))}
          </div>
        ) : null}
      </FormSection>
    </TabLayout>
  );
}

function SocialRow({ index, handle, onRemove }: { index: number; handle: DragHandleProps; onRemove: () => void }) {
  const { control, register, getValues, setValue } = useFormContext<SiteSettings>();
  const { errors } = useFormState({ control, name: `socials.${index}` });
  const [label, href] = useWatch({ control, name: [`socials.${index}.label`, `socials.${index}.href`] });
  const labelError = (get(errors, `socials.${index}.label`) as { message?: string } | undefined)?.message;
  const hrefError = (get(errors, `socials.${index}.href`) as { message?: string } | undefined)?.message;
  const platform = detectPlatform(href, label);

  return (
    <div className="flex items-start gap-2 rounded-lg border bg-card p-2">
      <DragHandle {...handle} className="mt-1" />
      <SocialIcon href={href} label={label} className="mt-0.5 size-7 p-1.5 sm:size-8 sm:p-[7px]" />
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
        <div className="grid gap-1">
          <Input
            placeholder="Tên (Facebook)"
            aria-label="Tên mạng xã hội"
            aria-invalid={labelError ? true : undefined}
            {...register(`socials.${index}.label`)}
          />
          {labelError ? <p className="text-destructive text-xs">{labelError}</p> : null}
        </div>
        <div className="grid gap-1">
          <Input
            type="url"
            placeholder={platform?.example ?? "https://…"}
            aria-label="Đường dẫn"
            aria-invalid={hrefError ? true : undefined}
            {...register(`socials.${index}.href`, {
              onChange: (event) => {
                const detected = detectPlatform(event.target.value);
                if (detected && !getValues(`socials.${index}.label`).trim()) {
                  setValue(`socials.${index}.label`, detected.name, { shouldDirty: true });
                }
              },
              // "instagram.com/hooked.vn" → "https://instagram.com/hooked.vn"
              onBlur: (event) => {
                const value = String(event.target.value).trim();
                if (value && !/^[a-z]+:/i.test(value) && /^[^\s/]+\.[^\s]+/.test(value)) {
                  setValue(`socials.${index}.href`, `https://${value.replace(/^\/+/, "")}`, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              },
            })}
          />
          {hrefError ? <p className="text-destructive text-xs">{hrefError}</p> : null}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        disabled={!/^https?:\/\//.test(href ?? "")}
        aria-label="Mở liên kết"
        asChild={/^https?:\/\//.test(href ?? "")}
      >
        {/^https?:\/\//.test(href ?? "") ? (
          <a href={href} target="_blank" rel="noreferrer">
            <ExternalLink />
          </a>
        ) : (
          <ExternalLink />
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label="Xóa"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// SEO

const SAMPLE_PAGES = [
  { value: "home", label: "Trang chủ", title: null, path: "" },
  { value: "academy", label: "Academy", title: "Academy", path: "academy" },
  { value: "projects", label: "Projects", title: "Projects", path: "projects" },
  { value: "blog", label: "Blog", title: "Blogpost", path: "blog" },
  { value: "about", label: "About", title: "About", path: "about" },
  { value: "contact", label: "Contact", title: "Contact", path: "contact" },
];

function SeoTab() {
  const template = (useWatch({ name: "seo.titleTemplate" }) as string | undefined) ?? "";
  const example = template.includes("%s") ? template.replace("%s", "Academy") : "—";
  return (
    <TabLayout
      preview={
        <>
          <SearchPreviewCard pickable />
          <SharePreviewCard />
        </>
      }
    >
      <FormSection title="Tiêu đề trang" description="Tiêu đề hiển thị trên tab trình duyệt và kết quả Google.">
        <TextField
          name="seo.titleTemplate"
          label="Mẫu tiêu đề"
          required
          placeholder="%s · Hooked Entertainment"
          description={
            <>
              <code className="text-foreground rounded bg-muted px-1 py-0.5 font-mono text-xs">%s</code> được thay bằng
              tên từng trang. Ví dụ trang Academy → <span className="text-foreground font-medium">{example}</span>
            </>
          }
        />
        <TextField
          name="seo.defaultTitle"
          label="Tiêu đề mặc định"
          required
          maxLength={60}
          description="Dùng cho trang chủ và các trang không có tiêu đề riêng."
        />
      </FormSection>
      <FormSection title="Ảnh chia sẻ" description="Ảnh hiện khi dán liên kết website vào Facebook, Messenger, Zalo…">
        <ImageField
          name="seo.ogImage"
          label="Ảnh mặc định"
          aspect="1200/630"
          folder="seo"
          className="max-w-xl"
          description="Các trang có ảnh riêng (bài viết, dự án) sẽ dùng ảnh của trang đó."
        />
        <OgImageHint />
      </FormSection>
    </TabLayout>
  );
}

function OgImageHint() {
  const image = useWatch({ name: "seo.ogImage" }) as SiteSettings["seo"]["ogImage"];
  if (!image?.width || !image.height) return null;
  const ratio = image.width / image.height;
  const small = image.width < 600;
  if (Math.abs(ratio - 1.91) < 0.12 && !small) return null;
  return (
    <p className="bg-warning/12 dark:text-warning rounded-lg px-3 py-2 text-xs text-[color-mix(in_oklch,var(--warning),black_40%)]">
      {small ? "Ảnh hiện tại hơi nhỏ, có thể bị mờ khi chia sẻ." : "Ảnh hiện tại sẽ bị cắt bớt khi chia sẻ."}
    </p>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Previews

const subscribeNoop = () => () => {};

/** Current origin, used as the site address in previews (the admin and the website share it). */
function useOrigin() {
  return useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => "",
  );
}

function SearchPreviewCard({ pickable = false }: { pickable?: boolean }) {
  const [siteName, description, seo] = useWatch({ name: ["siteName", "description", "seo"] }) as [
    string,
    string,
    SiteSettings["seo"] | undefined,
  ];
  const origin = useOrigin();
  const [sample, setSample] = useState("home");
  const page = SAMPLE_PAGES.find((item) => item.value === sample) ?? SAMPLE_PAGES[0];
  const template = seo?.titleTemplate ?? "";
  const title =
    page.title && template.includes("%s") ? template.replace("%s", page.title) : seo?.defaultTitle || siteName;
  const tooLong = title.length > 60;

  return (
    <PreviewCard
      title="Kết quả Google"
      toolbar={
        pickable ? (
          <Select value={sample} onValueChange={setSample}>
            <SelectTrigger size="sm" className="w-full" aria-label="Trang mẫu">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_PAGES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  Xem với: {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
    >
      <div className="rounded-lg border bg-white p-4 font-[arial,sans-serif] dark:border-white/10 dark:bg-[#202124]">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full border border-black/10 bg-[#050101]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/brand/hooked-mark.svg" alt="" className="w-4" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm text-[#202124] dark:text-[#dadce0]">{siteName || "Tên website"}</p>
            <p className="truncate text-xs text-[#4d5156] dark:text-[#bdc1c6]">
              {origin || "https://hooked"}
              {page.path ? ` › ${page.path}` : ""}
            </p>
          </div>
        </div>
        <p className="mt-2 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
          {title || "Tiêu đề trang"}
        </p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-normal text-[#4d5156] dark:text-[#bdc1c6]">{description}</p>
      </div>
      <p className={cn("text-muted-foreground text-xs", tooLong && "text-warning")}>
        Tiêu đề {title.length} ký tự{tooLong ? " — có thể bị Google cắt bớt" : ""} · Mô tả {description?.length ?? 0}
        /160 ký tự
      </p>
    </PreviewCard>
  );
}

function SharePreviewCard() {
  const [siteName, description, seo] = useWatch({ name: ["siteName", "description", "seo"] }) as [
    string,
    string,
    SiteSettings["seo"] | undefined,
  ];
  const host = useOrigin().replace(/^https?:\/\//, "");
  return (
    <PreviewCard title="Chia sẻ Facebook">
      <div className="overflow-hidden rounded-lg border bg-[#f0f2f5] font-[Helvetica,Arial,sans-serif] dark:border-white/10 dark:bg-[#3a3b3c]">
        <div className="flex aspect-[1.91/1] items-center justify-center bg-[#050101]">
          {seo?.ogImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seo.ogImage.url} alt={seo.ogImage.alt} className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-xs text-white/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand/hooked-logo.png" alt="" className="w-24 opacity-80" />
              Chưa chọn ảnh chia sẻ
            </span>
          )}
        </div>
        <div className="border-t border-black/5 px-3 py-2.5 dark:border-white/5">
          <p className="truncate text-[11px] text-[#65676b] uppercase dark:text-[#b0b3b8]">{host || "hooked"}</p>
          <p className="mt-0.5 line-clamp-2 text-[15px] leading-tight font-semibold text-[#050505] dark:text-[#e4e6eb]">
            {seo?.defaultTitle || siteName}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-[#65676b] dark:text-[#b0b3b8]">{description}</p>
        </div>
      </div>
    </PreviewCard>
  );
}

/** Footer echo: contact column, social column and the company menu (from the navigation settings). */
function FooterPreviewCard({ highlight }: { highlight?: "social" }) {
  const [company, socials] = useWatch({ name: ["company", "socials"] }) as [
    SiteSettings["company"] | undefined,
    SiteSettings["socials"] | undefined,
  ];
  const { data: navigation } = useSingleton("navigation");
  const footerLinks = (navigation?.footer ?? []).filter((item) => item.visible);
  return (
    <PreviewCard title="Footer" href="/contact" description="Thông tin này cũng hiện trên trang Contact.">
      <SiteCanvas className="bg-[linear-gradient(180deg,#240a05_0%,#310e06_15%,#842b10_58%,#e65826_100%)] px-4 pt-5 pb-3">
        <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[6px] text-[#fb9a41] uppercase">Business Enquiries</p>
            <p className="truncate text-[11px] leading-tight">{company?.email}</p>
            <p className="flex items-center gap-1 text-[8px]">
              <Phone className="size-2" />
              {company?.phoneDisplay}
            </p>
            <p className="mt-1 text-[6px] font-bold uppercase">{company?.legalName}</p>
            <p className="text-[6px] leading-snug text-[#ccc]">{company?.address}</p>
          </div>
          <div
            className={cn(
              "flex min-w-0 flex-col gap-1 rounded",
              highlight === "social" && "-m-1 bg-white/10 p-1 ring-1 ring-[#ff9c50]/60",
            )}
          >
            <p className="text-[6px] font-bold text-[#fb9a41] uppercase">Social</p>
            {(socials ?? []).map((social, index) => (
              <p key={social.id ?? index} className="flex items-center gap-1 truncate text-[8px]">
                {social.label || "…"}
              </p>
            ))}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[6px] font-bold text-[#fb9a41] uppercase">Company</p>
            {footerLinks.map((item) => (
              <p key={item.id} className="truncate text-[8px]">
                {item.label}
              </p>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/hooked-wordmark-outline.png" alt="" className="mx-auto mt-4 w-3/4 opacity-90" />
      </SiteCanvas>
    </PreviewCard>
  );
}
