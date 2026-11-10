import { HighlightCard, type HighlightItem } from "@/components/home/highlight-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * HIGHLIGHT — entry cards to Academy and Projects.
 * Desktop (04 · Highlight, 147:84): two 379px photo cards with Hooked vector, 52px title and turn-arrow tile.
 * Mobile (Home / Highlight branches, 2824:5042): stacked photo + label rows; two columns from tablet.
 * Photos show in black & white and colour in on hover (see HighlightCard).
 */
export function HighlightsSection({ items }: { items: HighlightItem[] }) {
  return (
    <section aria-labelledby="highlight-title" className="bg-ink pb-10 desktop:pb-[51px]">
      <Container data-reveal="stagger" className="flex flex-col gap-6 desktop:gap-10">
        <SectionHeading id="highlight-title">HIGHLIGHT</SectionHeading>
        <div data-reveal="stagger" className="grid gap-6 tablet:grid-cols-2">
          {items.map((item) => (
            <HighlightCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
