"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { get, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { useConfirm } from "@/admin/components/cms/confirm-dialog";
import { FieldRow, StringListField, TextareaField, TextField } from "@/admin/components/cms/form-fields";
import { ImageField } from "@/admin/components/cms/image-fields";
import { RichTextEditorField } from "@/admin/components/cms/rich-text-editor";
import { DragHandle, SortableList, type DragHandleProps } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import { Field, FieldError } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/admin/components/ui/tooltip";
import { createId } from "@/admin/lib/cms/ids";
import type { PostBlockType } from "@/admin/lib/cms/types/blog";
import { cn } from "@/lib/utils";

import { HrefField } from "./href-field";
import type { PostForm, PostFormBlock } from "./post-schema";
import { BLOCK_TYPE_ORDER, BLOCK_TYPES, blockHasContent, blockSummary, newBlock } from "./post-utils";

/**
 * Ordered article body: drag & drop blocks, "+" between blocks, per-block toolbar
 * (move, duplicate, delete, collapse) and a typed field set per block.
 */
export function BlockEditor() {
  const { control, getValues } = useFormContext<PostForm>();
  const { fields, insert, remove, move } = useFieldArray({ control, name: "blocks" });
  const blocks = (useWatch({ control, name: "blocks" }) ?? []) as PostFormBlock[];
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const confirm = useConfirm();
  const pendingFocus = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus (and reveal) a block right after it was added.
  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    const card = listRef.current?.querySelector<HTMLElement>(`[data-block-id="${id}"]`);
    if (!card) return;
    pendingFocus.current = null;
    card.scrollIntoView({ block: "center", behavior: "smooth" });
    card
      .querySelector<HTMLElement>("textarea, input:not([type=hidden]), [data-block-body] button")
      ?.focus({ preventScroll: true });
  }, [fields]);

  const add = (type: PostBlockType, at: number) => {
    const block = newBlock(type);
    pendingFocus.current = block.id;
    insert(at, block as PostFormBlock, { shouldFocus: false });
  };

  const duplicate = (index: number) => {
    const copy = { ...structuredClone(getValues(`blocks.${index}`)), id: createId("blk") } as PostFormBlock;
    pendingFocus.current = copy.id;
    insert(index + 1, copy, { shouldFocus: false });
  };

  const removeAt = async (index: number) => {
    const block = getValues(`blocks.${index}`) as PostFormBlock;
    if (blockHasContent(block)) {
      const ok = await confirm({
        title: `Xóa khối “${BLOCK_TYPES[block.type].label}”?`,
        description: "Nội dung trong khối sẽ bị xóa. Bạn vẫn có thể bấm Hoàn tác trước khi lưu.",
        confirmLabel: "Xóa khối",
        destructive: true,
      });
      if (!ok) return;
    }
    remove(index);
  };

  const toggle = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const allCollapsed = fields.length > 0 && fields.every((field) => collapsed.has(field.id));

  return (
    <div className="flex flex-col gap-3" ref={listRef}>
      {fields.length > 1 ? (
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(fields.map((field) => field.id)))}
          >
            {allCollapsed ? <ChevronsUpDown /> : <ChevronsDownUp />}
            {allCollapsed ? "Mở tất cả" : "Thu gọn tất cả"}
          </Button>
        </div>
      ) : null}

      {fields.length ? (
        <>
          <InsertPoint onPick={(type) => add(type, 0)} />
          <SortableList
            className="gap-0"
            items={fields}
            getId={(field) => field.id}
            onReorder={(_, from, to) => move(from, to)}
            renderItem={(field, index, handle, isDragging) => {
              const block = blocks[index] ?? (field as unknown as PostFormBlock);
              return (
                <div>
                  <BlockCard
                    index={index}
                    total={fields.length}
                    block={block}
                    handle={handle}
                    isDragging={isDragging}
                    collapsed={collapsed.has(field.id)}
                    onToggle={() => toggle(field.id)}
                    onMove={(to) => move(index, to)}
                    onDuplicate={() => duplicate(index)}
                    onRemove={() => removeAt(index)}
                  />
                  <InsertPoint onPick={(type) => add(type, index + 1)} />
                </div>
              );
            }}
          />
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <BlockTypePopover onPick={(type) => add(type, fields.length)} align="start">
              <Button type="button" variant="outline" className="border-dashed">
                <Plus /> Thêm khối
              </Button>
            </BlockTypePopover>
            <span className="text-muted-foreground hidden text-xs sm:inline">Nhanh:</span>
            {(["paragraph", "heading", "image"] as const).map((type) => {
              const Icon = BLOCK_TYPES[type].icon;
              return (
                <Button
                  key={type}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hidden sm:inline-flex"
                  onClick={() => add(type, fields.length)}
                >
                  <Icon /> {BLOCK_TYPES[type].label}
                </Button>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyBlocks onPick={(type) => add(type, 0)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------

function BlockCard({
  index,
  total,
  block,
  handle,
  isDragging,
  collapsed,
  onToggle,
  onMove,
  onDuplicate,
  onRemove,
}: {
  index: number;
  total: number;
  block: PostFormBlock;
  handle: DragHandleProps;
  isDragging: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onMove: (to: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const {
    formState: { errors },
  } = useFormContext();
  const hasError = Boolean(get(errors, `blocks.${index}`));
  // Never hide a block that needs fixing.
  const open = !collapsed || hasError;
  const meta = BLOCK_TYPES[block.type];
  const Icon = meta.icon;
  const summary = blockSummary(block);

  return (
    <div
      data-block-id={block.id}
      className={cn(
        "group/block rounded-xl border bg-card transition-shadow",
        open && "shadow-xs",
        isDragging && "ring-primary/30 shadow-lg ring-2",
        hasError && "border-destructive/60",
      )}
    >
      <div className="flex items-center gap-1.5 py-1.5 pr-1.5 pl-1.5 sm:gap-2 sm:pr-2">
        <DragHandle {...handle} />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-0.5 text-left"
        >
          <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", meta.tone)}>
            <Icon className="size-4" />
          </span>
          <span className="shrink-0 text-sm font-medium">{meta.label}</span>
          <span className="text-muted-foreground shrink-0 text-xs tabular-nums">#{index + 1}</span>
          {hasError ? (
            <span className="text-destructive flex shrink-0 items-center gap-1 text-xs">
              <AlertCircle className="size-3.5" />
              <span className="hidden sm:inline">Cần bổ sung</span>
            </span>
          ) : null}
          {!open && summary ? (
            <span className="text-muted-foreground hidden min-w-0 truncate text-sm sm:block">{summary}</span>
          ) : null}
        </button>
        <div className="flex shrink-0 items-center">
          <ToolbarButton label="Lên trên" disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp />
          </ToolbarButton>
          <ToolbarButton label="Xuống dưới" disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown />
          </ToolbarButton>
          <ToolbarButton label="Nhân bản" onClick={onDuplicate} className="max-sm:hidden">
            <Copy />
          </ToolbarButton>
          <ToolbarButton label="Xóa khối" onClick={onRemove} className="hover:text-destructive">
            <Trash2 />
          </ToolbarButton>
          <ToolbarButton label={open ? "Thu gọn" : "Mở rộng"} onClick={onToggle}>
            <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
          </ToolbarButton>
        </div>
      </div>
      {open ? (
        <div data-block-body className="flex flex-col gap-4 border-t px-3 py-4 sm:px-4">
          <BlockFields index={index} type={block.type} />
        </div>
      ) : null}
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  className,
  ...props
}: {
  label: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={cn("text-muted-foreground", className)}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function BlockFields({ index, type }: { index: number; type: PostBlockType }) {
  const base = `blocks.${index}`;
  switch (type) {
    case "heading":
      return <HeadingInput name={`${base}.text`} />;
    case "paragraph":
      return <RichTextEditorField name={`${base}.html`} placeholder="Viết đoạn văn…" />;
    case "list":
      return (
        <StringListField
          name={`${base}.items`}
          rich
          addLabel="Thêm ý"
          placeholder="**Ý chính:** diễn giải…"
          description="Mỗi ý là một đoạn ngắn; thường mở đầu bằng **chữ đậm**."
        />
      );
    case "image":
      return (
        <>
          <ImageField name={`${base}.image`} aspect="3/2" folder="blog" />
          <TextField name={`${base}.caption`} label="Chú thích" placeholder="Không bắt buộc — hiển thị dưới ảnh." />
        </>
      );
    case "imagePair":
      return (
        <FieldRow>
          <ImageField name={`${base}.images.0`} label="Ảnh trái" aspect="3/2" folder="blog" />
          <ImageField name={`${base}.images.1`} label="Ảnh phải" aspect="3/2" folder="blog" />
        </FieldRow>
      );
    case "quote":
      return (
        <>
          <TextareaField name={`${base}.text`} label="Câu trích dẫn" rows={3} placeholder="Âm nhạc là…" />
          <TextField name={`${base}.cite`} label="Nguồn" placeholder="DJ J.Grayson — Resident DJ tại NOXX" />
        </>
      );
    case "cta":
      return (
        <FieldRow>
          <TextField name={`${base}.label`} label="Nội dung liên kết" placeholder="Tìm hiểu các khóa học tại Hooked" />
          <HrefField name={`${base}.href`} label="Đường dẫn" />
        </FieldRow>
      );
  }
}

/** Large single-line input for section headings (H2 on the site). */
function HeadingInput({ name }: { name: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const message = (get(errors, name) as { message?: string } | undefined)?.message;
  return (
    <Field data-invalid={message ? true : undefined}>
      <Input
        {...register(name)}
        aria-label="Tiêu đề mục"
        aria-invalid={message ? true : undefined}
        placeholder="1. Tiêu đề phân đoạn"
        className="font-brand h-11 text-lg font-bold tracking-tight md:text-lg"
      />
      <FieldError>{message}</FieldError>
    </Field>
  );
}

// ---------------------------------------------------------------------------------------------------------

/** List of block types (icon, name, description). */
function BlockTypeList({ onPick }: { onPick: (type: PostBlockType) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      {BLOCK_TYPE_ORDER.map((type) => {
        const meta = BLOCK_TYPES[type];
        const Icon = meta.icon;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onPick(type)}
            className="flex items-start gap-3 rounded-md px-2 py-2 text-left outline-none hover:bg-muted focus-visible:bg-muted"
          >
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.tone)}>
              <Icon className="size-4" />
            </span>
            <span className="grid gap-0.5">
              <span className="text-sm font-medium">{meta.label}</span>
              <span className="text-muted-foreground text-xs leading-snug">{meta.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function BlockTypePopover({
  children,
  onPick,
  align = "center",
}: {
  children: ReactNode;
  onPick: (type: PostBlockType) => void;
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-80 p-1.5">
        <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs font-medium">Chọn loại khối</p>
        <BlockTypeList
          onPick={(type) => {
            setOpen(false);
            onPick(type);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Thin "+" divider between blocks. */
function InsertPoint({ onPick }: { onPick: (type: PostBlockType) => void }) {
  return (
    <div className="group/insert relative flex h-6 items-center justify-center">
      <span className="bg-border absolute inset-x-3 top-1/2 h-px opacity-0 transition-opacity group-focus-within/insert:opacity-100 group-hover/insert:opacity-100" />
      <BlockTypePopover onPick={onPick}>
        <button
          type="button"
          aria-label="Chèn khối tại đây"
          className="bg-background text-muted-foreground hover:border-primary hover:text-primary data-[state=open]:border-primary data-[state=open]:text-primary relative flex size-5 items-center justify-center rounded-full border opacity-60 shadow-xs transition-all group-hover/insert:opacity-100 hover:scale-110 hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
        >
          <Plus className="size-3" />
        </button>
      </BlockTypePopover>
    </div>
  );
}

function EmptyBlocks({ onPick }: { onPick: (type: PostBlockType) => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed p-4 sm:p-6">
      <p className="text-sm font-medium">Bắt đầu phần thân bài</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Bài viết được ghép từ các khối nối tiếp nhau. Chọn khối đầu tiên — bạn có thể kéo thả để đổi thứ tự sau.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {BLOCK_TYPE_ORDER.map((type) => {
          const meta = BLOCK_TYPES[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(type)}
              className="hover:border-primary/50 hover:bg-primary/5 flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors"
            >
              <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md", meta.tone)}>
                <Icon className="size-4" />
              </span>
              <span className="grid gap-0.5">
                <span className="text-sm font-medium">{meta.label}</span>
                <span className="text-muted-foreground text-xs leading-snug">{meta.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
