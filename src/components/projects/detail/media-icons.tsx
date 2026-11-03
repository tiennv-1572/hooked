import type { CSSProperties } from "react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type MaskIconProps = {
  /** File name in /public/icons without `.svg`. */
  name: string;
  /** Rendered size in px — a number for square icons, or [width, height]. */
  size: number | readonly [number, number];
  className?: string;
};

/**
 * Exported Figma SVG painted with `currentColor` through a CSS mask, so it can follow the
 * text colour on hover (ivory → accent). The shared `<Icon>` renders an `<img>` and cannot recolour.
 */
export function MaskIcon({ name, size, className }: MaskIconProps) {
  const [width, height] = typeof size === "number" ? [size, size] : size;
  const mask = `url(/icons/${name}.svg) center / 100% 100% no-repeat`;
  const style: CSSProperties = { width, height, mask, WebkitMask: mask };
  return <span aria-hidden className={cn("inline-block shrink-0 bg-current", className)} style={style} />;
}

/**
 * `Projects / Play control` (2218:463): 56px ivory disc with the play glyph.
 * Turns accent when its `group` (the media tile) is hovered or focused (QA 90 · Project media hover).
 */
export function PlayBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-14 items-center justify-center rounded-full bg-ivory transition-colors duration-150 group-hover:bg-accent group-focus-visible:bg-accent",
        className,
      )}
    >
      <Icon name="projects-play" size={24} />
    </span>
  );
}

/** 2px accent frame drawn over a media tile on hover / keyboard focus (`Projects / HoverBorder`, 2421:1712). */
export function HoverFrame({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent transition-colors duration-150 group-hover:border-accent group-focus-visible:border-accent",
        className,
      )}
    />
  );
}
