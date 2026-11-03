"use client";

import { ExternalLink, FileText, FolderKanban, Link2, Newspaper } from "lucide-react";
import { useState, type ReactNode } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/admin/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/admin/components/ui/command";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { useCollection } from "@/admin/lib/cms/hooks";
import { cn } from "@/lib/utils";

import { findSiteRoute, isExternalHref, SITE_ROUTES } from "./site-routes";

export type PickedLink = {
  href: string;
  /** Suggested label (route label, project or post title). */
  label: string;
  kind: "page" | "project" | "post";
};

/**
 * Searchable list of site pages, projects and blog posts. Mounted only while its popover is open,
 * so the collections are read lazily.
 */
export function LinkPicker({
  onPick,
  current,
  sources = ["pages", "projects", "posts"],
}: {
  onPick: (link: PickedLink) => void;
  current?: string;
  sources?: ("pages" | "projects" | "posts")[];
}) {
  const projects = useCollection("projects");
  const posts = useCollection("posts");
  return (
    <Command>
      <CommandInput placeholder="Tìm trang, dự án, bài viết…" />
      <CommandList>
        <CommandEmpty>Không tìm thấy.</CommandEmpty>
        {sources.includes("pages") ? (
          <CommandGroup heading="Trang">
            {SITE_ROUTES.map((route) => (
              <CommandItem
                key={route.href}
                value={`page ${route.href} ${route.title} ${route.label}`}
                data-checked={current === route.href}
                onSelect={() => onPick({ href: route.href, label: route.label, kind: "page" })}
              >
                <FileText className="text-muted-foreground" />
                <span className="truncate">{route.title}</span>
                <span className="text-muted-foreground ml-auto truncate text-xs">{route.href}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {sources.includes("projects") && projects.data?.length ? (
          <CommandGroup heading="Dự án">
            {projects.data.map((project) => {
              const href = `/projects/${project.slug}`;
              return (
                <CommandItem
                  key={project.id}
                  value={`project ${href} ${project.name}`}
                  data-checked={current === href}
                  onSelect={() => onPick({ href, label: project.name, kind: "project" })}
                >
                  <FolderKanban className="text-muted-foreground" />
                  <span className="truncate">{project.name}</span>
                  {project.status === "draft" ? (
                    <span className="text-muted-foreground ml-auto text-[10px]">Nháp</span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
        {sources.includes("posts") && posts.data?.length ? (
          <CommandGroup heading="Bài viết">
            {posts.data.map((post) => {
              const href = `/blog/${post.slug}`;
              return (
                <CommandItem
                  key={post.id}
                  value={`post ${href} ${post.title}`}
                  data-checked={current === href}
                  onSelect={() => onPick({ href, label: post.title, kind: "post" })}
                >
                  <Newspaper className="text-muted-foreground" />
                  <span className="truncate">{post.title}</span>
                  {post.status === "draft" ? (
                    <span className="text-muted-foreground ml-auto text-[10px]">Nháp</span>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ) : null}
      </CommandList>
    </Command>
  );
}

/** Small "→ Trang Academy" / "Liên kết ngoài" hint under a link input. */
export function LinkHint({ href, className }: { href: string | undefined; className?: string }) {
  if (!href) return null;
  const route = findSiteRoute(href);
  let content: ReactNode = null;
  if (isExternalHref(href)) {
    content = (
      <>
        <ExternalLink className="size-3" /> Liên kết ngoài
      </>
    );
  } else if (route && route.href === href) {
    content = (
      <>
        <FileText className="size-3" /> {route.title}
      </>
    );
  } else if (href.startsWith("/projects/")) {
    content = (
      <>
        <FolderKanban className="size-3" /> Trang chi tiết dự án
      </>
    );
  } else if (href.startsWith("/blog/")) {
    content = (
      <>
        <Newspaper className="size-3" /> Bài viết
      </>
    );
  } else if (route) {
    content = (
      <>
        <FileText className="size-3" /> {route.title}
      </>
    );
  }
  if (!content) return null;
  return (
    <span className={cn("text-muted-foreground inline-flex items-center gap-1 text-xs", className)}>{content}</span>
  );
}

type LinkFieldProps = {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  placeholder?: string;
  className?: string;
  sources?: ("pages" | "projects" | "posts")[];
  /** Called after a pick (e.g. to also fill a title). */
  onPicked?: (link: PickedLink) => void;
};

/**
 * Link input (internal path or URL) with a "Chọn trang" picker listing site pages, projects and posts.
 *
 *   <LinkField name="cta.href" label="Đường dẫn" required />
 */
export function LinkField({
  name,
  label,
  description,
  required,
  placeholder = "/academy hoặc https://…",
  className,
  sources,
  onPicked,
}: LinkFieldProps) {
  const { register, setValue, formState, control } = useFormContext();
  const [open, setOpen] = useState(false);
  const value = useWatch({ control, name }) as string | undefined;
  const message = (get(formState.errors, name) as { message?: string } | undefined)?.message;

  return (
    <Field data-invalid={message ? true : undefined} className={className}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor={name}>
            {label}
            {required ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
          <LinkHint href={value} />
        </div>
      ) : null}
      <div className="flex">
        <Input
          id={name}
          placeholder={placeholder}
          aria-invalid={message ? true : undefined}
          className="rounded-r-none"
          {...register(name)}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="rounded-l-none border-l-0 px-2.5"
              aria-label="Chọn trang"
            >
              <Link2 />
              <span className="hidden sm:inline">Chọn</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            {open ? (
              <LinkPicker
                current={value}
                sources={sources}
                onPick={(link) => {
                  setValue(name, link.href, { shouldDirty: true, shouldValidate: formState.isSubmitted });
                  onPicked?.(link);
                  setOpen(false);
                }}
              />
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
