"use client";

import { ExternalLink, Moon, Plus, Search, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/admin/components/ui/command";
import { Kbd } from "@/admin/components/ui/kbd";
import { useCollection } from "@/admin/lib/cms/hooks";
import { usePreferences } from "@/admin/lib/preferences";

import { adminNav, adminNavItems } from "./nav-config";

/** ⌘K / Ctrl+K: jump to any CMS section, create content, open items, toggle theme. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mode, setMode } = usePreferences();
  const { data: courses } = useCollection("courses");
  const { data: projects } = useCollection("projects");
  const { data: posts } = useCollection("posts");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-muted-foreground flex h-8 w-full max-w-72 items-center gap-2 rounded-lg border bg-muted/40 px-2.5 text-sm transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Tìm kiếm…</span>
        <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Tìm kiếm"
        description="Tìm trang, nội dung hoặc thao tác"
      >
        {/* cmdk needs its <Command> root inside the dialog (shadcn v4's CommandDialog no longer adds it). */}
        <Command>
          <CommandInput placeholder="Tìm trang, khóa học, dự án, bài viết…" />
          <CommandList>
            <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>
            <CommandGroup heading="Tạo mới">
              {adminNavItems
                .filter((item) => item.createHref)
                .map((item) => (
                  <CommandItem
                    key={`new-${item.href}`}
                    onSelect={() => go(item.createHref!)}
                    value={`tạo ${item.title}`}
                  >
                    <Plus />
                    Tạo {item.title.toLowerCase()}
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
            {adminNav.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.title} ${item.keywords?.join(" ") ?? ""}`}
                    onSelect={() => go(item.href)}
                  >
                    <item.icon />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading="Nội dung">
              {courses?.map((course) => (
                <CommandItem
                  key={course.id}
                  value={`khóa học ${course.title}`}
                  onSelect={() => go(`/admin/courses/${course.id}`)}
                >
                  {course.title}
                  <CommandShortcut>Khóa học</CommandShortcut>
                </CommandItem>
              ))}
              {projects?.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`dự án ${project.name}`}
                  onSelect={() => go(`/admin/projects/${project.id}`)}
                >
                  {project.name}
                  <CommandShortcut>Dự án</CommandShortcut>
                </CommandItem>
              ))}
              {posts?.map((post) => (
                <CommandItem
                  key={post.id}
                  value={`bài viết ${post.title}`}
                  onSelect={() => go(`/admin/posts/${post.id}`)}
                >
                  <span className="truncate">{post.title}</span>
                  <CommandShortcut>Bài viết</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Khác">
              <CommandItem
                value="đổi giao diện sáng tối theme"
                onSelect={() => {
                  setMode(mode === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
              >
                {mode === "dark" ? <Sun /> : <Moon />}
                Chuyển giao diện {mode === "dark" ? "sáng" : "tối"}
              </CommandItem>
              <CommandItem
                value="xem website"
                onSelect={() => {
                  setOpen(false);
                  window.open("/", "_blank");
                }}
              >
                <ExternalLink />
                Mở website
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
