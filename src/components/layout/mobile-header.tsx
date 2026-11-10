"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentProps } from "react";

import { HookedLogo } from "@/components/brand/hooked-logo";
import { Icon } from "@/components/ui/icon";
import { currentPageLabel, isActivePath, newTabProps, routes, type NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

const barClassName = "flex h-[72px] items-center justify-between gap-4 bg-ink px-6 tablet:justify-start tablet:px-12";

/**
 * Mobile / tablet header (< 1200px) and the full-screen menu overlay
 * (Figma 75 · OVERLAYS / Mobile navigation, 2226:920).
 */
export function MobileHeader({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = currentPageLabel(pathname, items);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className={barClassName}>
        <Link href={routes.home} aria-label="Hooked — trang chủ" className="shrink-0">
          <HookedLogo eager />
        </Link>
        <PageLabel>{label}</PageLabel>
        <Dialog.Trigger asChild>
          <MenuButton />
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        {/* Invisible (the menu covers the screen), but Radix locks the page scroll through the overlay. */}
        <Dialog.Overlay className="fixed inset-0 z-50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(5,4,3,0.96)] px-6 pt-8 pb-12 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in tablet:px-12"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <Dialog.Close
            aria-label="Đóng menu"
            className="-m-2.5 flex size-11 items-center justify-center opacity-100 transition-opacity hover:opacity-70"
          >
            <Icon name="close" />
          </Dialog.Close>
          <nav aria-label="Điều hướng chính" className="mt-6">
            <ul className="flex flex-col gap-6">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...newTabProps(item)}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block text-[28px] leading-[37px] font-extrabold text-ivory transition-colors duration-150 hover:text-accent",
                        active && "text-accent",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PageLabel({ children }: { children?: string }) {
  return (
    <p className="w-[130px] text-right text-base leading-[21px] font-extrabold text-accent tablet:ml-auto">
      {children}
    </p>
  );
}

function MenuButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label="Mở menu"
      className="flex size-11 shrink-0 items-center justify-center transition-opacity hover:opacity-70"
      {...props}
    >
      <Icon name="menu" />
    </button>
  );
}

export function MobileHeaderFallback() {
  return (
    <div className={barClassName}>
      <Link href={routes.home} aria-label="Hooked — trang chủ" className="shrink-0">
        <HookedLogo eager />
      </Link>
      <PageLabel />
      <MenuButton disabled />
    </div>
  );
}
