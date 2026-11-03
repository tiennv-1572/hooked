"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ExternalLink, FolderKanban, Info, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { RowActions } from "@/admin/components/cms/data-table";
import { FormSection, SlugField, TextField } from "@/admin/components/cms/form-fields";
import { InlineLabel } from "@/admin/components/cms/inline-label";
import { Thumb } from "@/admin/components/cms/image-fields";
import { PageHeader } from "@/admin/components/cms/page-header";
import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/admin/components/ui/empty";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { useCollection, useCreateItem, useDeleteItems, useReorder, useUpdateItem } from "@/admin/lib/cms/hooks";
import { slugSchema } from "@/admin/lib/cms/schemas";
import type { Project, ProjectCategory } from "@/admin/lib/cms/types/projects";
import { PROJECTS_COPY } from "@/components/projects/project-content";
import { cn } from "@/lib/utils";

import { projectFilterHref } from "./project-utils";
import { SiteFilterChips, SiteStage } from "./project-visuals";

const sameText = (a: string, b: string) => a.trim().toLocaleLowerCase("vi") === b.trim().toLocaleLowerCase("vi");

/** /admin/project-categories — service categories = filter chips on the Projects page. */
export function ProjectCategories() {
  const { data: categories, isLoading } = useCollection("projectCategories");
  const { data: projects } = useCollection("projects");
  const update = useUpdateItem("projectCategories", { silent: true });
  const updateProject = useUpdateItem("projects", { silent: true });
  const remove = useDeleteItems("projectCategories");
  const reorder = useReorder("projectCategories");
  const confirm = useConfirm();
  const [dialog, setDialog] = useState<{ open: boolean; category?: ProjectCategory }>({ open: false });

  const list = categories ?? [];
  const usage = (category: ProjectCategory) =>
    (projects ?? []).filter((project) => project.categoryIds.includes(category.id));

  const rename = async (category: ProjectCategory, label: string) => {
    await update.mutateAsync({ id: category.id, patch: { label } });
    toast.success(`Đã đổi tên thành “${label}”.`);
  };

  const askDelete = async (category: ProjectCategory) => {
    const used = usage(category);
    if (!used.length) {
      const ok = await confirm({
        title: `Xóa danh mục “${category.label}”?`,
        description: "Chưa có dự án nào dùng danh mục này. Nút lọc tương ứng sẽ biến mất khỏi trang Projects.",
        confirmLabel: "Xóa",
        destructive: true,
      });
      if (ok) await remove.mutateAsync([category.id]);
      return;
    }
    const orphans = used.filter((project) => project.categoryIds.length === 1);
    const ok = await confirm({
      title: `Danh mục “${category.label}” đang được dùng`,
      description: (
        <span className="flex flex-col gap-2">
          <span>
            {used.length} dự án đang thuộc danh mục này:{" "}
            <strong className="text-foreground">{used.map((project) => project.name).join(", ")}</strong>. Khi xóa, danh
            mục sẽ được gỡ khỏi các dự án này và nút lọc biến mất khỏi trang Projects.
          </span>
          {orphans.length ? (
            <span className="text-warning">
              {orphans.map((project) => project.name).join(", ")} sẽ không còn danh mục nào (chỉ hiện ở “Tất cả”).
            </span>
          ) : null}
        </span>
      ),
      confirmLabel: `Gỡ khỏi ${used.length} dự án & xóa`,
      destructive: true,
    });
    if (!ok) return;
    // Sequential on purpose: the local adapter rewrites the whole collection per update (parallel writes would race).
    for (const project of used) {
      await updateProject.mutateAsync({
        id: project.id,
        patch: { categoryIds: project.categoryIds.filter((id) => id !== category.id) },
      });
    }
    await remove.mutateAsync([category.id]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Danh mục dự án"
        description="Các dịch vụ dùng làm nút lọc trên trang Projects và nhãn dưới tên mỗi thẻ dự án."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Dự án", href: "/admin/projects" },
          { label: "Danh mục" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href="/projects" target="_blank" rel="noreferrer">
                <ExternalLink /> Xem trang Projects
              </a>
            </Button>
            <Button size="sm" onClick={() => setDialog({ open: true })}>
              <Plus /> Thêm danh mục
            </Button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <FormSection
          title={`Danh mục (${list.length})`}
          description="Kéo thả để đổi thứ tự, bấm vào tên để đổi tên — thay đổi được lưu ngay."
          contentClassName="gap-2"
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-lg" />)
          ) : list.length ? (
            <SortableList
              items={list}
              getId={(category) => category.id}
              onReorder={(next) => reorder.mutate(next.map((category) => category.id))}
              renderItem={(category, index, handle) => (
                <CategoryRow
                  category={category}
                  index={index}
                  handle={handle}
                  used={usage(category)}
                  isLabelTaken={(label) =>
                    list.some((other) => other.id !== category.id && sameText(other.label, label))
                  }
                  onRename={(label) => rename(category, label)}
                  onEdit={() => setDialog({ open: true, category })}
                  onDelete={() => askDelete(category)}
                />
              )}
            />
          ) : (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Tags />
                </EmptyMedia>
                <EmptyTitle>Chưa có danh mục</EmptyTitle>
                <EmptyDescription>
                  Trang Projects sẽ chỉ có nút “Tất cả”. Thêm danh mục để khách lọc dự án theo dịch vụ.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={() => setDialog({ open: true })}>
                  <Plus /> Thêm danh mục
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </FormSection>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-20">
          <FormSection title="Thanh lọc trên website">
            <SiteStage>
              <SiteFilterChips
                allLabel={PROJECTS_COPY.allFilterLabel}
                labels={list.map((category) => category.label)}
              />
            </SiteStage>
          </FormSection>
          <FormSection title="Lưu ý">
            <ul className="text-muted-foreground flex flex-col gap-2.5 text-xs">
              <li className="flex gap-2">
                <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
                <span>Danh mục chưa có dự án vẫn hiện nút lọc; khi chọn, website hiển thị trạng thái trống.</span>
              </li>
              <li className="flex gap-2">
                <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
                <span>Gán danh mục cho dự án trong mục “Phân loại” của từng dự án.</span>
              </li>
            </ul>
          </FormSection>
        </aside>
      </div>

      <CategoryDialog
        open={dialog.open}
        category={dialog.category}
        categories={list}
        used={dialog.category ? usage(dialog.category) : []}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </div>
  );
}

function CategoryRow({
  category,
  index,
  handle,
  used,
  isLabelTaken,
  onRename,
  onEdit,
  onDelete,
}: {
  category: ProjectCategory;
  index: number;
  handle: React.HTMLAttributes<HTMLButtonElement>;
  used: Project[];
  isLabelTaken: (label: string) => boolean;
  onRename: (label: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card py-2 pr-2 pl-1.5 transition-shadow hover:shadow-xs">
      <DragHandle {...handle} />
      <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">{index + 1}.</span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <InlineLabel key={category.label} label={category.label} isTaken={isLabelTaken} onSave={onRename} />
        <code className="text-muted-foreground truncate text-xs">{category.slug}</code>
      </div>
      <UsagePopover category={category} used={used} />
      <RowActions
        label={`Thao tác cho ${category.label}`}
        actions={[
          { label: "Sửa nhãn & slug", icon: <Pencil />, onSelect: onEdit },
          { label: "Xem trên website", icon: <ExternalLink />, href: projectFilterHref(category.slug), external: true },
          { label: "Xóa", icon: <Trash2 />, destructive: true, separatorBefore: true, onSelect: onDelete },
        ]}
      />
    </div>
  );
}

function UsagePopover({ category, used }: { category: ProjectCategory; used: Project[] }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs whitespace-nowrap ring-1 transition-colors ring-inset",
            used.length
              ? "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/15"
              : "text-muted-foreground ring-border bg-muted",
          )}
          aria-label={`${used.length} dự án dùng danh mục ${category.label}`}
        >
          <FolderKanban className="size-3" />
          {used.length}
          <span className="hidden sm:inline"> dự án</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <p className="text-muted-foreground px-1.5 pt-1 pb-2 text-xs font-medium">Dự án thuộc “{category.label}”</p>
        {used.length ? (
          <div className="flex flex-col">
            {used.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted"
              >
                <Thumb image={project.cover} className="aspect-video w-12 shrink-0 rounded-sm" />
                <span className="min-w-0 flex-1 truncate">{project.name}</span>
                {project.status === "draft" ? <StatusPill tone="muted">Nháp</StatusPill> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground px-1.5 pb-1.5 text-sm">
            Chưa có dự án nào — trang Projects sẽ hiển thị trạng thái trống khi chọn bộ lọc này.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Create / edit dialog

function CategoryDialog({
  open,
  onOpenChange,
  category,
  categories,
  used,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ProjectCategory;
  categories: ProjectCategory[];
  used: Project[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Nhãn hiển thị trên nút lọc và dưới tên thẻ dự án."
              : "Danh mục mới được thêm vào cuối thanh lọc của trang Projects."}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CategoryForm category={category} categories={categories} used={used} onDone={() => onOpenChange(false)} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CategoryForm({
  category,
  categories,
  used,
  onDone,
}: {
  category?: ProjectCategory;
  categories: ProjectCategory[];
  used: Project[];
  onDone: () => void;
}) {
  const formId = useId();
  const create = useCreateItem("projectCategories");
  const update = useUpdateItem("projectCategories");
  const others = categories.filter((other) => other.id !== category?.id);
  const schema = z.object({
    label: z
      .string()
      .trim()
      .min(1, "Nhập tên danh mục.")
      .max(40, "Tối đa 40 ký tự để nút lọc gọn gàng.")
      .refine((label) => !others.some((other) => sameText(other.label, label)), "Tên này đã tồn tại."),
    slug: slugSchema.refine((slug) => !others.some((other) => other.slug === slug), "Slug này đã được dùng."),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: category?.label ?? "", slug: category?.slug ?? "" },
    mode: "onTouched",
  });
  const slug = useWatch({ control: form.control, name: "slug" });
  const saving = create.isPending || update.isPending;

  const submit = async (values: Values) => {
    if (category) await update.mutateAsync({ id: category.id, patch: values });
    else
      await create.mutateAsync({
        ...values,
        order: categories.reduce((max, item) => Math.max(max, item.order), -1) + 1,
      });
    onDone();
  };

  return (
    <FormProvider {...form}>
      <form id={formId} noValidate onSubmit={form.handleSubmit(submit)} className="flex flex-col gap-5">
        <TextField name="label" label="Tên danh mục" required placeholder="Event production" autoFocus maxLength={40} />
        <SlugField name="slug" source="label" prefix={"?\u2060service="} />
        {category && slug !== category.slug ? (
          <p className="border-warning/40 bg-warning/10 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertTriangle className="text-warning mt-0.5 size-3.5 shrink-0" />
            Đổi đường dẫn sẽ làm các liên kết cũ không còn lọc đúng danh mục này.
          </p>
        ) : null}
        {category ? (
          <p className="text-muted-foreground text-xs">
            Đang dùng bởi {used.length} dự án{used.length ? `: ${used.map((project) => project.name).join(", ")}` : ""}.
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : null}
            {category ? "Lưu thay đổi" : "Thêm danh mục"}
          </Button>
        </DialogFooter>
      </form>
    </FormProvider>
  );
}
