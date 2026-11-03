import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** One repeat of the strip. It is rendered several times to fill wide screens. */
  children: ReactNode;
  /** Seconds for one full loop (one repeat width). */
  duration?: number;
  /** Gap between items and between repeats, in px. */
  gap?: number;
  /** How many copies make up half of the track (the animation shifts by 50%). */
  copies?: number;
  fade?: boolean;
  className?: string;
  label?: string;
};

/**
 * Continuous CSS marquee (Figma "Home / Text marquee" and "Home / Logo marquee": Phase Start → End).
 * The track holds 2 × `copies` repeats and translates by −50%, so the loop is seamless.
 * Pauses on hover and stops under `prefers-reduced-motion`.
 */
export function Marquee({ children, duration = 30, gap = 38, copies = 2, fade, className, label }: MarqueeProps) {
  const repeats = Array.from({ length: copies * 2 });
  return (
    <div
      role={label ? "marquee" : undefined}
      aria-label={label}
      className={cn("group/marquee flex overflow-hidden", fade && "edge-fade", className)}
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ "--marquee-duration": `${duration * copies}s` } as CSSProperties}
      >
        {repeats.map((_, index) => (
          <div
            key={index}
            aria-hidden={index > 0 || undefined}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
