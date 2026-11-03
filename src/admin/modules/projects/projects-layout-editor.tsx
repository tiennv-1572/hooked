"use client";

import { Plus, Trash2 } from "lucide-react";
import { get, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { z } from "zod";

import { FormSection } from "@/admin/components/cms/form-fields";
import { Thumb } from "@/admin/components/cms/image-fields";
import { SingletonEditor, useSingletonEditor } from "@/admin/components/cms/singleton-editor";
import { DragHandle, SortableList, type DragHandleProps } from "@/admin/components/cms/sortable-list";
import { StatusPill } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { useCollection } from "@/admin/lib/cms/hooks";
import { createId } from "@/admin/lib/cms/ids";
import {
  PROJECT_CARD_FORMATS,
  type Project,
  type ProjectCardFormat,
  type ProjectsLayout,
  type ProjectsLayoutSlot,
} from "@/admin/lib/cms/types/projects";
import { cn } from "@/lib/utils";

import { PreviewCard, SiteCanvas } from "../site/site-preview";
import { CARD_FORMAT_META } from "./project-utils";
import { FormatMiniMap } from "./project-visuals";

const schema = z.object({
  slots: z.array(
    z.object({
      id: z.string(),
      format: z.enum(PROJECT_CARD_FORMATS),
      projectId: z
        .string()
        .nullable()
        .refine((id) => Boolean(id), "Chọn dự án."),
    }),
  ),
}) satisfies z.ZodType<ProjectsLayout>;

/** /admin/project-layout — cells of the Projects overview "Tất cả" grid: a format and a project each. */
export function ProjectsLayoutEditor() {
  const editor = useSingletonEditor("projectsLayout", schema);
  const { data } = useCollection("projects");
  const projects = [...(data ?? [])].sort((a, b) => a.order - b.order);

  return (
    <SingletonEditor
      editor={editor}
      title="Cài đặt hiển thị dự án"
      description="Lưới “Tất cả” trên trang Projects (desktop): chọn định dạng và dự án cho từng ô. Một dự án có thể nằm ở nhiều ô."
      breadcrumbs={[{ label: "Dashboard", href: "/admin" }, { label: "Cài đặt hiển thị dự án" }]}
    >
      <FormSection title="Các ô">
        <SlotList projects={projects} />
      </FormSection>
      <LayoutPreview projects={projects} />
    </SingletonEditor>
  );
}

const isPublished = (project: Project | undefined): project is Project => project?.status === "published";

function SlotList({ projects }: { projects: Project[] }) {
  const { control } = useFormContext<ProjectsLayout>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "slots", keyName: "key" });
  const slots = (useWatch({ control, name: "slots" }) as ProjectsLayoutSlot[] | undefined) ?? [];
  const placed = new Set(slots.map((slot) => slot.projectId));
  const unplaced = projects.filter((project) => isPublished(project) && !placed.has(project.id));

  return (
    <div className="flex flex-col gap-2">
      {fields.length ? (
        <SortableList
          items={fields}
          getId={(field) => field.key}
          onReorder={(_, from, to) => move(from, to)}
          renderItem={(field, index, handle) => (
            <SlotRow index={index} handle={handle} projects={projects} onRemove={() => remove(index)} />
          )}
        />
      ) : (
        <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-center text-sm">
          Chưa có ô nào — mọi dự án hiển thị full chiều ngang.
        </p>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-fit border-dashed">
            <Plus /> Thêm ô
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {PROJECT_CARD_FORMATS.map((format) => (
            <DropdownMenuItem
              key={format}
              // A new cell starts with the first published project not in the grid yet.
              onSelect={() => append({ id: createId("slot"), format, projectId: unplaced[0]?.id ?? null })}
            >
              <FormatOption format={format} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {fields.length && unplaced.length ? (
        <p className="text-muted-foreground text-xs">
          Chưa có trong lưới “Tất cả”: {unplaced.map((project) => project.name).join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

function SlotRow({
  index,
  handle,
  projects,
  onRemove,
}: {
  index: number;
  handle: DragHandleProps;
  projects: Project[];
  onRemove: () => void;
}) {
  const { control, setValue, formState } = useFormContext<ProjectsLayout>();
  const [format, projectId] = useWatch({
    control,
    name: [`slots.${index}.format`, `slots.${index}.projectId`],
  });
  const error = (get(formState.errors, `slots.${index}.projectId`) as { message?: string } | undefined)?.message;
  const project = projects.find((item) => item.id === projectId);
  const hidden =
    projectId && !isPublished(project) ? (project ? "Bản nháp · không hiển thị" : "Dự án đã bị xóa") : null;

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card py-1.5 pr-1.5 pl-1">
      <div className="flex items-center gap-2">
        <DragHandle {...handle} />
        <span className="text-muted-foreground w-10 shrink-0 text-xs font-medium tabular-nums">Ô {index + 1}</span>
        <Select
          value={format}
          onValueChange={(value) =>
            setValue(`slots.${index}.format`, value as ProjectCardFormat, { shouldDirty: true })
          }
        >
          <SelectTrigger
            size="sm"
            className="w-44 shrink-0 [&_[data-hint]]:hidden"
            aria-label={`Định dạng ô ${index + 1}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROJECT_CARD_FORMATS.map((option) => (
              <SelectItem key={option} value={option}>
                <FormatOption format={option} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={projectId ?? ""}
          onValueChange={(value) =>
            setValue(`slots.${index}.projectId`, value, { shouldDirty: true, shouldValidate: true })
          }
        >
          <SelectTrigger
            size="sm"
            className="min-w-0 flex-1"
            aria-label={`Dự án ô ${index + 1}`}
            aria-invalid={error ? true : undefined}
          >
            <SelectValue placeholder="Chọn dự án" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <span className="flex items-center gap-2">
                  <Thumb image={option.cover} checker={false} className="aspect-video w-8 shrink-0 rounded-sm" />
                  <span className="truncate">{option.name}</span>
                  {option.status === "draft" ? <span className="text-muted-foreground text-xs">Bản nháp</span> : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hidden ? (
          <StatusPill tone="warning" className="hidden shrink-0 sm:inline-flex">
            {hidden}
          </StatusPill>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
          aria-label={`Xóa ô ${index + 1}`}
        >
          <Trash2 />
        </Button>
      </div>
      {error ? <p className="text-destructive pl-[72px] text-xs">{error}</p> : null}
    </div>
  );
}

function FormatOption({ format }: { format: ProjectCardFormat }) {
  const meta = CARD_FORMAT_META[format];
  return (
    <span className="flex items-center gap-2">
      <FormatMiniMap format={format} className="w-10 shrink-0" />
      <span>{meta.label}</span>
      <span data-hint className="text-muted-foreground text-xs">
        {meta.hint}
      </span>
    </span>
  );
}

/**
 * Same grid as the website (src/components/projects/overview/project-gallery.tsx) at the 1192px desktop width,
 * scaled with container units: fixed columns per format, cells packed row by row (`dense`).
 */
const PREVIEW_CELL: Record<ProjectCardFormat, string> = {
  landscape: "col-span-2 col-start-1",
  portrait: "col-start-3 pt-[6.04cqw]",
  wide: "col-span-2 col-start-2",
  compact: "col-start-1 pt-[8.05cqw]",
  panorama: "col-span-3",
};

type PreviewCellData = { key: string; label: string; format: ProjectCardFormat; project: Project | undefined };

function LayoutPreview({ projects }: { projects: Project[] }) {
  const slots = (useWatch<ProjectsLayout>({ name: "slots" }) as ProjectsLayoutSlot[] | undefined) ?? [];
  const byId = new Map(projects.map((project) => [project.id, project]));
  // Same rules as the site (getProjectsGrid): cells whose project is not published are skipped; no cell left → one
  // full-width row per published project. A cell still waiting for its project shows as an empty frame.
  const configured = slots.flatMap((slot, index) => {
    const project = slot.projectId ? byId.get(slot.projectId) : undefined;
    if (slot.projectId && !isPublished(project)) return [];
    return [{ key: slot.id, label: `Ô ${index + 1}`, format: slot.format, project }];
  });
  const cells: PreviewCellData[] = configured.length
    ? configured
    : projects
        .filter(isPublished)
        .map((project) => ({ key: project.id, label: "Tự động", format: "panorama" as const, project }));

  return (
    <PreviewCard href="/projects" description="Desktop · bộ lọc “Tất cả”">
      <SiteCanvas className="p-6">
        <div className="@container">
          {cells.length ? (
            <ol className="grid grid-flow-row-dense grid-cols-[464fr_272fr_408fr] gap-x-[2.01cqw] gap-y-[5.37cqw]">
              {cells.map((cell) => (
                <li key={cell.key} className={cn("min-w-0", PREVIEW_CELL[cell.format])}>
                  <PreviewCell cell={cell} />
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-10 text-center text-sm text-white/50">Chưa có dự án nào được xuất bản.</p>
          )}
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}

function PreviewCell({ cell }: { cell: PreviewCellData }) {
  const { project } = cell;
  return (
    <div className="flex flex-col gap-[1.2cqw]">
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-[1.26cqw]",
          project ? "bg-black" : "border border-dashed border-white/25 bg-white/[0.03]",
        )}
      >
        {project ? <Thumb image={project.cover} checker={false} className="size-full" /> : null}
        <span className="absolute top-[1cqw] left-[1cqw] rounded bg-black/70 px-[0.8cqw] py-[0.3cqw] text-[max(10px,1.1cqw)] font-medium text-white">
          {cell.label} · {CARD_FORMAT_META[cell.format].label}
        </span>
      </div>
      {project ? (
        <p className="truncate text-[max(10px,1.7cqw)] leading-tight font-extrabold text-[#fff4e9] uppercase">
          {project.name}
        </p>
      ) : (
        <p className="text-[max(10px,1.4cqw)] text-white/40">Chưa chọn dự án</p>
      )}
    </div>
  );
}
