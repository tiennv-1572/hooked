import { PhotoTile } from "@/components/about/photo-tile";
import type { Photo } from "@/data/home";

/** Named slots of the two compositions. A slot without a photo is skipped; a set without any renders nothing. */
export type StagePhotoSet = Partial<Record<"fullStage" | "artists" | "localDj" | "frequencyDj", Photo>>;
export type LivePhotoSet = Partial<Record<"djPerformance" | "firePerformance" | "performance" | "audience", Photo>>;

const isEmpty = (photos: Record<string, Photo | undefined>) => !Object.values(photos).some(Boolean);

/**
 * "02 / Photography · Stage to artists".
 * Desktop (2685:4689): full-stage photo (904.96 × 603.3) + diptych column — artists (423 × 282) over a
 * portrait pair (2 × 203.5 × 305.3); 16px gaps. Column fractions reproduce the exact 1344px geometry.
 * Mobile (2686:4689): stage, artists, then the portrait pair; 12px gaps.
 * Tablet: stage full width, then artists + both portraits on one row (fractions 9:4:4 keep equal heights).
 */
export function StagePhotos({ photos }: { photos: StagePhotoSet }) {
  if (isEmpty(photos)) return null;
  return (
    <section
      aria-label="Hình ảnh sân khấu và nghệ sĩ"
      className="grid grid-cols-2 gap-3 tablet:grid-cols-[9fr_4fr_4fr] tablet:gap-4 desktop:grid-cols-[904.96fr_203.52fr_203.52fr]"
    >
      <PhotoTile
        photo={photos.fullStage}
        sizes="(min-width: 1440px) 905px, (min-width: 1200px) 63vw, 100vw"
        className="col-span-2 aspect-[3/2] tablet:col-span-3 desktop:col-span-1 desktop:row-span-2 desktop:aspect-auto"
      />
      <PhotoTile
        photo={photos.artists}
        sizes="(min-width: 1440px) 423px, (min-width: 1200px) 30vw, (min-width: 768px) 50vw, 100vw"
        className="col-span-2 aspect-[3/2] tablet:col-span-1 desktop:col-span-2"
      />
      <PhotoTile
        photo={photos.localDj}
        sizes="(min-width: 1440px) 204px, (min-width: 1200px) 15vw, (min-width: 768px) 25vw, 50vw"
        className="aspect-[2/3]"
      />
      <PhotoTile
        photo={photos.frequencyDj}
        sizes="(min-width: 1440px) 204px, (min-width: 1200px) 15vw, (min-width: 768px) 25vw, 50vw"
        className="aspect-[2/3]"
      />
    </section>
  );
}

/**
 * "04 / Photography · Live experience".
 * Desktop (2685:4698): row 1 = DJ performance (919.4 × 612.9) + fire performance (408.6 × 612.9);
 * row 2 = two 664 × 442.7 photos. One 3-column grid (664 · 239.4 · 408.6, 16px gaps) yields both rows.
 * Mobile (2686:4695): DJ performance full width, then fire portrait beside two stacked landscape photos.
 * Tablet uses the desktop composition (every tile stays ≥ 200px wide at 768).
 */
export function LivePhotos({ photos }: { photos: LivePhotoSet }) {
  if (isEmpty(photos)) return null;
  return (
    <section
      aria-label="Hình ảnh trải nghiệm live"
      className="grid grid-cols-2 gap-3 tablet:grid-cols-[664fr_239.385fr_408.615fr] tablet:gap-4"
    >
      <PhotoTile
        photo={photos.djPerformance}
        sizes="(min-width: 1440px) 920px, (min-width: 768px) 64vw, 100vw"
        className="col-span-2 aspect-[3/2] tablet:row-start-1"
      />
      <PhotoTile
        photo={photos.firePerformance}
        sizes="(min-width: 1440px) 409px, (min-width: 768px) 29vw, 50vw"
        className="row-span-2 aspect-[2/3] tablet:col-start-3 tablet:row-span-1 tablet:row-start-1 tablet:aspect-auto tablet:self-stretch"
      />
      <PhotoTile
        photo={photos.performance}
        sizes="(min-width: 1440px) 664px, (min-width: 768px) 47vw, 50vw"
        className="aspect-[3/2] self-start tablet:col-start-1 tablet:row-start-2"
      />
      <PhotoTile
        photo={photos.audience}
        sizes="(min-width: 1440px) 664px, (min-width: 768px) 47vw, 50vw"
        className="aspect-[3/2] self-end tablet:col-span-2 tablet:col-start-2 tablet:row-start-2 tablet:aspect-auto tablet:self-stretch"
      />
    </section>
  );
}
