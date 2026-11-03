"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { get, useFormContext, useWatch } from "react-hook-form";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { cn } from "@/lib/utils";

/** Site pages offered as one-click link targets. */
const SITE_LINKS = [
  { label: "Academy", href: "/academy" },
  { label: "Học viên", href: "/academy/students" },
  { label: "Projects", href: "/projects" },
  { label: "Partners", href: "/partners" },
  { label: "Contact", href: "/contact" },
];

/**
 * Link target input (internal path or absolute URL) with quick picks for the main site pages
 * and a hint telling whether the link opens in a new tab.
 */
export function HrefField({ name, label, required }: { name: string; label?: ReactNode; required?: boolean }) {
  const {
    register,
    setValue,
    control,
    formState: { errors, isSubmitted },
  } = useFormContext();
  const value = (useWatch({ control, name }) as string | undefined) ?? "";
  const message = (get(errors, name) as { message?: string } | undefined)?.message;
  const external = /^https?:/.test(value);

  return (
    <Field data-invalid={message ? true : undefined}>
      {label ? (
        <FieldLabel htmlFor={name}>
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </FieldLabel>
      ) : null}
      <Input
        id={name}
        placeholder="/academy hoặc https://…"
        aria-invalid={message ? true : undefined}
        {...register(name)}
      />
      <div className="flex flex-wrap gap-1">
        {SITE_LINKS.map((link) => (
          <button
            key={link.href}
            type="button"
            onClick={() => setValue(name, link.href, { shouldDirty: true, shouldValidate: isSubmitted })}
            className={cn(
              "text-muted-foreground hover:border-primary hover:text-primary rounded-full border px-2 py-0.5 text-[11px] transition-colors",
              value === link.href && "border-primary bg-primary/10 text-primary",
            )}
          >
            {link.href}
          </button>
        ))}
      </div>
      {external ? (
        <FieldDescription className="flex items-center gap-1">
          <ExternalLink className="size-3" /> Liên kết ngoài — mở trong tab mới.
        </FieldDescription>
      ) : null}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
