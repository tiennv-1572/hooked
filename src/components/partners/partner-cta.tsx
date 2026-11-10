"use client";

import { useId } from "react";

import { partnerCta } from "@/data/partners-page";
import { useCircleReveal } from "@/hooks/use-circle-reveal";
import { cn } from "@/lib/utils";

/**
 * "Trở thành đối tác của Hooked Entertainment" — the call to action closing the Partners page. The whole card is a
 * `mailto:` link to the company address.
 *
 * - Coal card with a faint stage glow: orange label, big uppercase line, the address, and an arrow badge circled by
 *   slowly turning text ("Hợp tác cùng Hooked •").
 * - Hover / keyboard focus: the card is painted copper-orange in a circle spreading from the pointer (from the centre
 *   for the keyboard) and the arrow turns → — the painted copy of the content (ink on orange) sits in a clipped layer
 *   over the coal one, so text and colours change exactly where the paint is. Leaving shrinks it back to the pointer.
 * - Touch screens show the orange card directly. Reduced motion: no turning ring, the paint switches at once.
 */
export function PartnerCta({ email }: { email: string }) {
  const { layer, reveal, fromPointer } = useCircleReveal(800);

  return (
    <section aria-labelledby="partner-cta-title" data-reveal="">
      <a
        href={`mailto:${email}`}
        aria-label={`${partnerCta.title} — gửi email tới ${email}`}
        onPointerEnter={(event) => fromPointer(event, true)}
        onPointerLeave={(event) => fromPointer(event, false)}
        onFocus={(event) => event.currentTarget.matches(":focus-visible") && reveal(true)}
        onBlur={() => reveal(false)}
        className="group relative block overflow-hidden rounded-[20px] border border-ivory/12 bg-coal bg-[radial-gradient(90%_120%_at_100%_0%,rgba(255,107,0,0.18)_0%,rgba(255,107,0,0)_60%)] outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent tablet:rounded-[28px]"
      >
        <Face email={email} />
        {/* Closed where the card can be hovered; the circle reveal opens it. */}
        <div
          ref={layer}
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(162deg,var(--color-copper)_14.3%,#f47737_52.9%,var(--color-brand)_85.7%)] [@media(hover:hover)]:[clip-path:circle(0%_at_50%_50%)]"
        >
          <Face email={email} painted />
        </div>
      </a>
    </section>
  );
}

/** The card's content; `painted` is the ink-on-orange copy inside the reveal layer. */
function Face({ email, painted }: { email: string; painted?: boolean }) {
  const Title = painted ? "p" : "h2";
  return (
    <div className="relative flex flex-col gap-10 p-6 tablet:p-10 desktop:flex-row desktop:items-end desktop:justify-between desktop:gap-16 desktop:p-14">
      <div className="flex min-w-0 flex-col gap-4 tablet:gap-5">
        <p
          className={cn(
            "text-xs leading-5 font-bold tracking-[0.04em] uppercase",
            painted ? "text-ink/70" : "text-accent",
          )}
        >
          {partnerCta.eyebrow}
        </p>
        <Title
          id={painted ? undefined : "partner-cta-title"}
          className={cn(
            "max-w-[880px] pt-1 text-[clamp(24px,8.2vw,32px)] leading-[1.25] font-extrabold tracking-[-0.02em] uppercase tablet:text-5xl tablet:leading-[58px] desktop:text-[64px] desktop:leading-[76px]",
            painted ? "text-ink" : "text-white",
          )}
        >
          {partnerCta.title}
        </Title>
        <p
          className={cn("text-base leading-6 tablet:text-lg tablet:leading-7", painted ? "text-ink/80" : "text-muted")}
        >
          {partnerCta.lead}{" "}
          <span
            className={cn(
              "inline-block max-w-full font-semibold [overflow-wrap:anywhere] underline decoration-1 underline-offset-4",
              painted ? "text-ink decoration-ink/40" : "text-white decoration-accent/60",
            )}
          >
            {email}
          </span>
        </p>
      </div>
      <Badge painted={painted} />
    </div>
  );
}

/** Arrow in a circle, ringed by turning text. Both faces turn in step (same animation, started together). */
function Badge({ painted }: { painted?: boolean }) {
  const ring = useId();
  return (
    <div aria-hidden className="relative size-[112px] shrink-0 self-end tablet:size-[136px] desktop:self-auto">
      <svg
        viewBox="0 0 136 136"
        className={cn(
          "absolute inset-0 size-full animate-[spin_18s_linear_infinite] motion-reduce:animate-none",
          painted ? "text-ink" : "text-ivory/70",
        )}
      >
        <defs>
          <path id={ring} d="M68 68m-56 0a56 56 0 1 1 112 0a56 56 0 1 1-112 0" />
        </defs>
        <text className="fill-current text-[11px] font-bold tracking-[0.12em] uppercase">
          <textPath href={`#${ring}`} textLength={350} lengthAdjust="spacing">
            {partnerCta.ring}
          </textPath>
        </text>
      </svg>
      <span
        className={cn(
          "absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full tablet:size-[68px]",
          painted ? "bg-ink text-accent" : "bg-accent text-ink",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-45 group-focus-visible:rotate-45 tablet:size-7"
        >
          <path
            d="M7 17 17 7M8.5 7H17v8.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}
