/** A frame an `object-cover` image fills at one breakpoint: CSS px, `media` omitted for the fallback entry. */
export type CoverFrame = { media?: string; width: number; height: number };

/**
 * `sizes` for an `object-cover` image: the width it is actually drawn at in each frame (a landscape photo covering a
 * portrait frame is wider than the frame), times `zoom`. Without it the browser fetches a frame-wide, blurry variant.
 */
export function coverSizes(image: { width: number; height: number }, frames: CoverFrame[], zoom = 1) {
  const ratio = image.width / image.height;
  return frames
    .map(({ media, width, height }) => {
      const drawn = `${Math.ceil(zoom * Math.max(width, height * ratio))}px`;
      return media ? `${media} ${drawn}` : drawn;
    })
    .join(", ");
}
