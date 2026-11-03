"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, ExternalLink, FileQuestion, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { PageHeader, type Crumb } from "@/admin/components/cms/page-header";
import { SaveBar } from "@/admin/components/cms/save-bar";
import { Button } from "@/admin/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/admin/components/ui/empty";
import { Skeleton } from "@/admin/components/ui/skeleton";
import { useCreateItem, useDeleteItems, useItem, useUpdateItem } from "@/admin/lib/cms/hooks";
import { collectionMeta, type CollectionItem, type CollectionKey, type NewItem } from "@/admin/lib/cms/registry";
import { formatRelative } from "@/admin/lib/format";

type EntityEditorOptions<K extends CollectionKey, F extends FieldValues> = {
  collection: K;
  /** Route param; "new" creates an item. */
  id: string;
  /** zod schema of the form values. */
  schema: ZodType<F>;
  /** Default values for a new item. */
  empty: () => F;
  /** Item → form values (default: the item itself). */
  toForm?: (item: CollectionItem<K>) => F;
  /** Form values → stored item fields (default: the values themselves). */
  toItem?: (values: F, item: CollectionItem<K> | undefined) => NewItem<K>;
  /** List page, e.g. "/admin/courses" — new items redirect to `${basePath}/${id}`. */
  basePath: string;
};

export type EntityEditorState<K extends CollectionKey, F extends FieldValues> = {
  form: UseFormReturn<F>;
  item: CollectionItem<K> | undefined;
  isNew: boolean;
  isLoading: boolean;
  notFound: boolean;
  isSaving: boolean;
  submit: (values: F) => Promise<void>;
  remove: () => Promise<void>;
  duplicate: () => Promise<void>;
  collection: K;
  basePath: string;
};

/**
 * Loads (or prepares) one collection item, wires react-hook-form + zod, and exposes save / delete / duplicate.
 * Pair with <EntityEditor editor={…}>.
 */
