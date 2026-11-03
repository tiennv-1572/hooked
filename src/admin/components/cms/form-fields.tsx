"use client";

import { Bold, CalendarIcon, Link2, Lock, Plus, RefreshCw, Trash2, Unlock, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, get, useFormContext, useWatch, type FieldValues, type Path } from "react-hook-form";

import { DragHandle, SortableList } from "@/admin/components/cms/sortable-list";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Calendar } from "@/admin/components/ui/calendar";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/admin/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/admin/components/ui/select";
import { Switch } from "@/admin/components/ui/switch";
import { Textarea } from "@/admin/components/ui/textarea";
import { slugify } from "@/admin/lib/cms/ids";
import { parseInline } from "@/admin/lib/cms/inline";
import { formatDate } from "@/admin/lib/format";
import { cn } from "@/lib/utils";

/*
 * Form building blocks bound to react-hook-form through `useFormContext()`.
 * Wrap the form in <FormProvider {...form}> (EntityEditor / SingletonEditor already do) and write:
 *
 *   <FormSection title="Thông tin chung">
 *     <TextField name="title" label="Tiêu đề" required />
 *     <SlugField name="slug" source="title" prefix="/academy/" />
 *     <TextareaField name="description" label="Mô tả" rows={4} />
 *   </FormSection>
 *
 * `name` accepts nested paths ("seo.title", "instructors.0.value").
 */

export type BaseFieldProps = {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  className?: string;
};

function useFieldError(name: string) {
  const {
    formState: { errors },
  } = useFormContext();
  const error = get(errors, name) as { message?: string } | undefined;
  return error?.message ? [{ message: error.message }] : undefined;
}

export function FieldShell({
  name,
  label,
  description,
  required,
  className,
  children,
  aside,
}: BaseFieldProps & { children: ReactNode; aside?: ReactNode }) {
  const errors = useFieldError(name);
  return (
    <Field data-invalid={errors ? true : undefined} className={className}>
      {label || aside ? (
        <div className="flex items-center justify-between gap-2">
          {label ? (
            <FieldLabel htmlFor={name}>
              {label}
              {required ? <span className="text-destructive">*</span> : null}
            </FieldLabel>
          ) : (
            <span />
          )}
          {aside}
        </div>
      ) : null}
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={errors} />
    </Field>
  );
}

/** Card grouping related fields. */
export function FormSection({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn("gap-4", className)}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("flex flex-col gap-5", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/** Two fields side by side from `sm` up. */
export function FieldRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-5 sm:grid-cols-2", className)}>{children}</div>;
}

function CharCount({ name, max }: { name: string; max: number }) {
  const value = useWatch({ name }) as string | undefined;
  const length = value?.length ?? 0;
  return (
    <span className={cn("text-muted-foreground text-xs tabular-nums", length > max && "text-destructive")}>
      {length}/{max}
    </span>
  );
}

export function TextField({
  name,
  label,
  description,
  required,
  className,
  placeholder,
  type = "text",
  maxLength,
  prefix,
  autoFocus,
}: BaseFieldProps & {
  placeholder?: string;
  type?: "text" | "email" | "url" | "tel" | "password";
  /** Shows a live character counter (does not block typing). */
  maxLength?: number;
  /** Static text before the input ("https://", "/projects/"). */
  prefix?: string;
  autoFocus?: boolean;
}) {
  const { register } = useFormContext();
  const errors = useFieldError(name);
  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      aside={maxLength ? <CharCount name={name} max={maxLength} /> : undefined}
    >
      <div className="flex">
        {prefix ? (
          <span className="text-muted-foreground flex items-center rounded-l-lg border border-r-0 bg-muted px-2.5 text-sm">
            {prefix}
          </span>
        ) : null}
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          aria-invalid={errors ? true : undefined}
          autoFocus={autoFocus}
          className={cn(prefix && "rounded-l-none")}
          {...register(name)}
        />
      </div>
    </FieldShell>
  );
}

