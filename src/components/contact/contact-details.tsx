type ContactDetailsProps = {
  labels: { phone: string; visit: string; social: string };
  phone: { display: string; href: string };
  companyName: string;
  address: string;
  socials: readonly { label: string; href: string }[];
};

const labelClassName = "text-xs leading-5 font-bold text-accent uppercase";
const linkClassName = "text-white transition-colors duration-150 hover:text-accent";

/**
 * "Contact / Details · Büro reference".
 * Desktop (2745:5944): three columns 260 · 520 · 404px with 80px gaps — Phone (28px `tel:` link),
 * Visit (company + address), Social (Facebook / Instagram / YouTube / TikTok).
 * Mobile (2745:5955): stacked with 32px gaps. Tablet: two columns (Phone | Visit, Social below).
 */
export function ContactDetails({ labels, phone, companyName, address, socials }: ContactDetailsProps) {
  return (
    <section
      data-reveal="stagger"
      aria-label="Thông tin liên hệ"
      className="grid gap-8 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-12 desktop:grid-cols-[260fr_520fr_404fr] desktop:gap-x-20"
    >
      <div className="flex flex-col gap-4">
        <h2 className={labelClassName}>{labels.phone}</h2>
        <a
          href={phone.href}
          aria-label={`Gọi Hooked: ${phone.display}`}
          className={`w-fit text-2xl leading-[34px] desktop:text-[28px] desktop:leading-10 ${linkClassName}`}
        >
          {phone.display}
        </a>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className={labelClassName}>{labels.visit}</h2>
        <address className="flex flex-col gap-4 not-italic">
          <span className="text-sm leading-6 font-bold text-white">{companyName}</span>
          <span className="text-base leading-[26px] text-muted desktop:text-lg desktop:leading-[30px]">{address}</span>
        </address>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className={labelClassName}>{labels.social}</h2>
        <ul className="flex flex-col gap-2">
          {socials.map((social) => (
            <li key={social.href}>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block text-base leading-[30px] desktop:text-lg desktop:leading-[30px] ${linkClassName}`}
              >
                {social.label}
                <span className="sr-only"> (mở trong tab mới)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
