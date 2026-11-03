"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ExternalLink, GraduationCap, Info, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { RowActions } from "@/admin/components/cms/data-table";
import { FormSection, TextField } from "@/admin/components/cms/form-fields";
import { Thumb } from "@/admin/components/cms/image-fields";
import { InlineLabel } from "@/admin/components/cms/inline-label";
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
import { Field, FieldDescription, FieldLabel } from "@/admin/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { Spinner } from "@/admin/components/ui/spinner";
import { useCollection, useCreateItem, useDeleteItems, useReorder, useUpdateItem } from "@/admin/lib/cms/hooks";
import type { Course, CourseCategory } from "@/admin/lib/cms/types/academy";
import { cn } from "@/lib/utils";

const sameText = (a: string, b: string) => a.trim().toLocaleLowerCase("vi") === b.trim().toLocaleLowerCase("vi");

/** /admin/course-categories — course categories = filter chips of the course directory on /academy. */
export function CourseCategories() {
  const { data: categories, isLoading } = useCollection("courseCategories");
  const { data: courses } = useCollection("courses");
  const update = useUpdateItem("courseCategories", { silent: true });
  const remove = useDeleteItems("courseCategories");
  const reorder = useReorder("courseCategories");
  const confirm = useConfirm();
  const [dialog, setDialog] = useState<{ open: boolean; category?: CourseCategory }>({ open: false });
  const [deleting, setDeleting] = useState<CourseCategory | null>(null);

  const list = categories ?? [];
  const usage = (category: CourseCategory) => (courses ?? []).filter((course) => course.categoryId === category.id);
  // The website shows a chip only for categories that have a published course.
  const visibleOnSite = list.filter((category) => usage(category).some((course) => course.status === "published"));

  const rename = async (category: CourseCategory, label: string) => {
    await update.mutateAsync({ id: category.id, patch: { label } });
    toast.success(`Đã đổi tên thành “${label}”.`);
  };

  const askDelete = async (category: CourseCategory) => {
    if (usage(category).length) {
      setDeleting(category);
      return;
    }
    const ok = await confirm({
      title: `Xóa danh mục “${category.label}”?`,
      description: "Chưa có khóa học nào thuộc danh mục này. Thao tác không thể hoàn tác.",
      confirmLabel: "Xóa",
      destructive: true,
    });
    if (ok) await remove.mutateAsync([category.id]);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Danh mục khóa học"
        description="Các nhóm khóa học (DJ, MC, Producer…) dùng làm nút lọc trong danh sách khóa học trên trang Academy."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Khóa học", href: "/admin/courses" },
          { label: "Danh mục" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <a href="/academy" target="_blank" rel="noreferrer">
                <ExternalLink /> Xem trang Academy
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
          description="Kéo thả để đổi thứ tự nút lọc — lưu ngay. Bấm vào tên để đổi tên nhanh."
          contentClassName="gap-2"
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 rounded-lg" />)
          ) : list.length ? (
            <SortableList
              items={list}
              getId={(category) => category.id}
              onReorder={(next) => reorder.mutate(next.map((category) => category.id))}
              renderItem={(category, index, handle) => (
                <div className="flex items-center gap-2 rounded-lg border bg-card py-2 pr-2 pl-1.5 transition-shadow hover:shadow-xs">
                  <DragHandle {...handle} />
                  <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">{index + 1}.</span>
                  <div className="flex min-w-0 flex-1 items-center">
                    <InlineLabel
                      key={category.label}
                      label={category.label}
                      isTaken={(label) =>
                        list.some((other) => other.id !== category.id && sameText(other.label, label))
                      }
                      onSave={(label) => rename(category, label)}
                    />
                  </div>
                  <UsagePopover category={category} used={usage(category)} />
                  <RowActions
                    label={`Thao tác cho ${category.label}`}
                    actions={[
                      { label: "Sửa", icon: <Pencil />, onSelect: () => setDialog({ open: true, category }) },
                      {
                        label: "Xóa",
                        icon: <Trash2 />,
                        destructive: true,
                        separatorBefore: true,
                        onSelect: () => askDelete(category),
                      },
                    ]}
                  />
                </div>
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
                  Mỗi khóa học cần thuộc một danh mục. Thêm danh mục đầu tiên để bắt đầu.
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
          <FormSection title="Thanh lọc trên website" description="Danh sách khóa học trên trang Academy.">
            <AcademyChips labels={visibleOnSite.map((category) => category.label)} />
            {list.length > visibleOnSite.length ? (
              <p className="text-muted-foreground text-xs">
                Ẩn vì chưa có khóa học đã xuất bản:{" "}
                {list
                  .filter((category) => !visibleOnSite.includes(category))
                  .map((category) => category.label)
                  .join(", ")}
                .
              </p>
            ) : null}
          </FormSection>
          <FormSection title="Lưu ý">
            <ul className="text-muted-foreground flex flex-col gap-2.5 text-xs">
              <li className="flex gap-2">
                <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
                <span>
                  Gán danh mục cho khóa học ở mục “Phân loại & hiển thị” của từng{" "}
                  <Link href="/admin/courses" className="text-primary font-medium hover:underline">
                    khóa học
                  </Link>
                  . Mỗi khóa học thuộc đúng một danh mục.
                </span>
              </li>
              <li className="flex gap-2">
                <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
                <span>Nút lọc chỉ hiện khi danh mục có ít nhất một khóa học đã xuất bản.</span>
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
      <DeleteDialog
        category={deleting}
        categories={list}
        used={deleting ? usage(deleting) : []}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

/** Echo of the /academy directory chips: "Tất cả" (active) + categories. */
function AcademyChips({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-[#050101] p-4">
      {["Tất cả", ...labels].map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={cn(
            "inline-flex h-8 min-w-12 items-center justify-center rounded-full px-4 text-xs font-semibold whitespace-nowrap",
            index === 0 ? "bg-[#ff750a] text-[#160c05]" : "bg-[#261b13] text-[#fff4e9]",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function UsagePopover({ category, used }: { category: CourseCategory; used: Course[] }) {
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
          aria-label={`${used.length} khóa học thuộc danh mục ${category.label}`}
        >
          <GraduationCap className="size-3" />
          {used.length}
          <span className="hidden sm:inline"> khóa học</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <p className="text-muted-foreground px-1.5 pt-1 pb-2 text-xs font-medium">Khóa học thuộc “{category.label}”</p>
        {used.length ? (
          <div className="flex flex-col">
            {used.map((course) => (
              <Link
                key={course.id}
                href={`/admin/courses/${course.id}`}
                className="flex items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted"
              >
                <Thumb image={course.image} className="aspect-video w-12 shrink-0 rounded-sm" />
                <span className="min-w-0 flex-1 truncate">{course.title}</span>
                {course.status === "draft" ? <StatusPill tone="muted">Nháp</StatusPill> : null}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground px-1.5 pb-1.5 text-sm">
            Chưa có khóa học nào — nút lọc chưa hiện trên trang Academy.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Delete a category that still has courses: move them to another category first

function DeleteDialog({
  category,
  categories,
  used,
  onClose,
}: {
  category: CourseCategory | null;
  categories: CourseCategory[];
  used: Course[];
  onClose: () => void;
}) {
  const others = categories.filter((other) => other.id !== category?.id);
  const [target, setTarget] = useState("");
  const updateCourse = useUpdateItem("courses", { silent: true });
  const remove = useDeleteItems("courseCategories", { silent: true });
  const [busy, setBusy] = useState(false);
  const selected = others.find((other) => other.id === target) ?? others[0];

  const submit = async () => {
    if (!category || !selected) return;
    setBusy(true);
    try {
      for (const course of used) await updateCourse.mutateAsync({ id: course.id, patch: { categoryId: selected.id } });
      await remove.mutateAsync([category.id]);
      toast.success(`Đã chuyển ${used.length} khóa học sang “${selected.label}” và xóa “${category.label}”.`);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa danh mục “{category?.label}”</DialogTitle>
          <DialogDescription>
            {used.length} khóa học đang thuộc danh mục này. Chọn danh mục mới cho các khóa học trước khi xóa.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-1 rounded-lg bg-muted/40 p-2 text-sm">
          {used.map((course) => (
            <li key={course.id} className="flex items-center gap-2">
              <Thumb image={course.image} className="aspect-video w-10 shrink-0 rounded-sm" />
              <span className="truncate">{course.title}</span>
            </li>
          ))}
        </ul>
        {others.length ? (
          <Field>
            <FieldLabel htmlFor="move-to">Chuyển sang danh mục</FieldLabel>
            <Select value={selected?.id ?? ""} onValueChange={setTarget}>
              <SelectTrigger id="move-to" className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {others.map((other) => (
                  <SelectItem key={other.id} value={other.id}>
                    {other.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <p className="border-warning/40 bg-warning/10 flex items-start gap-2 rounded-lg border px-3 py-2 text-xs">
            <AlertTriangle className="text-warning mt-0.5 size-3.5 shrink-0" />
            Đây là danh mục duy nhất. Thêm một danh mục khác để chuyển các khóa học sang trước khi xóa.
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="button" variant="destructive" disabled={!selected || busy} onClick={submit}>
            {busy ? <Spinner /> : <Trash2 />}
            Chuyển {used.length} khóa học & xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  category?: CourseCategory;
  categories: CourseCategory[];
  used: Course[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
          <DialogDescription>
            {category
              ? "Tên hiển thị trên nút lọc của trang Academy."
              : "Danh mục mới được thêm vào cuối thanh lọc; nút lọc hiện khi có khóa học đã xuất bản."}
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
  category?: CourseCategory;
  categories: CourseCategory[];
  used: Course[];
  onDone: () => void;
}) {
  const formId = useId();
  const create = useCreateItem("courseCategories");
  const update = useUpdateItem("courseCategories");
  const others = categories.filter((other) => other.id !== category?.id);
  const schema = z.object({
    label: z
      .string()
      .trim()
      .min(1, "Nhập tên danh mục.")
      .max(24, "Tối đa 24 ký tự để nút lọc gọn gàng.")
      .refine((label) => !others.some((other) => sameText(other.label, label)), "Tên này đã tồn tại."),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: category?.label ?? "" },
    mode: "onTouched",
  });
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
        <TextField name="label" label="Tên danh mục" required placeholder="Producer" autoFocus maxLength={24} />
        {category ? (
          <FieldDescription>
            Đang dùng bởi {used.length} khóa học
            {used.length ? `: ${used.map((course) => course.title).join(", ")}` : ""}.
          </FieldDescription>
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