export function NumberField({
  name,
  label,
  description,
  required,
  className,
  min,
  max,
  step,
  suffix,
}: BaseFieldProps & { min?: number; max?: number; step?: number; suffix?: string }) {
  const { register } = useFormContext();
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <div className="flex">
        <Input
          id={name}
          type="number"
          min={min}
          max={max}
          step={step}
          className={cn(suffix && "rounded-r-none")}
          {...register(name, { valueAsNumber: true })}
        />
        {suffix ? (
          <span className="text-muted-foreground flex items-center rounded-r-lg border border-l-0 bg-muted px-2.5 text-sm">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldShell>
  );
}

export function TextareaField({
  name,
  label,
  description,
  required,
  className,
  placeholder,
  rows = 4,
  maxLength,
}: BaseFieldProps & { placeholder?: string; rows?: number; maxLength?: number }) {
  const { register } = useFormContext();
  const errors = useFieldError(name);
  return (
    <FieldShell
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
      aside={maxLength ? <CharCount name={name} max={maxLength} /> : undefined}
    >
      <Textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={errors ? true : undefined}
        {...register(name)}
      />
    </FieldShell>
  );
}

/** Renders inline markdown (**bold**, [link](/href)) as the site would. */
export function InlinePreview({ value, className }: { value: string; className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed", className)}>
      {parseInline(value).map((part, index) =>
        typeof part === "string" ? (
          <span key={index}>{part}</span>
        ) : part.href ? (
          <a
            key={index}
            href={part.href}
            target="_blank"
            rel="noreferrer"
            className="text-primary font-medium underline underline-offset-2"
          >
            {part.text}
          </a>
        ) : (
          <strong key={index}>{part.text}</strong>
        ),
      )}
    </p>
  );
}

/**
 * Textarea with **bold** / [link](url) helpers and a live preview — for blog paragraphs, intros, list items.
 */
export function RichTextField({
  name,
  label,
  description,
  required,
  className,
  rows = 4,
  placeholder,
  showPreview = true,
}: BaseFieldProps & { rows?: number; placeholder?: string; showPreview?: boolean }) {
  const { control, setValue } = useFormContext();
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const value = (useWatch({ control, name }) as string | undefined) ?? "";

  const wrap = (kind: "bold" | "link") => {
    const area = ref.current;
    if (!area) return;
    const { selectionStart: start, selectionEnd: end } = area;
    const selected = value.slice(start, end) || (kind === "bold" ? "chữ đậm" : "văn bản");
    const insert = kind === "bold" ? `**${selected}**` : `[${selected}](/duong-dan)`;
    setValue(name, value.slice(0, start) + insert + value.slice(end), { shouldDirty: true });
    requestAnimationFrame(() => {
      area.focus();
      const caret = start + insert.length;
      area.setSelectionRange(caret, caret);
    });
  };

  return (
    <FieldShell
      name={name}
      label={label}
      description={description ?? "Dùng **chữ đậm** và [liên kết](/duong-dan)."}
      required={required}
      className={className}
      aside={
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => wrap("bold")} aria-label="Chữ đậm">
            <Bold />
          </Button>
          <Button type="button" variant="ghost" size="icon-xs" onClick={() => wrap("link")} aria-label="Chèn liên kết">
            <Link2 />
          </Button>
        </div>
      }
    >
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Textarea
            id={name}
            rows={rows}
            placeholder={placeholder}
            aria-invalid={fieldState.error ? true : undefined}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={(element) => {
              field.ref(element);
              ref.current = element;
            }}
          />
        )}
      />
      {showPreview && /\*\*|\]\(/.test(value) ? (
        <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2">
          <InlinePreview value={value} className="text-muted-foreground" />
        </div>
      ) : null}
    </FieldShell>
  );
}

export type SelectOption = { label: string; value: string; description?: string };

export function SelectField({
  name,
  label,
  description,
  required,
  className,
  options,
  placeholder = "Chọn…",
}: BaseFieldProps & { options: SelectOption[]; placeholder?: string }) {
  const { control } = useFormContext();
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger id={name} className="w-full" aria-invalid={fieldState.error ? true : undefined}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FieldShell>
  );
}

