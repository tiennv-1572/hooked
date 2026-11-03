"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DragHandleProps = HTMLAttributes<HTMLButtonElement>;

type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  /** Called with the new order after a drop (and keyboard moves: Space → arrows → Space). */
  onReorder: (items: T[], from: number, to: number) => void;
  renderItem: (item: T, index: number, handle: DragHandleProps, isDragging: boolean) => ReactNode;
  /** `grid` for thumbnail galleries. */
  layout?: "list" | "grid";
  className?: string;
};

/**
 * Drag & drop list (dnd-kit). Render a `<DragHandle {...handle} />` inside each item.
 * Works with mouse, touch and keyboard.
 */
export function SortableList<T>({
  items,
  getId,
  onReorder,
  renderItem,
  layout = "list",
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map(getId);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    onReorder(arrayMove(items, from, to), from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={layout === "list" ? [restrictToVerticalAxis, restrictToParentElement] : [restrictToParentElement]}
    >
      <SortableContext items={ids} strategy={layout === "list" ? verticalListSortingStrategy : rectSortingStrategy}>
        <div
          className={cn(
            layout === "list" ? "flex flex-col gap-2" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
            className,
          )}
        >
          {items.map((item, index) => (
            <SortableItem key={getId(item)} id={getId(item)}>
              {(handle, isDragging) => renderItem(item, index, handle, isDragging)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: DragHandleProps, isDragging: boolean) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: "relative",
  };
  const handle = { ...attributes, ...listeners, ref: setActivatorNodeRef } as DragHandleProps;
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-80 drop-shadow-lg")}>
      {children(handle, isDragging)}
    </div>
  );
}

/** Grip button used as the drag activator. */
export function DragHandle({ className, ...props }: DragHandleProps) {
  return (
    <button
      type="button"
      aria-label="Kéo để sắp xếp"
      className={cn(
        "text-muted-foreground hover:text-foreground flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md hover:bg-muted active:cursor-grabbing",
        className,
      )}
      {...props}
    >
      <GripVertical className="size-4" />
    </button>
  );
}
