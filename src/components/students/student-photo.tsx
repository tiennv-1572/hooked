import Image from "next/image";
import type { ComponentProps } from "react";

import type { StudentPortrait } from "@/data/students";
import { cn, scaleSizes } from "@/lib/utils";

type StudentPhotoProps = Pick<ComponentProps<typeof Image>, "sizes" | "loading" | "fetchPriority"> & {
  portrait: StudentPortrait;
  className?: string;
};

/**
 * Student portrait filling its (relative, overflow-hidden) parent — Figma `Stories / Photo / <NAME>`
 * (2189:2499 … 2291:667). Most photos are cover-cropped; a portrait with `crop` (SIMPLE, 2291:663) is drawn
 * larger and left-aligned so the poster panel on the right of the source stays outside the frame.
 */
export function StudentPhoto({ portrait, className, sizes, ...imageProps }: StudentPhotoProps) {
  const { crop } = portrait;

  if (crop) {
    return (
      <Image
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width}
        height={portrait.height}
        sizes={sizes && scaleSizes(sizes, crop.scale)}
        // Percent margins resolve against the frame width, so the offset scales with the drawn image.
        style={{ width: `${crop.scale * 100}%`, marginTop: `${-crop.top * crop.scale * 100}%` }}
        className={cn("absolute top-0 left-0 h-auto max-w-none", className)}
        {...imageProps}
      />
    );
  }

  return (
    <Image
      src={portrait.src}
      alt={portrait.alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      {...imageProps}
    />
  );
}
