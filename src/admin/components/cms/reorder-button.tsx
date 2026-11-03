"use client";

import { ArrowDownUp } from "lucide-react";
import { useState, type ReactNode } from "react";

import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { Button } from "@/admin/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/admin/components/ui/sheet";
import { Spinner } from "@/admin/components/ui/spinner";
import { useReorder } from "@/admin/lib/cms/hooks";
import type { CollectionItem, CollectionKey } from "@/admin/lib/cms/registry";

type ReorderButtonProps<K extends CollectionKey> = {
  collection: K;
  items: CollectionItem<K>[] | undefined;
  /** Row content (thumbnail + title). */
  renderItem: (item: CollectionItem<K>) => ReactNode;
  description?: string;
};

/**
 * "Sắp xếp" button for ordered collections: opens a drag & drop sheet and saves the order
 * (the public site lists items in this order).
 */
export function ReorderButton<K extends CollectionKey>({
  collection,
  items,
  renderItem,
  description,
}: ReorderButtonProps<K>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CollectionItem<K>[]>([]);
  const reorder = useReorder(collection);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setDraft(items ?? []);
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" disabled={!items?.length}>
          <ArrowDownUp /> Sắp xếp
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Sắp xếp thứ tự</SheetTitle>
          <SheetDescription>{description ?? "Kéo thả để đổi thứ tự hiển thị trên website."}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <SortableList
            items={draft}
            getId={(item) => item.id}
            onReorder={setDraft}
            renderItem={(item, index, handle) => (
              <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
                <DragHandle {...handle} />
                <span className="text-muted-foreground w-5 text-xs tabular-nums">{index + 1}</span>
                <div className="flex min-w-0 flex-1 items-center gap-2">{renderItem(item)}</div>
              </div>
            )}
          />
        </div>
        <SheetFooter>
          <Button
            disabled={reorder.isPending}
            onClick={async () => {
              await reorder.mutateAsync(draft.map((item) => item.id));
              setOpen(false);
            }}
          >
            {reorder.isPending ? <Spinner /> : null}
            Lưu thứ tự
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
