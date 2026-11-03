import Link from "next/link";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { routes } from "@/lib/site";

const quickLinks = [
  { label: "Academy", description: "Khóa học DJ, MC Hype & Producer", href: routes.academy },
  { label: "Projects", description: "Sự kiện & dự án Hooked thực hiện", href: routes.projects },
  { label: "Blogpost", description: "Câu chuyện từ cộng đồng", href: routes.blog },
  { label: "Contact", description: "Liên hệ hợp tác & booking", href: routes.contact },
];

type StatusScreenProps = {
  code: string;
  title: string;
  description: string;
  actions: ReactNode;
};

/**
 * Full-height status page (404 / error). Not in Figma — built from the site's language:
 * outlined brand numerals (like the hero marquee), Manrope ExtraBold headline, grain + ember glow.
 */
export function StatusScreen({ code, title, description, actions }: StatusScreenProps) {
  return (
    <section className="grain relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_120%,rgba(229,86,36,0.45)_0%,rgba(42,31,25,0.6)_45%,var(--color-ink)_75%)] py-16 tablet:py-24 desktop:py-28">
      <Container className="flex flex-col gap-10 desktop:gap-14">
        <div className="flex flex-col gap-6">
          <p
            aria-hidden
            className="text-[120px] leading-none font-extrabold text-transparent [-webkit-text-stroke:2px_var(--color-brand)] tablet:text-[180px] desktop:text-[220px]"
          >
            {code}
          </p>
          <h1 className="max-w-[760px] text-[32px] leading-[38px] font-extrabold text-white uppercase tablet:text-5xl tablet:leading-[56px]">
            {title}
          </h1>
          <p className="max-w-[560px] text-base leading-6 text-muted">{description}</p>
          <div className="flex flex-wrap gap-3">{actions}</div>
        </div>

        <nav aria-label="Liên kết nhanh">
          <ul className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4 desktop:gap-6">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex h-full flex-col gap-1 rounded-lg border border-white/10 bg-warm/60 p-5 transition-colors duration-150 hover:border-accent"
                >
                  <span className="text-lg leading-7 font-extrabold text-white uppercase transition-colors group-hover:text-accent">
                    {link.label}
                  </span>
                  <span className="text-sm leading-5 text-muted">{link.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </section>
  );
}
