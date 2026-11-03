import type { Photo } from "@/data/home";

import type { ImageDto } from "../dto";

/** Fallback intrinsic size for images saved without dimensions (pasted URLs). 16:10 keeps `next/image` layouts sane. */
const FALLBACK = { width: 1600, height: 1000 } as const;

/** Public `ImageDto` → the `Photo` shape the site components take (`next/image` needs width/height). */
export function toPhoto(image: ImageDto, fallback: { width: number; height: number } = FALLBACK): Photo {
  return {
    src: image.url,
    alt: image.alt,
    width: image.width ?? fallback.width,
    height: image.height ?? fallback.height,
  };
}
