import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/links";

type ContactHeroProps = {
  eyebrow: string;
  title: string;
  email: string;
};

/**
 * "Contact / Hero · MOUTHWASH reference".
 * Desktop (2745:4691): orange 12px label, 72px "Liên hệ Hooked.", then the full-width email link (2745:4694) —
 * 64px muted address on the left, 48px orange ↗ pinned right.
 * Mobile (2745:5934): 36px title, ~25px email + 24px ↗ (fluid down to 320px so the address never overflows).
 * Hover/focus: email turns accent and the arrow nudges up-right (QA 91 link pattern).
 */
export function ContactHero({ eyebrow, title, email }: ContactHeroProps) {
  return (
    <section aria-labelledby="contact-title" className="flex flex-col gap-6 desktop:gap-8">
      <Eyebrow className="text-xs leading-5 tracking-normal">{eyebrow}</Eyebrow>
      <h1
        id="contact-title"
        className="text-4xl leading-[45px] font-bold tracking-[-0.03em] text-white tablet:text-[56px] tablet:leading-[68px] desktop:text-7xl desktop:leading-[86px]"
      >
        {title}
      </h1>
      <a
        href={`mailto:${email}`}
        aria-label={`Gửi email cho Hooked: ${email}`}
        className="group flex items-center justify-between gap-3 text-muted transition-colors duration-150 hover:text-accent tablet:gap-6"
      >
        <span className="min-w-0 text-[clamp(20px,6.4vw,25px)] leading-9 font-normal tracking-[-0.03em] tablet:text-5xl tablet:leading-[60px] desktop:text-[64px] desktop:leading-[78px]">
          {email}
        </span>
        <Icon
          name="contact-arrow-up-right-brand-48"
          size={48}
          className="size-6 transition-transform duration-150 group-hover:translate-x-1 group-hover:-translate-y-1 tablet:size-10 desktop:mr-2 desktop:size-12"
        />
      </a>
    </section>
  );
}
