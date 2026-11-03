"use client";

import { FolderKanban, Wand2 } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { FieldRow, TextField } from "@/admin/components/cms/form-fields";
import { ImageField, Thumb } from "@/admin/components/cms/image-fields";
import { RepeaterField } from "@/admin/components/cms/repeater-field";
import { PublishBadge } from "@/admin/components/cms/status-badge";
import { Button } from "@/admin/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/admin/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/admin/components/ui/dialog";
import { useCollection } from "@/admin/lib/cms/hooks";
import { createId } from "@/admin/lib/cms/ids";
import type { PartnerCollaboration, PartnersPage } from "@/admin/lib/cms/types/pages";
import type { Project } from "@/admin/lib/cms/types/projects";

import { LinkField } from "./link-field";

/** Card fields taken from a portfolio project: name, partners, detail page link, hero (or cover) image. */
function fromProject(project: Project): Omit<PartnerCollaboration, "id"> {
  return {
    title: project.name,
    partnerLabel: project.partners.join(" - "),
    href: `/projects/${project.slug}`,
    image: project.heroImage?.url ? project.heroImage : project.cover,
  };
}

/** "Dự án hợp tác" cards of /partners, edited and saved with the Partners page. */
export function PartnerCollaborationsField() {
  const { getValues, setValue, formState } = useFormContext<PartnersPage>();
  // `add`: append a card from a project; a number: refill that card.
  const [picker, setPicker] = useState<"add" | number | null>(null);
  // Remounts the repeater after an outside append so its rows keep their collapsed state.
  const [repeaterKey, setRepeaterKey] = useState(0);

  const onPick = (project: Project) => {
    const options = { shouldDirty: true, shouldValidate: formState.isSubmitted };
    const next = fromProject(project);
    if (picker === "add") {
      setValue(
        "collaborations",
        [...(getValues("collaborations") ?? []), { id: createId("collab"), ...next }],
        options,
      );
      setRepeaterKey((key) => key + 1);
      toast.success(`Đã thêm “${project.name}” vào cuối danh sách.`);
    } else if (typeof picker === "number") {
      const base = `collaborations.${picker}` as const;
      setValue(`${base}.title`, next.title, options);
      if (next.partnerLabel) setValue(`${base}.partnerLabel`, next.partnerLabel, options);
      setValue(`${base}.href`, next.href, options);
      if (next.image?.url) setValue(`${base}.image`, next.image, options);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <RepeaterField<PartnerCollaboration>
        key={repeaterKey}
        name="collaborations"
        addLabel="Thêm thẻ trống"
        duplicable
        newItem={() => ({ id: createId("collab"), title: "", partnerLabel: "", href: "", image: undefined as never })}
        itemTitle={(item) => item.title || "Dự án hợp tác mới"}
        itemLeading={(item) => <Thumb image={item.image} className="h-9 w-14 shrink-0 rounded" />}
        renderItem={(index) => (
          <div className="flex flex-col gap-4">
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setPicker(index)}>
              <Wand2 /> Điền từ dự án
            </Button>
            <FieldRow>
              <TextField
                name={`collaborations.${index}.title`}
                label="Tên dự án"
                required
                placeholder="Vui Fest Cát Bà"
              />
              <TextField
                name={`collaborations.${index}.partnerLabel`}
                label="Đối tác"
                required
                placeholder="Golden Sky Media - Sun Group"
              />
            </FieldRow>
            <LinkField
              name={`collaborations.${index}.href`}
              label="Liên kết"
              required
              sources={["projects", "pages", "posts"]}
            />
            <ImageField
              name={`collaborations.${index}.image`}
              label="Ảnh"
              required
              aspect="3/2"
              folder="partners"
              className="w-full sm:w-1/2"
            />
          </div>
        )}
      />
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => setPicker("add")}>
        <FolderKanban /> Thêm từ dự án
      </Button>
      <ProjectPickerDialog
        open={picker !== null}
        onOpenChange={(open) => (open ? null : setPicker(null))}
        refill={typeof picker === "number"}
        onPick={onPick}
      />
    </div>
  );
}

function ProjectPickerDialog({
  open,
  onOpenChange,
  refill,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refill: boolean;
  onPick: (project: Project) => void;
}) {
  const { data: projects } = useCollection("projects");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 p-0 sm:max-w-lg">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Chọn dự án</DialogTitle>
          <DialogDescription>
            {refill
              ? "Tên, đối tác, liên kết và ảnh của thẻ sẽ được thay bằng thông tin của dự án."
              : "Thẻ mới lấy tên, đối tác, liên kết và ảnh của dự án."}
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-none! border-t">
          <CommandInput placeholder="Tìm dự án…" />
          <CommandList className="max-h-[min(420px,60vh)]">
            <CommandEmpty>
              <span className="text-muted-foreground flex flex-col items-center gap-2">
                <FolderKanban className="size-5" /> Không có dự án phù hợp.
              </span>
            </CommandEmpty>
            <CommandGroup>
              {projects?.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`${project.name} ${project.partners.join(" ")} ${project.slug}`}
                  onSelect={() => {
                    onPick(project);
                    onOpenChange(false);
                  }}
                  className="gap-3"
                >
                  <Thumb image={project.cover} className="h-12 w-16 shrink-0 rounded-md" />
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate font-medium">{project.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {project.partners.length ? project.partners.join(" - ") : "Chưa có đối tác"}
                    </span>
                  </span>
                  <PublishBadge status={project.status} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
