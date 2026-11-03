"use client";

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FieldShell, type BaseFieldProps } from "@/admin/components/cms/form-fields";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Separator } from "@/admin/components/ui/separator";
import { Toggle } from "@/admin/components/ui/toggle";
import { cn } from "@/lib/utils";

/**
 * WYSIWYG text (Tiptap) bound to a react-hook-form field. Value: HTML (`<p>`, `<strong>`, `<em>`, `<u>`, `<a>`,
 * lists, quotes) — "" when empty. The server sanitizes it again before it reaches the site / API.
 */
export function RichTextEditorField({
  name,
  label,
  description,
  required,
  className,
  placeholder,
}: BaseFieldProps & { placeholder?: string }) {
  const { control } = useFormContext();
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <RichTextEditor
            value={(field.value as string | undefined) ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            focusRef={field.ref}
            invalid={Boolean(fieldState.error)}
            placeholder={placeholder}
          />
        )}
      />
    </FieldShell>
  );
}

const STARTER_KIT = {
  heading: false,
  code: false,
  codeBlock: false,
  horizontalRule: false,
  strike: false,
  link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
} as const;

const EDITOR_PROPS = { attributes: { "aria-multiline": "true", role: "textbox" } };

function RichTextEditor({
  value,
  onChange,
  onBlur,
  focusRef,
  invalid,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur: () => void;
  focusRef: (instance: { focus: () => void } | null) => void;
  invalid: boolean;
  placeholder?: string;
}) {
  const [initialContent] = useState(value);
  const extensions = useMemo(
    () => [StarterKit.configure(STARTER_KIT), Placeholder.configure({ placeholder })],
    [placeholder],
  );
  // Options must stay identical between renders: when they differ, useEditor calls `setOptions` → `view.updateState`,
  // which drops keystrokes the browser has inserted but ProseMirror has not read yet.
  const editor = useEditor({
    // Rendered on the client only (avoids hydration mismatches in the App Router).
    immediatelyRender: false,
    extensions,
    content: initialContent,
    editorProps: EDITOR_PROPS,
  });

  // Last HTML the editor reported: an incoming `value` equal to it is our own edit, anything else came from outside.
  const emitted = useRef(initialContent);
  useEffect(() => {
    if (!editor) return;
    const update = () => {
      emitted.current = editor.isEmpty ? "" : editor.getHTML();
      onChange(emitted.current);
    };
    editor.on("update", update);
    editor.on("blur", onBlur);
    return () => {
      editor.off("update", update);
      editor.off("blur", onBlur);
    };
  }, [editor, onChange, onBlur]);

  // Follow outside changes (form reset after loading / saving) without echoing them back as edits. Comparing with
  // the editor's live HTML instead would rewind fast typing to a value from a few keystrokes earlier.
  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  // Lets react-hook-form focus the editor on a validation error.
  useEffect(() => {
    focusRef(editor ? { focus: () => editor.commands.focus() } : null);
  }, [editor, focusRef]);

  return (
    <div
      aria-invalid={invalid || undefined}
      className={cn(
        "border-input dark:bg-input/30 overflow-hidden rounded-lg border transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
      )}
    >
      {editor ? <Toolbar editor={editor} /> : <div className="h-10 border-b" />}
      <EditorContent
        editor={editor}
        className={cn(
          "max-h-[560px] overflow-y-auto px-3 py-2.5 text-sm leading-6",
          "[&_.ProseMirror]:min-h-48 [&_.ProseMirror]:outline-none",
          "[&_.ProseMirror>*+*]:mt-3 [&_li>p]:m-0",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-1.5 py-1">
      <Mark label="Đậm (Ctrl+B)" pressed={state.bold} onPress={() => chain().toggleBold().run()}>
        <Bold />
      </Mark>
      <Mark label="Nghiêng (Ctrl+I)" pressed={state.italic} onPress={() => chain().toggleItalic().run()}>
        <Italic />
      </Mark>
      <Mark label="Gạch chân (Ctrl+U)" pressed={state.underline} onPress={() => chain().toggleUnderline().run()}>
        <Underline />
      </Mark>
      <LinkButton editor={editor} active={state.link} />
      <Separator orientation="vertical" className="mx-1 h-5!" />
      <Mark label="Danh sách" pressed={state.bulletList} onPress={() => chain().toggleBulletList().run()}>
        <List />
      </Mark>
      <Mark label="Danh sách số" pressed={state.orderedList} onPress={() => chain().toggleOrderedList().run()}>
        <ListOrdered />
      </Mark>
      <Mark label="Trích dẫn" pressed={state.blockquote} onPress={() => chain().toggleBlockquote().run()}>
        <Quote />
      </Mark>
      <Separator orientation="vertical" className="mx-1 h-5!" />
      <Mark label="Xóa định dạng" onPress={() => chain().unsetAllMarks().clearNodes().run()}>
        <RemoveFormatting />
      </Mark>
      <div className="ml-auto flex gap-0.5">
        <Mark label="Hoàn tác (Ctrl+Z)" disabled={!state.canUndo} onPress={() => chain().undo().run()}>
          <Undo2 />
        </Mark>
        <Mark label="Làm lại (Ctrl+Shift+Z)" disabled={!state.canRedo} onPress={() => chain().redo().run()}>
          <Redo2 />
        </Mark>
      </div>
    </div>
  );
}

function Mark({
  label,
  pressed = false,
  disabled,
  onPress,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Toggle
      size="sm"
      className="px-0"
      pressed={pressed}
      disabled={disabled}
      onPressedChange={onPress}
      // Keep focus (and the selection) in the editor: the next keystrokes would be lost while it is handed back.
      onMouseDown={(event) => event.preventDefault()}
      aria-label={label}
      title={label}
    >
      {children}
    </Toggle>
  );
}

function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  const apply = () => {
    const url = href.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (url) chain.setLink({ href: url }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Toggle size="sm" className="px-0" pressed={active} aria-label="Liên kết" title="Liên kết">
          <Link2 />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            apply();
          }}
        >
          <Input
            autoFocus
            value={href}
            onChange={(event) => setHref(event.target.value)}
            placeholder="https://… hoặc /academy"
            aria-label="Địa chỉ liên kết"
          />
          <div className="flex justify-end gap-2">
            {active ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  setOpen(false);
                }}
              >
                <Unlink /> Bỏ liên kết
              </Button>
            ) : null}
            <Button type="submit" size="sm">
              Áp dụng
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