export function useEntityEditor<K extends CollectionKey, F extends FieldValues>({
  collection,
  id,
  schema,
  empty,
  toForm,
  toItem,
  basePath,
}: EntityEditorOptions<K, F>): EntityEditorState<K, F> {
  const isNew = id === "new";
  const router = useRouter();
  const confirm = useConfirm();
  const query = useItem(collection, isNew ? undefined : id);
  const create = useCreateItem(collection);
  const update = useUpdateItem(collection);
  const remove = useDeleteItems(collection);

  const form = useForm<F>({
    resolver: zodResolver(schema as never) as unknown as Resolver<F>,
    defaultValues: empty() as DefaultValues<F>,
    mode: "onTouched",
  });

  const item = query.data ?? undefined;
  useEffect(() => {
    if (item && !form.formState.isDirty) form.reset((toForm ? toForm(item) : item) as unknown as F);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // Next keeps visited routes alive in a hidden <Activity>: once an item is created, the hidden "new" page
  // must start empty next time (otherwise it shows the created item and saving it creates a duplicate).
  const resetWhenHidden = useRef(false);
  useLayoutEffect(
    () => () => {
      if (!resetWhenHidden.current) return;
      resetWhenHidden.current = false;
      form.reset(empty() as F);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const submit = async (values: F) => {
    const data = (toItem ? toItem(values, item) : values) as NewItem<K>;
    if (isNew) {
      const created = await create.mutateAsync(data);
      form.reset(values);
      resetWhenHidden.current = true;
      router.replace(`${basePath}/${created.id}`);
    } else {
      const saved = await update.mutateAsync({ id, patch: data as Partial<CollectionItem<K>> });
      form.reset((toForm ? toForm(saved) : saved) as unknown as F);
    }
  };

  return {
    form,
    item,
    isNew,
    isLoading: !isNew && query.isLoading,
    notFound: !isNew && !query.isLoading && !item,
    isSaving: create.isPending || update.isPending,
    submit,
    remove: async () => {
      if (!item) return;
      const ok = await confirm({
        title: `Xóa ${collectionMeta[collection].singular} này?`,
        description: "Hành động này không thể hoàn tác.",
        confirmLabel: "Xóa",
        destructive: true,
      });
      if (!ok) return;
      await remove.mutateAsync([item.id]);
      router.replace(basePath);
    },
    duplicate: async () => {
      if (!item) return;
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item as CollectionItem<K> & Record<string, unknown>;
      void _id;
      void _c;
      void _u;
      const copy = { ...rest } as Record<string, unknown>;
      if (typeof copy.slug === "string") copy.slug = `${copy.slug}-ban-sao`;
      for (const key of ["title", "name"]) if (typeof copy[key] === "string") copy[key] = `${copy[key]} (bản sao)`;
      if ("status" in copy) copy.status = "draft";
      const created = await create.mutateAsync(copy as NewItem<K>);
      toast.success("Đã tạo bản sao (bản nháp).");
      router.push(`${basePath}/${created.id}`);
    },
    collection,
    basePath,
  };
}

type EntityEditorProps<K extends CollectionKey, F extends FieldValues> = {
  editor: EntityEditorState<K, F>;
  /** Page title (e.g. the item title, or "Khóa học mới"). */
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs: Crumb[];
  /** Badges next to the title. */
  meta?: ReactNode;
  /** Public URL of the item ("Xem trên website"). */
  publicHref?: string;
  /** Right column (status, ordering, SEO, thumbnail…). */
  aside?: ReactNode;
  /** Main column sections. */
  children: ReactNode;
  /** Extra header buttons. */
  actions?: ReactNode;
  /** Hide duplicate action. */
  noDuplicate?: boolean;
};

/**
 * Standard create/edit page: header (breadcrumbs, delete, duplicate, view on site), two-column form,
 * sticky save bar, loading skeleton and not-found state.
 */
export function EntityEditor<K extends CollectionKey, F extends FieldValues>({
  editor,
  title,
  description,
  breadcrumbs,
  meta,
  publicHref,
  aside,
  children,
  actions,
  noDuplicate,
}: EntityEditorProps<K, F>) {
  const formId = useId();
  const { form, item, isNew, isLoading, notFound, isSaving, submit, remove, duplicate, basePath } = editor;
  const errorCount = Object.keys(form.formState.errors).length;

  if (isLoading) return <EditorSkeleton />;
  if (notFound) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion />
          </EmptyMedia>
          <EmptyTitle>Không tìm thấy nội dung</EmptyTitle>
          <EmptyDescription>Mục này có thể đã bị xóa.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link href={basePath}>Quay lại danh sách</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(submit, () => toast.error("Vui lòng kiểm tra các trường được đánh dấu."))}
        className="flex flex-col gap-6"
      >
        <PageHeader
          title={title}
          description={
            description ??
            (item ? <span>Cập nhật {formatRelative(item.updatedAt)}</span> : "Điền thông tin rồi bấm Lưu để tạo mới.")
          }
          breadcrumbs={breadcrumbs}
          backHref={basePath}
          meta={meta}
          actions={
            <>
              {actions}
              {publicHref && !isNew ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={publicHref} target="_blank" rel="noreferrer">
                    <ExternalLink /> Xem trên website
                  </a>
                </Button>
              ) : null}
              {!isNew && !noDuplicate ? (
                <Button type="button" variant="outline" size="sm" onClick={duplicate}>
                  <Copy /> Nhân bản
                </Button>
              ) : null}
              {!isNew ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={remove}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 /> Xóa
                </Button>
              ) : null}
            </>
          }
        />
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-6">{children}</div>
          {aside ? <aside className="flex flex-col gap-6 xl:sticky xl:top-20">{aside}</aside> : null}
        </div>
        <SaveBar
          formId={formId}
          isDirty={form.formState.isDirty || isNew}
          isSaving={isSaving}
          errorCount={form.formState.isSubmitted ? errorCount : 0}
          onDiscard={() => form.reset()}
          saveLabel={isNew ? "Tạo mới" : "Lưu thay đổi"}
        />
      </form>
    </FormProvider>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
