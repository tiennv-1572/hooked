import Link from "next/link";

import { editorialGrid, editorialReadingColumn } from "@/components/about/editorial-page";
import { Icon } from "@/components/ui/icon";
import type { Capability } from "@/data/about";
import { pad2 } from "@/lib/utils";

type EcosystemSectionProps = {
  titleLines: string[];
  statement: string;
  body: string;
  capabilities: (Capability & { id: string })[];
  /** "Xem full portfolio ↗". External URLs open in a new tab; `null` hides the link. */
  portfolio: { label: string; href: string } | null;
};

/**
 * "03 / Aino · Ecosystem statement".
 * Desktop (2685:4691): empty first column, then a 1004px column — title, 36px statement, and two editorial
 * columns (324px context paragraph + "Xem full portfolio ↗"; 632px numbered capability list 01–05), 48px apart.
 * Mobile (2686:4693): stacked — title, 26px statement, paragraph, list, portfolio link last.
 * Tablet: paragraph/link | list side by side (2 × 324px at 768).
 */
export function EcosystemSection({ titleLines, statement, body, capabilities, portfolio }: EcosystemSectionProps) {
  return (
    <section aria-labelledby="ecosystem-title" className={editorialGrid}>
      <div data-reveal="stagger" className={`flex flex-col gap-7 tablet:gap-8 ${editorialReadingColumn}`}>
        <h2
          id="ecosystem-title"
          className="text-[13px] leading-[21px] font-bold text-white tablet:text-base tablet:leading-6"
        >
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <p className="text-[26px] leading-[35px] font-bold text-white tablet:text-[32px] tablet:leading-[42px] tablet:tracking-[-0.03em] desktop:text-4xl desktop:leading-[46px]">
          {statement}
        </p>

        <div className="grid gap-8 tablet:grid-cols-2 tablet:grid-rows-[auto_1fr] tablet:gap-x-6 tablet:gap-y-4 desktop:grid-cols-[324fr_632fr] desktop:gap-x-12">
          <p className="text-base leading-[26px] text-white">{body}</p>

          <ol className="flex flex-col gap-5 tablet:col-start-2 tablet:row-span-2 tablet:row-start-1">
            {capabilities.map((capability, index) => (
              <CapabilityItem key={capability.id} index={index} capability={capability} />
            ))}
          </ol>

          {portfolio && <PortfolioLink {...portfolio} />}
        </div>
      </div>
    </section>
  );
}

/** "Portfolio / Open PDF" (2658:4714): the Figma prototype opens the portfolio PDF on Google Drive in a new tab. */
function PortfolioLink({ label, href }: { label: string; href: string }) {
  const external = /^https?:/.test(href);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group inline-flex items-center gap-3 self-start justify-self-start px-2 py-3 text-lg leading-7 font-bold text-brand transition-colors duration-150 hover:text-white tablet:col-start-1 tablet:row-start-2 tablet:pl-0"
    >
      {label}
      {external && <span className="sr-only"> (mở trong tab mới)</span>}
      <Icon
        name="about-arrow-up-right-brand-24"
        size={24}
        className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

/** "Capability / 0x" row: 11px orange index, bold lead-in (linked when it maps to a page) + regular continuation. */
function CapabilityItem({ index, capability }: { index: number; capability: Capability }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="w-5 shrink-0 text-[11px] leading-[26px] font-bold text-brand">
        {pad2(index + 1)}
      </span>
      <p className="min-w-0 text-base leading-[26px] text-white">
        {capability.href ? (
          <Link href={capability.href} className="font-bold transition-colors duration-150 hover:text-accent">
            {capability.lead}
          </Link>
        ) : (
          <strong className="font-bold">{capability.lead}</strong>
        )}
        {capability.rest}
      </p>
    </li>
  );
}
