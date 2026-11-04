import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarqueeProps = {
  /** One repeat of the strip. It is rendered several times to fill wide screens. */
  children: ReactNode;
  /** Seconds for the strip to move by one repeat width (the speed is the same whatever `copies` is). */
  duration?: number;
  /** Gap between items and between repeats, in px. */
  gap?: number;
  /**
   * How many copies make up half of the track (the animation shifts by 50%). Half the track must be wider than the
   * screen or its trailing edge shows: 5 covers a 3840px screen with the partner logos (~780px per copy).
   */
  copies?: number;
  fade?: boolean;
  className?: string;
  label?: string;
};

/**
 * Continuous CSS marquee (Figma "Home / Text marquee" and "Home / Logo marquee": Phase Start → End).
 * Runs left → right: the track holds 2 × `copies` repeats and slides from −50% back to 0, so the loop is seamless.
 * Pauses on hover and stops under `prefers-reduced-motion`.
 */
export function Marquee({ children, duration = 30, gap = 38, copies = 5, fade, className, label }: MarqueeProps) {
  const repeats = Array.from({ length: copies * 2 });
  return (
    <div
      role={label ? "marquee" : undefined}
      aria-label={label}
      className={cn("group/marquee flex overflow-hidden", fade && "edge-fade", className)}
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        // Set on the element itself: a custom property here would not reach --animate-marquee, which Tailwind
        // resolves on :root (every marquee used to run at the 30s fallback).
        style={{ animationDuration: `${duration * copies}s` }}
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
