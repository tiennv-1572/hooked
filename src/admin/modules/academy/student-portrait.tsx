"use client";

import { ArrowUpRight, ImageIcon, Quote } from "lucide-react";

import type { Student } from "@/admin/lib/cms/types/academy";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

export type PortraitCrop = Student["crop"];

/**
 * Student portrait filling its `relative overflow-hidden` parent — same maths as the site's `StudentPhoto`:
 * without crop the photo is cover-cropped; with crop it is drawn `scale` × the frame width, left-aligned and
 * shifted up by `top × scale` of the frame width.
 */
export function StudentPortrait({
  portrait,
  crop,
  className,
}: {
  portrait?: ImageRef | null;
  crop?: PortraitCrop;
  className?: string;
}) {
  if (!portrait?.url) {
    return (
      <div className="text-muted-foreground absolute inset-0 flex items-center justify-center bg-muted">
        <ImageIcon className="size-6" />
      </div>
    );
  }
  if (crop) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={portrait.url}
        alt={portrait.alt}
        loading="lazy"
        draggable={false}
        style={{ width: `${crop.scale * 100}%`, marginTop: `${-crop.top * crop.scale * 100}%` }}
        className={cn("absolute top-0 left-0 h-auto max-w-none", className)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={portrait.url}
      alt={portrait.alt}
      loading="lazy"
      draggable={false}
      className={cn("absolute inset-0 size-full object-cover", className)}
    />
  );
}

const pad2 = (value: number) => String(value).padStart(2, "0");

/** Replica of the site's desktop story card (`src/components/students/story-card.tsx`). */
export function StoryCardPreview({
  name,
  roleLabel,
  readLabel = "Xem câu chuyện",
  portrait,
  crop,
  index = 0,
  size = "md",
  className,
}: {
  name?: string;
  roleLabel?: string;
  readLabel?: string;
  portrait?: ImageRef;
  crop?: PortraitCrop;
  index?: number;
  /** `sm` for narrow previews (~150px wide). */
  size?: "md" | "sm";
  className?: string;
}) {
  const sm = size === "sm";
  return (
    <div
      className={cn("relative aspect-[381.333/520] overflow-hidden rounded-[15px] bg-[#1a1a1a] text-white", className)}
    >
      <StudentPortrait portrait={portrait} crop={crop} />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,1,0)_0%,rgba(5,2,1,0.08)_42%,rgba(5,2,1,0.66)_70%,#050201_100%)]" />
      <div className={cn("absolute inset-x-0 top-0 flex items-start justify-between", sm ? "p-2.5" : "p-4")}>
        <span className={sm ? "text-[9px] leading-4" : "text-xs leading-5"}>{pad2(index + 1)} / HOOKED</span>
        <span
          className={cn(
            "flex items-center justify-center rounded-full border border-white/35 bg-black/30",
            sm ? "size-5" : "size-7",
          )}
        >
          <ArrowUpRight className={sm ? "size-3" : "size-3.5"} />
        </span>
      </div>
      <div className={cn("absolute inset-x-0 bottom-0 flex flex-col", sm ? "gap-0.5 p-2.5" : "gap-1 p-4")}>
        <span className={cn("font-extrabold break-words", sm ? "text-sm leading-5" : "text-xl leading-7")}>
          {name || "TÊN HỌC VIÊN"}
        </span>
        <span className={cn("truncate text-[#cccccc]", sm ? "text-[10px]" : "text-xs")}>{roleLabel}</span>
        <span className={cn("truncate font-semibold", sm ? "text-[10px]" : "text-xs")}>{readLabel} →</span>
      </div>
    </div>
  );
}

/** Replica of the Academy page featured-story slide (copper panel + portrait). */
export function FeaturedSlidePreview({
  name,
  roleLabel,
  headline,
  portrait,
}: {
  name?: string;
  roleLabel?: string;
  headline?: string;
  portrait?: ImageRef;
}) {
  return (
    <div className="relative flex min-h-56 overflow-hidden rounded-xl bg-[#d9d9d9]">
      <div className="absolute inset-y-0 right-0 w-[43.6%]">
        {portrait?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait.url} alt="" className="size-full object-cover object-[50%_5%]" />
        ) : null}
      </div>
      <div className="relative flex w-[62.4%] flex-col justify-between gap-4 rounded-tl-[3px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-[3px] bg-[linear-gradient(144deg,#ff9c50_14.286%,#f47737_52.857%,#e55624_85.714%)] p-4 text-[#050101]">
        <div className="flex flex-col gap-1.5">
          <p className="text-lg leading-6 font-extrabold tracking-tight break-words">{name || "TÊN HỌC VIÊN"}</p>
          <p className="text-[11px]">{roleLabel}</p>
          <p className={cn("text-[13px] leading-[18px] font-medium text-black/85", !headline && "italic opacity-60")}>
            {headline || "Câu trích dẫn sẽ hiển thị ở đây."}
          </p>
          <p className="text-[11px] font-semibold">Xem câu chuyện →</p>
        </div>
        <Quote className="size-6 self-end fill-current opacity-80" />
      </div>
    </div>
  );
}
