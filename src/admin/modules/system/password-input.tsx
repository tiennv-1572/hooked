"use client";

import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { cn } from "@/lib/utils";

/** Password field with an optional show / hide toggle (my account, change a user's password). */
export function PasswordInput({
  id,
  label,
  autoComplete,
  visible,
  onToggle,
  error,
  register,
}: {
  id: string;
  label: string;
  autoComplete: string;
  visible: boolean;
  onToggle?: () => void;
  error?: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          className={cn(onToggle && "pr-9")}
          {...register}
        />
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </Field>
  );
}
