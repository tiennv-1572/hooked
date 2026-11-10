"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const MARKER = "[data-reveal]";
/** Set on <html> by the inline script in the site layout until the first pass below (see globals.css). */
const PENDING = "reveal-pending";
/** The trigger line: a block reveals when its top passes 90% of the viewport height. */
const LINE = 0.9;
const DURATION = 800;
/** Delay between blocks revealed together (a row of cards). */
const STAGGER = 80;
/** Entrance of the blocks on screen at load: a beat after the first paint. */
const ENTRANCE_DELAY = 100;
/** GSAP's power3.out. */
const EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
/**
 * Hidden state; the animation runs from it to the element's own styles (implicit end keyframe). `offset: 0` matters: a
 * lone keyframe without one is the *end* keyframe.
 */
const FROM: Keyframe = { opacity: 0, transform: "translate3d(0, 32px, 0)", offset: 0 };

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

/** Reading order: top to bottom, then left to right. */
const byPosition = (a: Element, b: Element) => {
  const boxA = a.getBoundingClientRect();
  const boxB = b.getBoundingClientRect();
  return boxA.top - boxB.top || boxA.left - boxB.left;
};

/**
 * Site-wide reveal: every `[data-reveal]` block inside <main> fades and rises 32px, once — blocks on screen when they
 * appear (page load, client navigation, streamed or newly rendered content) right away as an entrance, the others as
 * they scroll into view; blocks revealed together (a row of cards) follow each other. Blocks above the viewport stay
 * as they are. Nothing flashes: on the first load globals.css hides the targets before the first paint (removed after
 * the first pass), and later passes run before the browser paints (layout effect, mutation observer + rAF).
 *
 * The motion is a Web Animation (held on its first frame while waiting), not inline styles: React-rendered markup is
 * never modified — a page that hydrates after this layout runs sees exactly its server HTML — the element's own
 * transforms are kept, and it runs on the compositor. Only opacity is animated (no `visibility`): hidden blocks stay
 * focusable, readable by screen readers and findable, and focusing into one reveals it. Off under
 * `prefers-reduced-motion`.
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
    /** Hidden blocks waiting for their turn: their paused animations. */
    const waiting = new Map<Element, Animation>();

    const hide = (element: Element) => {
      const animation = element.animate([FROM], { duration: DURATION, easing: EASE, fill: "backwards" });
      animation.pause();
      waiting.set(element, animation);
    };

    const reveal = (elements: Element[], delay = 0) => {
      elements.sort(byPosition).forEach((element, index) => {
        const animation = waiting.get(element);
        if (!animation) return;
        waiting.delete(element);
        animation.effect?.updateTiming({ delay: delay + index * STAGGER });
        animation.play();
        // Done: drop the effect (it no longer applies anyway; cancelling rejects `finished`, hence the catch).
        animation.finished.then(() => animation.cancel()).catch(() => {});
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
        entered.forEach((element) => observer.unobserve(element));
        if (entered.length) reveal(entered);
      },
      { rootMargin: `0px 0px -${Math.round((1 - LINE) * 100)}% 0px` },
    );

    const prepare = () => {
      const fresh = Array.from(main.querySelectorAll(MARKER))
        .flatMap(targetsOf)
        .filter((element) => !prepared.has(element));
      if (!fresh.length) return;
      fresh.forEach((element) => prepared.add(element));
      const line = window.innerHeight * LINE;
      // On screen now → entrance; below → on scroll; above the viewport → left alone.
      const now: Element[] = [];
      for (const element of fresh) {
        const box = element.getBoundingClientRect();
        if (box.bottom <= 0) continue;
        hide(element);
        if (box.top <= line) now.push(element);
        else observer.observe(element);
      }
      if (now.length) reveal(now, ENTRANCE_DELAY);
    };

    // Streamed sections (Suspense) and client-side changes arrive after the first pass.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(prepare);
    });
    mutations.observe(main, { childList: true, subtree: true });

    // Keyboard users: a block they tab into shows at once.
    const onFocus = (event: FocusEvent) => {
      const hit = Array.from(waiting.keys()).filter((element) => element.contains(event.target as Node));
      if (!hit.length) return;
      hit.forEach((element) => observer.unobserve(element));
      reveal(hit);
    };
    main.addEventListener("focusin", onFocus);

    prepare();
    // Targets are now held hidden by their animations (or revealing); the first-load CSS can go.
    root.classList.remove(PENDING);

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      main.removeEventListener("focusin", onFocus);
      waiting.forEach((animation) => animation.cancel());
      waiting.clear();
    };
  }, [pathname]);

  return null;
}
