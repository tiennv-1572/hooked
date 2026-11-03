import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { newTabProps, type NavItem } from "@/lib/site";

export type SiteFooterProps = {
  company: { legalName: string; address: string; email: string; phone: { display: string; href: string } };
  socials: { label: string; href: string }[];
  /** Visible CMS menu items of the "Company" column. */
  links: NavItem[];
};

const labelClassName = "text-sm leading-5 text-peach uppercase";
const linkClassName = "text-base leading-6 text-white transition-colors duration-150 hover:text-accent";

/**
 * Shared footer (Figma 07 · Footer — desktop 142:132, mobile 2826:5151, tablet "Footer / Tablet columns" 2830:5193).
 * Tablet: enquiries · Social · Company on one row (160px link columns), company details below, full-width wordmark.
 * The background continues the page "Gradient + grain" (dark → ember → brand orange at the bottom).
 */
export function SiteFooter({ company, socials, links }: SiteFooterProps) {
  return (
    <footer className="grain overflow-hidden bg-[linear-gradient(180deg,#120603_0%,#310e06_29.9%,#842b10_64.9%,#e65826_100%)] pt-12 pb-8 tablet:py-10 desktop:bg-[linear-gradient(180deg,#240a05_0%,#310e06_15.3%,#842b10_57.6%,#e65826_100%)] desktop:pt-12 desktop:pb-15">
      <Container>
        <div className="grid grid-cols-2 content-start gap-x-6 max-tablet:min-h-[480px] min-[1000px]:gap-x-[84px] tablet:grid-cols-[minmax(0,1fr)_160px_160px] tablet:gap-x-12 desktop:min-h-[240px] desktop:grid-cols-[640px_196px_196px] desktop:gap-x-20">
          {/* Contact */}
          <div className="col-span-2 mb-10 flex flex-col gap-4 tablet:col-span-1 tablet:mb-0">
            <div className="flex flex-col gap-3">
              <p className={labelClassName}>Business Enquiries</p>
              <a
                href={`mailto:${company.email}`}
                className="group flex w-fit items-center gap-2 text-[clamp(20px,7.2vw,28px)] leading-9 text-white transition-colors hover:text-accent tablet:text-[clamp(20px,2.35vw,24px)] tablet:leading-[31px] desktop:gap-3 desktop:text-[32px] desktop:leading-[44px]"
              >
                {company.email}
                <Icon
                  name="arrow-up-right-white-24"
                  className="size-5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 desktop:size-6"
                />
              </a>
            </div>
            <a href={company.phone.href} className={`flex w-fit items-center gap-2 ${linkClassName}`}>
              <Icon name="phone" />
              {company.phone.display}
            </a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4 tablet:col-start-2 tablet:row-start-1 desktop:row-span-2">
            <p className={`${labelClassName} font-bold`}>Social</p>
            <ul className="flex flex-col gap-2">
              {socials.map((social) => (
                <li key={social.href}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className={linkClassName}>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4 tablet:col-start-3 tablet:row-start-1 desktop:row-span-2">
            <p className={`${labelClassName} font-bold`}>Company</p>
            <ul className="flex flex-col gap-2">
              {links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} {...newTabProps(item)} className={linkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company details */}
          <address className="col-span-2 mt-4 flex flex-col gap-3 text-sm leading-[22px] not-italic tablet:col-span-3 tablet:row-start-2 tablet:mt-8 tablet:gap-2 desktop:col-span-1 desktop:mt-[11px]">
            <p className="font-bold text-white">{company.legalName}</p>
            <p className="text-muted">{company.address}</p>
          </address>
        </div>

        {/* Outline wordmark: 342×96 mobile, column-wide on tablet (928×260 at 1024), 870×242 in a 200px band on desktop */}
        <div className="mt-10 flex items-center justify-center tablet:mt-8 desktop:h-[200px]">
          <Image
            src="/images/brand/hooked-wordmark-outline.png"
            width={1195}
            height={333}
            alt=""
            aria-hidden
            sizes="(min-width: 1200px) 870px, 100vw"
            className="h-24 w-full object-contain tablet:h-auto desktop:h-[242px] desktop:w-[870px]"
          />
        </div>
      </Container>
    </footer>
  );
}
