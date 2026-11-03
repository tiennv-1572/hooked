"use client";

import { ChevronDown, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFieldArray, useFormContext, useWatch, type FieldValues } from "react-hook-form";

import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import { FieldDescription, FieldLabel } from "@/admin/components/ui/field";
import { cn } from "@/lib/utils";

type RepeaterFieldProps<T extends FieldValues> = {
  /** Array field path ("instructors", "hero.slides", "ecosystem.capabilities"). */
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Factory for a new row. */
  newItem: () => T;
  /** Header text of a row (collapsed view). */
  itemTitle: (item: T, index: number) => ReactNode;
  /** Optional thumbnail/leading element in the row header. */
  itemLeading?: (item: T, index: number) => ReactNode;
  /** Optional controls in the row header, before duplicate/remove (e.g. a "featured" checkbox). */
  itemActions?: (item: T, index: number) => ReactNode;
  /** Fields of row `index` — use paths like `${name}.${index}.label`. */
  renderItem: (index: number) => ReactNode;
  addLabel?: string;
  max?: number;
  min?: number;
  /** Rows start expanded (default: only newly added rows are expanded). */
  defaultExpanded?: boolean;
  /** Allow duplicating a row. */
  duplicable?: boolean;
};

/**
 * Repeatable group of fields (array of objects) with drag & drop, collapse, duplicate, remove.
 *
 *   <RepeaterField name="instructors" label="Giảng viên" newItem={() => ({ label: "", value: "" })}
 *     itemTitle={(item) => item.value || "Giảng viên mới"}
 *     renderItem={(i) => (<FieldRow><TextField name={`instructors.${i}.label`} label="Vai trò" />
 *                          <TextField name={`instructors.${i}.value`} label="Tên" /></FieldRow>)} />
 */
export function RepeaterField<T extends FieldValues>({
  name,
  label,
  description,
  newItem,
  itemTitle,
  itemLeading,
  itemActions,
  renderItem,
  addLabel = "Thêm mục",
  max,
  min = 0,
  defaultExpanded = false,
  duplicable = false,
}: RepeaterFieldProps<T>) {
  const { control } = useFormContext();
  const { fields, append, remove, move, insert } = useFieldArray({ control, name });
  const values = (useWatch({ control, name }) as T[] | undefined) ?? [];
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    defaultExpanded ? new Set(fields.map((f) => f.id)) : new Set(),
  );
  // Only rows added with the "Thêm" button open automatically (not rows that arrive when the form loads).
  const expandNext = useRef(false);
  const lastId = fields.at(-1)?.id;
  useEffect(() => {
    if (expandNext.current && lastId) {
      expandNext.current = false;
      setExpanded((current) => new Set(current).add(lastId));
    }
  }, [lastId]);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>
            {label} <span className="text-muted-foreground font-normal">({fields.length})</span>
          </FieldLabel>
          {fields.length > 1 ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={() => setExpanded(expanded.size ? new Set() : new Set(fields.map((f) => f.id)))}
            >
              {expanded.size ? "Thu gọn tất cả" : "Mở tất cả"}
            </button>
          ) : null}
        </div>
      ) : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}

      <SortableList
        items={fields}
        getId={(item) => item.id}
        onReorder={(_, from, to) => move(from, to)}
        renderItem={(item, index, handle) => {
          const open = expanded.has(item.id);
          const value = values[index] ?? (item as unknown as T);
          return (
            <div className={cn("rounded-lg border bg-card transition-shadow", open && "shadow-sm")}>
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <DragHandle {...handle} />
                {itemLeading?.(value, index)}
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left text-sm"
                >
                  <span className="text-muted-foreground w-5 shrink-0 text-xs tabular-nums">{index + 1}.</span>
                  <span className="truncate font-medium">{itemTitle(value, index)}</span>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground ml-auto size-4 shrink-0 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {itemActions?.(value, index)}
                {duplicable && (!max || fields.length < max) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => insert(index + 1, structuredClone(value))}
                    aria-label="Nhân bản"
                  >
                    <Copy />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={fields.length <= min}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  aria-label="Xóa mục"
                >
                  <Trash2 />
                </Button>
              </div>
              {open ? <div className="flex flex-col gap-4 border-t px-4 py-4">{renderItem(index)}</div> : null}
            </div>
          );
        }}
      />

      {max && fields.length >= max ? null : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit border-dashed"
          onClick={() => {
            expandNext.current = true;
            append(newItem());
          }}
        >
          <Plus />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
