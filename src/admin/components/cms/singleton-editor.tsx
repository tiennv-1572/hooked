"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { FormProvider, useForm, type FieldValues, type Resolver, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { ZodType } from "zod";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { EditorSkeleton } from "@/admin/components/cms/entity-editor";
import { PageHeader, type Crumb } from "@/admin/components/cms/page-header";
import { SaveBar } from "@/admin/components/cms/save-bar";
import { Button } from "@/admin/components/ui/button";
import { useSaveSingleton, useSingleton } from "@/admin/lib/cms/hooks";
import { getSingletonSeed } from "@/admin/lib/cms/local-adapter";
import { singletonMeta, type SingletonKey, type SingletonMap } from "@/admin/lib/cms/registry";

export type SingletonEditorState<S extends SingletonKey> = {
  key: S;
  form: UseFormReturn<SingletonMap[S] & FieldValues>;
  isLoading: boolean;
  isSaving: boolean;
  submit: (values: SingletonMap[S]) => Promise<void>;
  restoreDefaults: () => Promise<void>;
};

/** Loads a singleton document (page copy, settings…) into react-hook-form. */
export function useSingletonEditor<S extends SingletonKey>(
  key: S,
  schema?: ZodType<SingletonMap[S]>,
): SingletonEditorState<S> {
  type Values = SingletonMap[S] & FieldValues;
  const query = useSingleton(key);
  const save = useSaveSingleton(key);
  const confirm = useConfirm();
  const form = useForm<Values>({
    resolver: schema ? (zodResolver(schema as never) as unknown as Resolver<Values>) : undefined,
    mode: "onTouched",
  });

  useEffect(() => {
    if (query.data && !form.formState.isDirty) form.reset(query.data as Values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return {
    key,
    form,
    isLoading: query.isLoading || !form.formState.defaultValues,
    isSaving: save.isPending,
    submit: async (values) => {
      const saved = await save.mutateAsync(values);
      form.reset(saved as Values);
    },
    restoreDefaults: async () => {
      const ok = await confirm({
        title: "Khôi phục nội dung mặc định?",
        description: "Form sẽ được điền lại bằng nội dung gốc của website. Bấm Lưu để áp dụng.",
        confirmLabel: "Khôi phục",
      });
      if (ok) form.reset(getSingletonSeed(key) as Values, { keepDefaultValues: true });
    },
  };
}

type SingletonEditorProps<S extends SingletonKey> = {
  editor: SingletonEditorState<S>;
  title?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Optional right column. */
  aside?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

/** Standard page-content editor: header with "Xem trang" + "Khôi phục mặc định", form, sticky save bar. */
export function SingletonEditor<S extends SingletonKey>({
  editor,
  title,
  description,
  breadcrumbs,
  aside,
  children,
  actions,
}: SingletonEditorProps<S>) {
  const formId = useId();
  const { key, form, isLoading, isSaving, submit, restoreDefaults } = editor;
  const meta = singletonMeta[key];

  if (isLoading) return <EditorSkeleton />;

  return (
    <FormProvider {...form}>
      <form
        id={formId}
        noValidate
        onSubmit={form.handleSubmit(
          (values) => submit(values as SingletonMap[S]),
          () => toast.error("Vui lòng kiểm tra các trường được đánh dấu."),
        )}
        className="flex flex-col gap-6"
      >
        <PageHeader
          title={title ?? meta.label}
          description={description}
          breadcrumbs={breadcrumbs ?? [{ label: "Dashboard", href: "/admin" }, { label: meta.label }]}
          actions={
            <>
              {actions}
              {meta.publicPath ? (
                <Button type="button" variant="outline" size="sm" asChild>
                  <a href={meta.publicPath} target="_blank" rel="noreferrer">
                    <ExternalLink /> Xem trang
                  </a>
                </Button>
              ) : null}
              <Button type="button" variant="outline" size="sm" onClick={restoreDefaults}>
                <RotateCcw /> Khôi phục mặc định
              </Button>
            </>
          }
        />
        {aside ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="flex min-w-0 flex-col gap-6">{children}</div>
            <aside className="flex flex-col gap-6 xl:sticky xl:top-20">{aside}</aside>
          </div>
        ) : (
          <div className="flex flex-col gap-6">{children}</div>
        )}
        <SaveBar
          formId={formId}
          isDirty={form.formState.isDirty}
          isSaving={isSaving}
          errorCount={form.formState.isSubmitted ? Object.keys(form.formState.errors).length : 0}
          onDiscard={() => form.reset()}
        />
      </form>
    </FormProvider>
  );
}
