import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Core controls (Figma 02 · LIBRARY / 01 · CORE / Buttons & form fields, QA 91 hover states).
 *
 * - `accent` / `coal`: mobile pill actions ("Academy", "Projects", "Đối tác của Hooked").
 * - `cta`: copper gradient register button ("Đăng ký ngay", "Gửi đăng ký tư vấn"); hover drops the gradient to 86%.
 * - `outline`: neutral flow button (registration overlay "Đóng ×", course choices).
 */
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center gap-2 font-sans whitespace-nowrap transition-[background-color,color,opacity,border-color] duration-150 select-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        accent: "bg-accent text-ink hover:bg-[#ff8124]",
        coal: "bg-coal text-white hover:bg-[#1d1611]",
        cta: "border border-ivory/25 bg-[linear-gradient(162deg,var(--color-copper)_14.3%,#f47737_52.9%,var(--color-brand)_85.7%)] text-ink hover:opacity-[0.86]",
        outline: "border border-ivory/25 bg-transparent text-ivory hover:border-accent hover:text-accent",
      },
      size: {
        pill: "justify-between rounded-[28px] px-4 py-3 text-[15px] leading-[23px] font-bold",
        lg: "h-14 justify-center rounded-lg px-9 text-lg leading-7 font-semibold",
        md: "h-13 justify-center rounded-lg px-6 text-base leading-6 font-semibold",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "pill",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ComponentProps<"button"> & ButtonVariantProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ className, variant, size, ...props }: ComponentProps<typeof Link> & ButtonVariantProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
