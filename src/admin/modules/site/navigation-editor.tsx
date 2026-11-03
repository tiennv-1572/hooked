"use client";

import {
  Check,
  Copy,
  ExternalLink,
  EyeOff,
  FilePlus2,
  Menu,
  Monitor,
  PanelBottom,
  Plus,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { get, useController, useFieldArray, useFormContext, useFormState, useWatch } from "react-hook-form";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { FormSection } from "@/admin/components/cms/form-fields";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import { DragHandle, SortableList, type DragHandleProps } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/admin/components/ui/empty";
import { Input } from "@/admin/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Switch } from "@/admin/components/ui/switch";
import { useSingleton } from "@/admin/lib/cms/hooks";
import { createId } from "@/admin/lib/cms/ids";
import type { Navigation } from "@/admin/lib/cms/types/pages";
import type { NavItem } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

import { EditorTabs, TabLayout } from "./editor-tabs";
import { LinkField } from "./link-field";
import { PreviewCard, SiteCanvas, SiteLogo } from "./site-preview";
import { SITE_ROUTES } from "./site-routes";
import { navigationSchema } from "./site-schemas";

type MenuKey = keyof Navigation;

const MENUS: Record<MenuKey, { label: string; title: string; description: string }> = {
  desktop: {
    label: "Desktop",
    title: "Menu header (desktop)",
    description: "Thanh menu ở đầu trang trên máy tính.",
  },
  mobile: {
    label: "Mobile",
    title: "Menu mobile",
    description: "Menu mở bằng nút ☰ trên điện thoại.",
  },
  footer: {
    label: "Footer",
    title: "Cột “Company” ở footer",
    description: "Liên kết nhanh ở chân trang, hiển thị trên mọi trang.",
  },
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** `/admin/navigation` — desktop header, mobile overlay and footer menus with live previews. */
export function NavigationEditor() {
  const editor = useSingletonEditor("navigation", navigationSchema);
  return (
    <SingletonEditor editor={editor} title="Menu & điều hướng" description="Tắt “Hiện” để ẩn tạm một mục mà không xóa.">
      <NavigationTabs />
    </SingletonEditor>
  );
}

function NavigationTabs() {
  const [desktop, mobile, footer] = useWatch({ name: ["desktop", "mobile", "footer"] }) as [
    NavItem[],
    NavItem[],
    NavItem[],
  ];
  const visible = (items: NavItem[] | undefined) => items?.filter((item) => item.visible).length;
  return (
    <EditorTabs
      tabs={[
        {
          value: "desktop",
          label: "Desktop",
          icon: Monitor,
          fields: ["desktop"],
          count: visible(desktop),
          content: (
            <div className="flex flex-col gap-6">
              <DesktopPreview />
              <MenuPanel menu="desktop" />
            </div>
          ),
        },
        {
          value: "mobile",
          label: "Mobile",
          icon: Smartphone,
          fields: ["mobile"],
          count: visible(mobile),
          content: (
            <TabLayout preview={<MobilePreview />}>
              <MenuPanel menu="mobile" />
            </TabLayout>
          ),
        },
        {
          value: "footer",
          label: "Footer",
          icon: PanelBottom,
          fields: ["footer"],
          count: visible(footer),
          content: (
            <TabLayout preview={<FooterPreview />}>
              <MenuPanel menu="footer" />
            </TabLayout>
          ),
        },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------
// Editor

function MenuPanel({ menu }: { menu: MenuKey }) {
  const { control, setFocus, getValues } = useFormContext<Navigation>();
  const { fields, append, remove, move, replace } = useFieldArray({ control, name: menu });
  const items = (useWatch({ control, name: menu }) as NavItem[] | undefined) ?? [];
  const confirm = useConfirm();
  const meta = MENUS[menu];
  const hidden = items.filter((item) => !item.visible).length;

  // Focus target applied once the "Thêm mục" menu has closed (Radix returns focus to its trigger first).
  const pendingFocus = useRef<`${MenuKey}.${number}.label` | null>(null);

  const addItem = (item: Partial<NavItem> = {}) => {
    append({ id: createId("nav"), label: "", href: "", visible: true, ...item });
    if (!item.label) pendingFocus.current = `${menu}.${fields.length}.label`;
  };

  const copyFrom = async (source: MenuKey) => {
    const ok = await confirm({
      title: `Sao chép menu ${MENUS[source].label}?`,
      description: `Các mục hiện tại của menu ${meta.label} sẽ được thay bằng ${getValues(source).length} mục của menu ${MENUS[source].label}. Bấm Lưu để áp dụng.`,
      confirmLabel: "Sao chép",
    });
    if (ok) replace(getValues(source).map((item) => ({ ...item, id: createId("nav") })));
  };

  return (
    <FormSection
      title={meta.title}
      description={meta.description}
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="sm">
              <Plus /> Thêm mục
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64"
            onCloseAutoFocus={(event) => {
              if (!pendingFocus.current) return;
              event.preventDefault();
              setFocus(pendingFocus.current);
              pendingFocus.current = null;
            }}
          >
            <DropdownMenuLabel>Thêm trang có sẵn</DropdownMenuLabel>
            {SITE_ROUTES.map((route) => {
              const exists = items.some((item) => item.href === route.href);
              return (
                <DropdownMenuItem key={route.href} onSelect={() => addItem({ label: route.label, href: route.href })}>
                  <FilePlus2 />
                  <span className="flex-1 truncate">{route.title}</span>
                  {exists ? <Check className="text-muted-foreground" aria-label="Đã có trong menu" /> : null}
                  <span className="text-muted-foreground text-xs">{route.href}</span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => addItem()}>
              <Plus /> Liên kết tùy chỉnh
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      {fields.length ? (
        <SortableList
          items={fields}
          getId={(field) => field.id}
          onReorder={(_, from, to) => move(from, to)}
          renderItem={(field, index, handle) => (
            <MenuRow key={field.id} menu={menu} index={index} handle={handle} onRemove={() => remove(index)} />
          )}
        />
      ) : (
        <Empty className="border border-dashed py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Menu />
            </EmptyMedia>
            <EmptyTitle>Menu đang trống</EmptyTitle>
            <EmptyDescription>Bấm “Thêm mục” để chọn trang có sẵn hoặc thêm liên kết tùy chỉnh.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="text-muted-foreground flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span>
          {items.length} mục{hidden ? ` · ${hidden} đang ẩn` : ""}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground w-fit">
              <Copy /> Sao chép từ menu khác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(MENUS) as MenuKey[])
              .filter((key) => key !== menu)
              .map((key) => (
                <DropdownMenuItem key={key} onSelect={() => copyFrom(key)}>
                  {MENUS[key].title}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </FormSection>
  );
}

function MenuRow({
  menu,
  index,
  handle,
  onRemove,
}: {
  menu: MenuKey;
  index: number;
  handle: DragHandleProps;
  onRemove: () => void;
}) {
  const { control, register } = useFormContext<Navigation>();
  const { errors } = useFormState({ control, name: `${menu}.${index}` });
  const { field: visibleField } = useController({ control, name: `${menu}.${index}.visible` });
  const { field: newTabField } = useController({ control, name: `${menu}.${index}.newTab` });
  const visible = Boolean(visibleField.value);
  const newTab = Boolean(newTabField.value);
  const labelError = (get(errors, `${menu}.${index}.label`) as { message?: string } | undefined)?.message;

  return (
    <div
      className={cn(
        "flex items-start gap-1.5 rounded-lg border bg-card p-2 transition-colors",
        !visible && "border-dashed bg-muted/40",
      )}
    >
      <DragHandle {...handle} className="mt-1" />
      <span className="text-muted-foreground mt-2 w-4 shrink-0 text-right text-xs tabular-nums">{index + 1}</span>
      <div className="grid min-w-0 flex-1 gap-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
        <div className="grid gap-1">
          <Input
            placeholder="Nhãn (Academy)"
            aria-label="Nhãn"
            aria-invalid={labelError ? true : undefined}
            className={cn(!visible && "text-muted-foreground decoration-muted-foreground/50 line-through")}
            {...register(`${menu}.${index}.label`)}
          />
          {labelError ? <p className="text-destructive text-xs">{labelError}</p> : null}
        </div>
        <LinkField name={`${menu}.${index}.href`} placeholder="/academy hoặc https://…" />
        <div className="flex h-8 items-center gap-4 px-1">
          <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Switch
              size="sm"
              checked={visible}
              onCheckedChange={visibleField.onChange}
              aria-label="Hiện trên website"
            />
            Hiện
          </label>
          <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Switch size="sm" checked={newTab} onCheckedChange={newTabField.onChange} aria-label="Mở trong tab mới" />
            Tab mới
          </label>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-destructive shrink-0"
        onClick={onRemove}
        aria-label="Xóa mục"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Previews

function PageSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-full sm:w-60" aria-label="Trang đang xem">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SITE_ROUTES.map((route) => (
          <SelectItem key={route.href} value={route.href}>
            Đang xem: {route.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function useVisibleItems(menu: MenuKey) {
  const items = (useWatch({ name: menu }) as NavItem[] | undefined) ?? [];
  return { items: items.filter((item) => item.visible), hidden: items.filter((item) => !item.visible).length };
}

function DesktopPreview() {
  const { items, hidden } = useVisibleItems("desktop");
  const [page, setPage] = useState("/");
  const home = page === "/";
  return (
    <PreviewCard
      title="Header desktop"
      href={page}
      description={hidden ? `${hidden} mục đang ẩn không hiển thị.` : undefined}
      toolbar={<PageSelect value={page} onChange={setPage} />}
    >
      <div className="overflow-x-auto rounded-lg">
        <SiteCanvas className="min-w-[720px] rounded-none">
          <div
            className={cn(
              "flex items-center justify-between px-8",
              home
                ? "h-14 bg-[linear-gradient(90deg,#983a0f_0%,#000_49%,#983a0f_100%)]"
                : "h-16 border-b border-[#ff9c50]/15 bg-[linear-gradient(90deg,rgba(53,25,14,0.65)_0%,#050101_48%,rgba(53,25,14,0.65)_100%)]",
            )}
          >
            <SiteLogo className="w-20" />
            <ul className="flex items-center gap-8">
              {items.map((item) => {
                const active = !home && isActivePath(page, item.href);
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-1 text-[13px] uppercase",
                      home ? "font-bold text-[#ccc]" : "font-extrabold",
                      !home && (active ? "text-[#ff6b00]" : "text-[#ccc]"),
                    )}
                  >
                    {item.label || "…"}
                    {item.newTab ? <ExternalLink className="size-2.5 opacity-60" /> : null}
                  </li>
                );
              })}
              {!items.length ? <li className="text-xs text-white/40">Không có mục nào hiển thị</li> : null}
            </ul>
          </div>
          <div className="flex flex-col gap-2 px-8 py-6">
            <div className="h-2 w-24 rounded bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-white/15" />
            <div className="h-4 w-1/2 rounded bg-white/15" />
          </div>
        </SiteCanvas>
      </div>
    </PreviewCard>
  );
}

function MobilePreview() {
  const { items, hidden } = useVisibleItems("mobile");
  const [page, setPage] = useState("/");
  return (
    <PreviewCard
      title="Menu mobile"
      href={page}
      description={hidden ? `${hidden} mục đang ẩn không hiển thị.` : undefined}
      toolbar={<PageSelect value={page} onChange={setPage} />}
    >
      <div className="mx-auto w-[240px] rounded-[32px] border-[6px] border-neutral-800 bg-neutral-800 shadow-lg dark:border-neutral-700 dark:bg-neutral-700">
        <SiteCanvas className="h-[440px] rounded-[26px] bg-[rgba(5,4,3,0.96)] px-5 pt-6">
          <X className="size-5 text-white" />
          <ul className="mt-5 flex flex-col gap-3.5">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-1.5 text-xl leading-tight font-extrabold",
                  isActivePath(page, item.href) ? "text-[#ff6b00]" : "text-[#fff4e9]",
                )}
              >
                {item.label || "…"}
                {item.newTab ? <ExternalLink className="size-3 opacity-60" /> : null}
              </li>
            ))}
            {!items.length ? <li className="text-xs text-white/40">Không có mục nào hiển thị</li> : null}
          </ul>
        </SiteCanvas>
      </div>
    </PreviewCard>
  );
}

function FooterPreview() {
  const { items, hidden } = useVisibleItems("footer");
  const { data: settings } = useSingleton("settings");
  return (
    <PreviewCard title="Footer" href="/" description={hidden ? `${hidden} mục đang ẩn không hiển thị.` : undefined}>
      <SiteCanvas className="bg-[linear-gradient(180deg,#240a05_0%,#310e06_15%,#842b10_58%,#e65826_100%)] px-5 pt-5 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 opacity-55">
            <p className="text-[8px] font-bold text-[#fb9a41] uppercase">Social</p>
            {settings?.socials.map((social) => (
              <p key={social.id} className="text-[11px]">
                {social.label}
              </p>
            ))}
          </div>
          <div className="-m-1.5 flex flex-col gap-1.5 rounded-md p-1.5 ring-1 ring-[#ff9c50]/60">
            <p className="text-[8px] font-bold text-[#fb9a41] uppercase">Company</p>
            {items.map((item) => (
              <p key={item.id} className="flex items-center gap-1 text-[11px]">
                {item.label || "…"}
                {item.newTab ? <ExternalLink className="size-2.5 opacity-60" /> : null}
              </p>
            ))}
            {!items.length ? (
              <p className="flex items-center gap-1 text-[10px] text-white/50">
                <EyeOff className="size-3" /> Trống
              </p>
            ) : null}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/brand/hooked-wordmark-outline.png" alt="" className="mx-auto mt-5 w-4/5" />
      </SiteCanvas>
    </PreviewCard>
  );
}
