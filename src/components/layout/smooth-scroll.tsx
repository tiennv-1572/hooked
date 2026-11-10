"use client";

import "lenis/dist/lenis.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useSyncExternalStore } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Mouse wheel / trackpad only: touch screens keep their own momentum, reduced motion keeps plain scrolling. */
const WANTED = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** Set on <body> by react-remove-scroll-bar while a (Radix) dialog locks the page. */
const LOCKED = "data-scroll-locked";

function subscribe(notify: () => void) {
  const query = window.matchMedia(WANTED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

/**
 * Smooth (inertial) page scrolling with Lenis: the wheel sets a target and the page glides to it. The page keeps its
 * native scroll — scrollbar, keyboard, find-in-page, `position: sticky` and scroll restoration are unchanged — and
 * GSAP ScrollTrigger (the reveals) is updated from Lenis on GSAP's ticker, so both move in the same frame.
 *
 * - Scrollable panels (dialogs, menus, lists) scroll natively: `allowNestedScroll`, and anything inside a dialog is
 *   left alone. While a dialog locks the page, Lenis stops so the page behind cannot drift.
 * - A click on an internal link stops the glide, so the next page starts where Next.js puts it.
 */
export function SmoothScroll() {
  const enabled = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(WANTED).matches,
    () => false,
  );

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      lerp: 0.1,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.getAttribute("role") === "dialog",
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Lenis needs real frame times: no GSAP lag smoothing while it drives the scroll.
    gsap.ticker.lagSmoothing(0);

    const syncLock = () => (document.body.hasAttribute(LOCKED) ? lenis.stop() : lenis.start());
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: [LOCKED] });
    syncLock();

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}
