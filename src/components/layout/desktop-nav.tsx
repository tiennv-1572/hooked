"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HookedLogo } from "@/components/brand/hooked-logo";
import { Container } from "@/components/ui/container";
import { isActivePath, newTabProps, routes, type NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation bar (≥ 1200px).
 * - Home (142:3): 64px, ember → black → ember gradient, Bold links, no active colour.
 * - Inner pages ("Navigation / Academy active", 2039:79): 80px, warm-brown gradient with a hairline
 *   copper border, ExtraBold links, the current section in accent.
 */
function DesktopBar({ pathname, items }: { pathname: string | null; items: NavItem[] }) {
  const home = pathname === null || pathname === routes.home;
  return (
    <div
      className={cn(
        home
          ? "bg-[linear-gradient(90deg,var(--color-ember)_0%,#000_49.038%,var(--color-ember)_100%)]"
          : "border-b border-copper/[0.13] bg-[linear-gradient(90deg,rgba(53,25,14,0.65)_0%,var(--color-ink)_48%,rgba(53,25,14,0.65)_100%)]",
      )}
    >
      <Container className={cn("flex items-center justify-between", home ? "h-16 desktop:px-12" : "h-20")}>
        <Link href={routes.home} aria-label="Hooked — trang chủ" className="shrink-0">
          <HookedLogo eager />
        </Link>
        <nav aria-label="Điều hướng chính">
          <ul className="flex items-center gap-11">
            {items.map((item) => {
              const active = pathname !== null && isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    {...newTabProps(item)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-base uppercase transition-colors duration-150 hover:text-accent",
                      home ? "font-bold text-muted" : "font-extrabold",
                      !home && (active ? "text-accent" : "text-muted"),
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </div>
  );
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  return <DesktopBar pathname={usePathname()} items={items} />;
}

export function DesktopNavFallback({ items }: { items: NavItem[] }) {
  return <DesktopBar pathname={null} items={items} />;
}
