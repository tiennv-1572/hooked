"use client";

import { ArrowUpRight, Check, ListFilter, Play } from "lucide-react";
import type { ReactNode } from "react";

import { Thumb } from "@/admin/components/cms/image-fields";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Separator } from "@/admin/components/ui/separator";
import type { ProjectCardFormat } from "@/admin/lib/cms/types/projects";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { cn } from "@/lib/utils";

import { CARD_FORMAT_META, SITE_INK } from "./project-utils";

/*
 * Visual building blocks of the Projects module: website echoes (dark stage, project card, filter chips),
 * the card-format mini map and a facet filter popover.
 */

/** Dark panel echoing the website background (ink + ember glow), for previews. */
export function SiteStage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl p-4 text-[#fff4e9]", className)}
      style={{
        backgroundColor: SITE_INK,
        backgroundImage: "radial-gradient(120% 80% at 50% 0%, rgba(229,86,36,0.16) 0%, rgba(5,1,1,0) 60%)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Echo of the website ProjectCard (Figma 2223:439): 16:9 poster, centred play control when the project has a
 * featured video, ExtraBold title (upper-cased with CSS) + ↗, category labels joined by " · ".
 */
export function SiteProjectCard({
  title,
  cover,
  tags,
  hasVideo,
  size = "md",
}: {
  title: string;
  cover?: ImageRef;
  tags: string[];
  hasVideo: boolean;
  size?: "sm" | "md";
}) {
  return (
    <article className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
        <Thumb image={cover} checker={false} className="size-full bg-white/5 text-white/40" />
        {hasVideo ? (
          <span
            className={cn(
              "absolute top-1/2 left-1/2 flex -translate-1/2 items-center justify-center rounded-full bg-[#fff4e9] text-[#050101] shadow-lg",
              size === "sm" ? "size-8" : "size-11",
            )}
          >
            <Play className={cn("fill-current", size === "sm" ? "size-3.5" : "size-4.5")} />
          </span>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <h3
            className={cn(
              "min-w-0 flex-1 font-extrabold text-[#fff4e9] uppercase",
              size === "sm" ? "text-sm leading-5" : "text-lg leading-6",
            )}
          >
            {title || <span className="text-white/40">Tên dự án</span>}
          </h3>
          <ArrowUpRight className={cn("shrink-0 text-[#fff4e9]", size === "sm" ? "size-4" : "size-5")} />
        </div>
        <p className="text-xs leading-4 text-[#cccccc]">{tags.length ? tags.join(" · ") : "Chưa chọn danh mục"}</p>
      </div>
    </article>
  );
}

/** Website filter chip row ("Tất cả" active + one chip per category, in order). */
export function SiteFilterChips({
  allLabel,
  labels,
  className,
}: {
  allLabel: string;
  labels: string[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {[allLabel || "Tất cả", ...labels].map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={cn(
            "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap",
            index === 0 ? "bg-[#ff6b00] text-[#050101]" : "bg-[#1a1a1a] text-[#cccccc]",
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/**
 * Icon of a card format: the three desktop tracks (464 · 272 · 408) with the columns the cell takes highlighted.
 */
export function FormatMiniMap({ format, className }: { format: ProjectCardFormat; className?: string }) {
  const { colStart, colSpan } = CARD_FORMAT_META[format];
  const tracks = [1, 2, 3].filter((track) => track < colStart || track >= colStart + colSpan);
  return (
    <div className={cn("grid grid-cols-[464fr_272fr_408fr] gap-[3px]", className)} aria-hidden>
      <span
        className="bg-primary h-2.5 rounded-[2px]"
        style={{ gridRow: 1, gridColumn: `${colStart} / span ${colSpan}` }}
      />
      {tracks.map((track) => (
        <span
          key={track}
          className="bg-muted-foreground/20 h-2.5 rounded-[2px]"
          style={{ gridRow: 1, gridColumn: track }}
        />
      ))}
    </div>
  );
}

export type FacetOption = { value: string; label: string; count?: number };

/** Multi-select facet popover (same look as the DataTable facets), driven by external state. */
export function FacetFilter({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: FacetOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selected = new Set(value);
  const toggle = (option: string) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange([...next]);
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed">
          <ListFilter />
          {title}
          {selected.size ? (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <Badge variant="secondary" className="max-w-40 truncate rounded-sm px-1 font-normal">
                {selected.size > 2
                  ? `${selected.size} đã chọn`
                  : options
                      .filter((option) => selected.has(option.value))
                      .map((option) => option.label)
                      .join(", ")}
              </Badge>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="start">
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => {
            const active = selected.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                    active && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {active ? <Check className="size-3" /> : null}
                </span>
                <span className="flex-1 truncate">{option.label}</span>
                {option.count !== undefined ? (
                  <span className="text-muted-foreground text-xs tabular-nums">{option.count}</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {selected.size ? (
          <>
            <Separator className="my-1" />
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full rounded-md px-2 py-1.5 text-center text-sm hover:bg-muted"
            >
              Bỏ lọc
            </button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
