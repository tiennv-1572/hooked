import Image from "next/image";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { ImageOff } from "lucide-react";

import { guideImageSize } from "@/lib/guide/image-size";

type ScreenshotProps = {
  /** Under `public/`, e.g. `/huong-dan/anh/san-pham/quan-ly-xe-buoc-1.png`. */
  src: string;
  alt: string;
  /** One line under the picture: what to look at. */
  caption?: string;
  /** A phone screenshot is shown narrow, as it looks on a phone. */
  device?: "desktop" | "mobile";
};

/**
 * A screenshot of the CMS or the website, opened full size on click. Until the picture is taken (step 2
 * of the guide plan) a placeholder names the file that is expected.
 */
export function Screenshot({ alt, caption, device = "desktop", src }: ScreenshotProps) {
  const size = guideImageSize(src);
  // At its own size, centred, never wider than the column: a dialog cropped at 450px is not blown up to the column's
  // width (blurry, oversized), a full window still fills it.
  const frame = device === "mobile" ? "mx-auto max-w-[320px]" : "mx-auto w-fit max-w-full";

  return (
    <figure className={`not-prose my-6 ${frame}`}>
      {size ? (
        <div className="border-fd-border bg-fd-card overflow-hidden rounded-xl border shadow-sm">
          <ImageZoom alt={alt} height={size.height} src={src} width={size.width}>
            {/* `unoptimized`: the pictures sit behind the guide's sign-in (proxy.ts), which the image optimizer's
                own request, made without the reader's cookie, cannot pass. They are PNGs sized for the page. */}
            <Image
              alt={alt}
              className={device === "mobile" ? "h-auto w-full" : "h-auto w-auto max-w-full"}
              height={size.height}
              src={src}
              unoptimized
              width={size.width}
            />
          </ImageZoom>
        </div>
      ) : (
        <div className="border-fd-border bg-fd-muted/40 text-fd-muted-foreground flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm">
          <ImageOff aria-hidden className="size-6" />
          <span className="font-medium">Ảnh sẽ được chụp ở bước sau</span>
          <code className="text-xs">{src}</code>
        </div>
      )}
      {caption ? (
        <figcaption className="text-fd-muted-foreground mt-2 text-center text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
