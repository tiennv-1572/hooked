import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Intrinsic sizes of the shared SVG icons exported from Figma (served from /public/icons).
 * Feature icons can live in the same folder: pass `size` for any name not listed here.
 */
export const iconSizes = {
  "arrow-right-long": [49, 33],
  "arrow-up-right-accent-20": [20, 20],
  "arrow-up-right-accent-24": [24, 24],
  "arrow-up-right-dark-20": [20, 20],
  "arrow-up-right-white-20": [20, 20],
  "arrow-up-right-white-24": [24, 24],
  "chevron-left": [16, 28],
  "chevron-right": [16, 28],
  close: [24, 24],
  menu: [24, 24],
  phone: [18, 18],
  "turn-left-tile": [44, 44],
  "turn-right-tile": [44, 44],
} as const;

export type IconName = keyof typeof iconSizes;

type IconProps = {
  /** File name in /public/icons without the `.svg` extension. */
  name: IconName | (string & {});
  /** Rendered size in px — a number for square icons, or [width, height]. Defaults to the intrinsic size. */
  size?: number | readonly [number, number];
  className?: string;
  /** Accessible label. Omit for decorative icons (the default). */
  label?: string;
};

export function Icon({ name, size, className, label }: IconProps) {
  const known = (iconSizes as Record<string, readonly [number, number]>)[name];
  const [width, height] = typeof size === "number" ? [size, size] : (size ?? known ?? [24, 24]);
  return (
    <Image
      src={`/icons/${name}.svg`}
      width={width}
      height={height}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0 select-none", className)}
      draggable={false}
    />
  );
}