/** Toggle row: label + description on the left, switch on the right. */
export function SwitchField({ name, label, description, className }: BaseFieldProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label
          htmlFor={name}
          className={cn(
            "flex items-start justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/40",
            className,
          )}
        >
          <span className="grid gap-0.5">
            <span className="text-sm font-medium">{label}</span>
            {description ? <span className="text-muted-foreground text-xs">{description}</span> : null}
          </span>
          <Switch id={name} checked={Boolean(field.value)} onCheckedChange={field.onChange} />
        </label>
      )}
    />
  );
}

/** Multi-select as toggle chips (categories, roles…). Value: string[]. */
export function ChipsField({
  name,
  label,
  description,
  required,
  className,
  options,
}: BaseFieldProps & { options: SelectOption[] }) {
  const { control } = useFormContext();
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value: string[] = field.value ?? [];
          return (
            <div className="flex flex-wrap gap-2">
              {options.map((option) => {
                const active = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      field.onChange(active ? value.filter((item) => item !== option.value) : [...value, option.value])
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:border-primary/50 hover:bg-muted",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}

/** Free-form tags: type + Enter. Value: string[]. */
export function TagsField({
  name,
  label,
  description,
  required,
  className,
  placeholder = "Nhập rồi nhấn Enter",
  suggestions = [],
}: BaseFieldProps & { placeholder?: string; suggestions?: string[] }) {
  const { control } = useFormContext();
  const [draft, setDraft] = useState("");
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value: string[] = field.value ?? [];
          const add = (tag: string) => {
            const clean = tag.trim();
            if (clean && !value.includes(clean)) field.onChange([...value, clean]);
            setDraft("");
          };
          return (
            <div className="flex flex-col gap-2">
              <div className="focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border bg-transparent px-2 py-1.5 focus-within:ring-3">
                {value.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => field.onChange(value.filter((item) => item !== tag))}
                      aria-label={`Bỏ ${tag}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  id={name}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      add(draft);
                    } else if (event.key === "Backspace" && !draft && value.length) {
                      field.onChange(value.slice(0, -1));
                    }
                  }}
                  onBlur={() => draft && add(draft)}
                  placeholder={value.length ? "" : placeholder}
                  className="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
              {suggestions.filter((item) => !value.includes(item)).length ? (
                <div className="flex flex-wrap gap-1">
                  {suggestions
                    .filter((item) => !value.includes(item))
                    .map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => add(item)}
                        className="text-muted-foreground hover:border-primary hover:text-primary rounded-full border border-dashed px-2 py-0.5 text-xs"
                      >
                        + {item}
                      </button>
                    ))}
                </div>
              ) : null}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}

/**
 * URL slug generated from `source` while the user hasn't edited it by hand (lock icon toggles).
 * Shows the public path preview.
 */
export function SlugField({
  name,
  source,
  label = "Đường dẫn (slug)",
  prefix = "/",
  description,
  className,
}: Omit<BaseFieldProps, "label"> & { source: string; prefix?: string; label?: ReactNode }) {
  const { setValue, getValues, formState, subscribe } = useFormContext();
  // null = automatic: locked once the item has a saved slug (the default set by `reset()` when it loads).
  const [manualLock, setLocked] = useState<boolean | null>(() => (getValues(name) ? true : null));
  const locked = manualLock ?? Boolean(get(formState.defaultValues, name));

  // Follow the source only while the user edits it — never when `reset()` loads a saved item
  // (fields mount before the reset, so a value-watching effect used to overwrite saved slugs).
  useEffect(() => {
    if (locked) return;
    return subscribe({
      name: source,
      formState: { values: true },
      callback: ({ values, type }) => {
        if (type !== "change") return;
        setValue(name, slugify(String(get(values, source) ?? "")), {
          shouldDirty: true,
          shouldValidate: formState.isSubmitted,
        });
      },
    });
  }, [locked, subscribe, source, name, setValue, formState.isSubmitted]);

  const { register } = useFormContext();
  const errors = useFieldError(name);
  return (
    <FieldShell
      name={name}
      label={label}
      description={
        description ?? (locked ? "Đã khóa — đổi tiêu đề không làm thay đổi đường dẫn." : "Tự tạo từ tiêu đề.")
      }
      className={className}
    >
      <div className="flex">
        <span className="text-muted-foreground flex items-center rounded-l-lg border border-r-0 bg-muted px-2.5 text-sm">
          {prefix}
        </span>
        <Input
          id={name}
          aria-invalid={errors ? true : undefined}
          className="rounded-none"
          {...register(name, { onChange: () => setLocked(true) })}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-none border-l-0"
          onClick={() => setValue(name, slugify(getValues(source) ?? ""), { shouldDirty: true })}
          aria-label="Tạo lại từ tiêu đề"
        >
          <RefreshCw />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-l-none border-l-0"
          onClick={() => setLocked(!locked)}
          aria-label={locked ? "Mở khóa tự động" : "Khóa đường dẫn"}
        >
          {locked ? <Lock /> : <Unlock />}
        </Button>
      </div>
    </FieldShell>
  );
}

/** ISO date picker. Value: ISO string | undefined. */
export function DateField({ name, label, description, required, className }: BaseFieldProps) {
  const { control } = useFormContext();
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const date = field.value ? new Date(field.value) : undefined;
          return (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button id={name} type="button" variant="outline" className="flex-1 justify-start font-normal">
                    <CalendarIcon />
                    {date ? formatDate(date) : <span className="text-muted-foreground">Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(next) => field.onChange(next ? next.toISOString() : undefined)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              {date ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => field.onChange(undefined)}
                  aria-label="Xóa ngày"
                >
                  <X />
                </Button>
              ) : null}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}

/**
 * Ordered list of strings (modules, benefits, title lines…). Value: string[].
 * Drag to reorder, add/remove rows; `multiline` uses textareas.
 */
export function StringListField({
  name,
  label,
  description,
  required,
  className,
  placeholder,
  addLabel = "Thêm dòng",
  multiline = false,
  rich = false,
  max,
}: BaseFieldProps & { placeholder?: string; addLabel?: string; multiline?: boolean; rich?: boolean; max?: number }) {
  const { control } = useFormContext();
  // Rows added with the button take focus when they mount (rows loaded with the form do not).
  const [focusAdded, setFocusAdded] = useState(false);
  return (
    <FieldShell name={name} label={label} description={description} required={required} className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value: string[] = field.value ?? [];
          // Position-based ids: the list holds plain strings, so there is no stable identity to key on.
          const rows = value.map((text, index) => ({ id: `row-${index}`, text }));
          const update = (index: number, text: string) =>
            field.onChange(value.map((item, i) => (i === index ? text : item)));
          return (
            <div className="flex flex-col gap-2">
              <SortableList
                items={rows}
                getId={(row) => row.id}
                onReorder={(next) => field.onChange(next.map((row) => row.text))}
                renderItem={(row, index, handle) => (
                  <div className="flex items-start gap-1.5">
                    <DragHandle {...handle} className="mt-1" />
                    <span className="text-muted-foreground mt-2 w-5 shrink-0 text-right text-xs tabular-nums">
                      {index + 1}.
                    </span>
                    {multiline || rich ? (
                      <Textarea
                        autoFocus={focusAdded}
                        rows={rich ? 3 : 2}
                        value={row.text}
                        placeholder={placeholder}
                        onChange={(event) => update(index, event.target.value)}
                      />
                    ) : (
                      <Input
                        autoFocus={focusAdded}
                        value={row.text}
                        placeholder={placeholder}
                        onChange={(event) => update(index, event.target.value)}
                      />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => field.onChange(value.filter((_, i) => i !== index))}
                      aria-label="Xóa dòng"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              />
              {max && value.length >= max ? null : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => {
                    setFocusAdded(true);
                    field.onChange([...value, ""]);
                  }}
                >
                  <Plus />
                  {addLabel}
                </Button>
              )}
              {rich && value.length ? (
                <FieldDescription>Hỗ trợ **chữ đậm** và [liên kết](/duong-dan).</FieldDescription>
              ) : null}
            </div>
          );
        }}
      />
    </FieldShell>
  );
}

/** Typed helper so callers can keep `name` type-checked when they want: `field<CourseForm>("title")`. */
export const fieldName = <T extends FieldValues>(name: Path<T>) => name;
