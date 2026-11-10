"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * Scroll reveal of the "SUPPORTING LOCAL ARTISTS." statement: the title's letters rise out of their lines, then the
 * paragraph fades up line by line. Plays once when the block scrolls into view, then restores the original markup
 * (so the paragraph's clamp and accent room apply again).
 *
 * Targets are `[data-intro="title"]` and `[data-intro="body"]` inside (not `data-reveal`: the site-wide ScrollReveal
 * would fade them as well). Already on screen at load, it plays at once — globals.css keeps them hidden until then,
 * so nothing flashes. Static under `prefers-reduced-motion`.
 */
export function IntroReveal({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const title = scope.current?.querySelector<HTMLElement>('[data-intro="title"]');
      const body = scope.current?.querySelector<HTMLElement>('[data-intro="body"]');
      if (!title || !body) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", (context) => {
        gsap.set([title, body], { autoAlpha: 0 });
        let alive = true;

        const play = () => {
          // Split only now, with the web fonts in place, so the measured lines are the real ones.
          const titleSplit = SplitText.create(title, { type: "lines,chars", mask: "lines" });
          const bodySplit = SplitText.create(body, { type: "lines" });
          gsap.set([title, body], { autoAlpha: 1 });
          gsap
            .timeline({
              onComplete: () => {
                titleSplit.revert();
                bodySplit.revert();
              },
            })
            .from(titleSplit.chars, { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.025 })
            .from(bodySplit.lines, { autoAlpha: 0, y: 28, duration: 0.8, ease: "power3.out", stagger: 0.12 }, "-=0.5");
        };

        // context.add runs `play` inside the matchMedia context, so unmounting reverts what it creates.
        const start = () => void document.fonts.ready.then(() => alive && context.add(play));
        if (ScrollTrigger.isInViewport(title, 0.1)) start();
        else ScrollTrigger.create({ trigger: title, start: "top 85%", once: true, onEnter: start });

        return () => {
          alive = false;
        };
      });

      return () => media.revert();
    },
    { scope },
  );

  // `contents`: the wrapper adds no box, so the parent's flex layout is unchanged.
  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
