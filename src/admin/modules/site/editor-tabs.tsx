"use client";

import type { LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { get, useFormState, type FieldErrors } from "react-hook-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/admin/components/ui/tabs";
import { cn } from "@/lib/utils";

export type EditorTab = {
  value: string;
  label: string;
  icon?: LucideIcon;
  /** Form paths edited in this tab — an error under any of them marks the tab. */
  fields: string[];
  /** Small counter after the label (slides, items…). */
  count?: number;
  content: ReactNode;
};

function tabHasError(errors: FieldErrors, tab: EditorTab) {
  return tab.fields.some((path) => get(errors, path) !== undefined);
}

/**
 * Tabs for long singleton editors: scrollable tab bar on mobile, a red dot on tabs holding invalid fields,
 * and a jump to the first invalid tab after a failed save.
 */
export function EditorTabs({ tabs, className }: { tabs: EditorTab[]; className?: string }) {
  const { errors, submitCount } = useFormState();
  const [tab, setTab] = useState(tabs[0]?.value ?? "");
  const [handledSubmit, setHandledSubmit] = useState(submitCount);

  // After a failed save, jump to the first tab holding an error (unless the current one has errors too).
  if (submitCount !== handledSubmit) {
    setHandledSubmit(submitCount);
    const current = tabs.find((item) => item.value === tab);
    const firstInvalid = tabs.find((item) => tabHasError(errors, item));
    if (firstInvalid && !(current && tabHasError(errors, current))) setTab(firstInvalid.value);
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className={cn("gap-5", className)}>
      <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 md:mx-0 md:px-0">
        <TabsList className="h-10! w-max min-w-full justify-start gap-0.5 md:min-w-0">
          {tabs.map((item) => {
            const Icon = item.icon;
            const invalid = tabHasError(errors, item);
            return (
              <TabsTrigger key={item.value} value={item.value} className="flex-none px-3">
                {Icon ? <Icon /> : null}
                {item.label}
                {item.count !== undefined ? (
                  <span className="bg-muted-foreground/12 text-muted-foreground rounded-full px-1.5 text-[10px] leading-4 font-semibold tabular-nums">
                    {item.count}
                  </span>
                ) : null}
                {invalid ? (
                  <span className="bg-destructive size-1.5 rounded-full" aria-label="Có trường chưa hợp lệ" />
                ) : null}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
      {tabs.map((item) => (
        // Kept mounted so expanded rows, previews and scroll state survive switching tabs.
        <TabsContent key={item.value} value={item.value} forceMount className="min-w-0 data-[state=inactive]:hidden">
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

/** Form column + sticky preview column (stacks under the form below `xl`). */
export function TabLayout({ preview, children }: { preview?: ReactNode; children: ReactNode }) {
  if (!preview) return <div className="flex flex-col gap-6">{children}</div>;
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
      <aside className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-20">{preview}</aside>
    </div>
  );
}
