/**
 * Static content for the Partners page (Figma "15 · Partners", desktop 2744:4786 / mobile 2744:4836).
 * See plan/02-screens.md §15 → Data (`Partner`, `Collaboration`).
 */
import type { Photo } from "@/data/home";
import { projectHref } from "@/lib/site";

export type PartnerLogo = {
  name: string;
  /** White logo on transparent background (same PNG exports as the Home marquee). */
  logo: Photo;
};

export type Collaboration = {
  id: string;
  title: string;
  /** Partner line under the title ("Golden Sky Media - Sun Group"). */
  partnerLabel: string;
  href: string;
  image: Photo;
};

export const partnersIntro = {
  eyebrow: "PARTNERS",
  title: "HOOKED ENTERTAINMENT ĐỒNG HÀNH CÙNG CÁC THƯƠNG HIỆU LỚN",
  body: "Hơn cả một academy, Hooked Entertainment là cầu nối thực chiến đưa học viên bước ra các sân khấu lớn. Với sự bảo chứng từ các đối tác tầm cỡ như tập đoàn Sun Group, thương hiệu toàn cầu Jägermeister cùng hệ thống club partner đỉnh cao (NOXX, Weeknd Hanoi, Weeknd Saigon...), Hooked liên tục kiến tạo những trải nghiệm âm nhạc đẳng cấp và xây dựng bệ phóng vững chắc cho thế hệ nghệ sĩ trẻ.",
};

/** Logo wall order (2747:4692). Sizes are the intrinsic PNG sizes. */
export const partnerLogos: PartnerLogo[] = [
  {
    name: "Notfun Media",
    logo: { src: "/images/partners/notfun-media.png", alt: "Notfun Media", width: 121, height: 58 },
  },
  { name: "Weeknd", logo: { src: "/images/partners/weeknd.png", alt: "Weeknd", width: 190, height: 38 } },
  { name: "Sun Group", logo: { src: "/images/partners/sun-group.png", alt: "Sun Group", width: 230, height: 72 } },
  {
    name: "Jägermeister",
    logo: { src: "/images/partners/jagermeister.png", alt: "Jägermeister", width: 236, height: 51 },
  },
];

/** "Partners / Collaborations" (2749:4691). Each card opens the matching project detail page. */
export const collaborations: Collaboration[] = [
  {
    id: "vui-fest-cat-ba",
    title: "Vui Fest Cát Bà",
    partnerLabel: "Golden Sky Media - Sun Group",
    href: projectHref("vui-fest-cat-ba"),
    image: {
      src: "/images/photos/vui-fest-cat-ba.jpg",
      alt: "Đội ngũ Hooked tại Vui Fest Cát Bà",
      width: 1200,
      height: 800,
    },
  },
  {
    id: "frequency-arena",
    title: "Frequency Arena",
    partnerLabel: "NOXX",
    href: projectHref("frequency-arena"),
    image: {
      src: "/images/photos/dj-crowd.jpg",
      alt: "DJ chơi nhạc giữa đám đông tại Frequency Arena, NOXX",
      width: 1200,
      height: 800,
    },
  },
];
