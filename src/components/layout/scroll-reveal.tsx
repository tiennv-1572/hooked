"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const MARKER = "[data-reveal]";
/** Set on <html> by the inline script in the site layout until the first pass below (see globals.css). */
const PENDING = "reveal-pending";
/** The trigger line: a block reveals when its top passes 90% of the viewport height. */
const LINE = 0.9;

/**
 * Elements a marker animates: the marked element itself, or its direct children for `data-reveal="stagger"`.
 * Skips anything not rendered and anything that holds markers of its own (those animate their own parts, and
 * fading both would compound).
 */
function targetsOf(marker: Element): HTMLElement[] {
  const items = marker.getAttribute("data-reveal") === "stagger" ? Array.from(marker.children) : [marker];
  return items.filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement &&
      (item === marker || !item.hasAttribute("data-reveal")) &&
      !item.querySelector(MARKER) &&
      item.getClientRects().length > 0,
  );
}

/**
 * Site-wide reveal: every `[data-reveal]` block inside <main> fades and rises 32px, once — blocks on screen when they
 * appear (page load, client navigation, streamed or newly rendered content) right away as an entrance, the others as
 * they scroll into view; blocks revealed together (a row of cards) follow each other. Blocks above the viewport stay
 * as they are. Nothing flashes: on the first load globals.css hides the targets before the first paint (removed after
 * the first pass), and later passes run before the browser paints (layout effect, mutation observer + rAF).
 *
 * Only opacity is animated (no `visibility`): hidden blocks stay focusable, readable by screen readers and findable,
 * and focusing into one reveals it. Off under `prefers-reduced-motion`.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const root = document.documentElement;
    const main = document.querySelector("main");
    if (!main || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.remove(PENDING);
      return;
    }

    const prepared = new WeakSet<Element>();
    const waiting = new Set<HTMLElement>();
    const triggers: ScrollTrigger[] = [];

    const reveal = (elements: Element[], delay = 0) => {
      elements.forEach((element) => waiting.delete(element as HTMLElement));
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: "power3.out",
        stagger: 0.08,
        overwrite: true,
        clearProps: "transform,opacity",
      });
    };

    const prepare = () => {
      const fresh = Array.from(main.querySelectorAll(MARKER))
        .flatMap(targetsOf)
        .filter((element) => !prepared.has(element));
      fresh.forEach((element) => prepared.add(element));
      const line = window.innerHeight * LINE;
      // On screen now → entrance; below → on scroll; above the viewport → left alone.
      const now = fresh.filter((element) => {
        const box = element.getBoundingClientRect();
        return box.top <= line && box.bottom > 0;
      });
      const below = fresh.filter((element) => element.getBoundingClientRect().top > line);
      if (now.length) {
        gsap.set(now, { opacity: 0, y: 32 });
        reveal(now, 0.1);
      }
      if (!below.length) return;
      gsap.set(below, { opacity: 0, y: 32 });
      below.forEach((element) => waiting.add(element));
      triggers.push(
        ...ScrollTrigger.batch(below, { start: `top ${LINE * 100}%`, once: true, onEnter: (batch) => reveal(batch) }),
      );
    };

    // Streamed sections (Suspense) and client-side changes arrive after the first pass.
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        prepare();
        ScrollTrigger.refresh();
      });
    });
    observer.observe(main, { childList: true, subtree: true });

    // Keyboard users: a block they tab into shows at once.
    const onFocus = (event: FocusEvent) => {
      const hit = Array.from(waiting).filter((element) => element.contains(event.target as Node));
      if (hit.length) reveal(hit);
    };
    main.addEventListener("focusin", onFocus);

    prepare();
    // Targets are now hidden inline (or revealed); the first-load CSS can go.
    root.classList.remove(PENDING);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      main.removeEventListener("focusin", onFocus);
      triggers.forEach((trigger) => trigger.kill());
      gsap.set(Array.from(waiting), { clearProps: "transform,opacity" });
    };
  }, [pathname]);

  return null;
}
