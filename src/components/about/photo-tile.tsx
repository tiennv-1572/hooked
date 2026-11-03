import Image from "next/image";

import type { Photo } from "@/data/home";
import { cn } from "@/lib/utils";

type PhotoTileProps = {
  /** Missing when the CMS gallery has fewer photos than the composition: the tile is skipped. */
  photo?: Photo;
  /** Responsive `sizes` for next/image — match the tile's rendered width at each breakpoint. */
  sizes: string;
  /** Aspect ratio / grid placement classes. The image always covers the tile. */
  className?: string;
};

/**
 * Static editorial photograph (About "Photo / 0x / …" rounded-rectangles): image fill, object-cover, no radius.
 * Figma has no hover/lightbox for these, so the tile is not interactive (plan/02 §10 open question).
 */
export function PhotoTile({ photo, sizes, className }: PhotoTileProps) {
  if (!photo?.src) return null;
  return (
    <figure className={cn("relative overflow-hidden bg-surface", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
    </figure>
  );
}
