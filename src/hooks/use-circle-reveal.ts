"use client";

import { useEffect, useRef, type PointerEvent } from "react";

/** Radius (% of the CSS reference radius) that covers the whole box from any centre inside it. */
const FULL = 150;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Circle reveal: `layer` (absolutely placed over the content) opens in a circle from where the pointer enters and
 * closes back to where it leaves — from / to the centre for keyboard focus. The `clip-path` circle is animated with the
 * Web Animations API: a CSS transition would also slide the centre.
 *
 * Start the layer closed only where the page can be hovered — `[@media(hover:hover)]:[clip-path:circle(0%_at_50%_50%)]`
 * — so touch screens simply show it. Pointer positions are measured on `area` (the layer itself when unset).
 * Reduced motion: the circle opens and closes at once.
 */
export function useCircleReveal<Area extends HTMLElement = HTMLElement>(duration = 700) {
  const layer = useRef<HTMLDivElement>(null);
  const area = useRef<Area>(null);
  const animation = useRef<Animation | null>(null);

  useEffect(() => () => animation.current?.cancel(), []);

  /** Open (`show`) or close the circle around `x`/`y` (CSS percentages of the layer). */
  const reveal = (show: boolean, x = "50%", y = "50%") => {
    const element = layer.current;
    if (!element || !window.matchMedia("(hover: hover)").matches) return;
    // Continue from wherever the circle is now (mid-animation included); a closed circle restarts at the pointer.
    const current = getComputedStyle(element).clipPath;
    const open = /^circle\((?!0%)/.test(current);
    animation.current?.cancel();
    animation.current = element.animate(
      [
        { clipPath: open ? current : `circle(0% at ${x} ${y})` },
        { clipPath: `circle(${show ? FULL : 0}% at ${x} ${y})` },
      ],
      {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration,
        easing: EASE,
        fill: "forwards",
      },
    );
  };

  /** `reveal` at the pointer (clamped to the area). */
  const fromPointer = (event: PointerEvent, show: boolean) => {
    const box = (area.current ?? layer.current)?.getBoundingClientRect();
    if (!box?.width || !box.height) return;
    const at = (value: number) => `${Math.min(100, Math.max(0, value * 100)).toFixed(2)}%`;
    reveal(show, at((event.clientX - box.left) / box.width), at((event.clientY - box.top) / box.height));
  };

  return { layer, area, reveal, fromPointer };
}
