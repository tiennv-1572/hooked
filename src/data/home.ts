/**
 * Static content for the Home page (Figma "01 · Home", node 141:2 desktop / 2818:4694 mobile).
 * Keep the shapes CMS-friendly: every entity here is expected to come from a CMS later
 * (see plan/02-screens.md → "Data").
 */
import { routes } from "@/lib/site";

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** `youtubeId`: video slide — plays muted on a loop over `image` (poster). */
export type HeroSlide = { id: string; image: Photo; youtubeId?: string };

export type Highlight = {
  id: "academy" | "projects";
  title: string;
  href: string;
  /** Desktop composition: Academy hugs the right edge, Projects the left edge. */
  align: "start" | "end";
  image: Photo;
};

export type Service = {
  id: string;
  title: string;
  /** Desktop titles break onto two lines in Figma ("ARTISTS MANAGEMENT / & BOOKING"). */
  titleLines?: string[];
  description: string;
  image: Photo;
};

export type BlogPreview = {
  slug: string;
  title: string;
  lines: [string, string];
  /** Where the center card leads. Only 3 real blog posts exist in Figma, so 2 items point elsewhere. */
  href: string;
  image: Photo;
};

export type Partner = {
  name: string;
  logo: Photo;
};

const photos = {
  crowdSmoke: {
    src: "/images/photos/crowd-smoke.png",
    alt: "Đám đông giữa khói màu đỏ trong một đêm diễn của Hooked",
    width: 2550,
    height: 1440,
  },
  devoid: {
    src: "/images/photos/devoid-music-festival.png",
    alt: "Hai nghệ sĩ biểu diễn tại Devoid Music Festival",
    width: 1200,
    height: 800,
  },
  xomHuc: {
    src: "/images/photos/xom-huc-mua-2.png",
    alt: "Poster sự kiện Xóm Húc mùa 2",
    width: 1200,
    height: 675,
  },
  djCrowd: {
    src: "/images/photos/dj-crowd.jpg",
    alt: "DJ chơi nhạc giữa đám đông trong club",
    width: 1200,
    height: 800,
  },
  hookedTexture: {
    src: "/images/photos/hooked-texture.jpg",
    alt: "Logo Hooked trên nền giấy cũ",
    width: 1958,
    height: 745,
  },
  stageLights: {
    src: "/images/photos/stage-lights.png",
    alt: "Sân khấu với ánh đèn tím và khán giả",
    width: 2550,
    height: 1440,
  },
  vuiFest: {
    src: "/images/photos/vui-fest-cat-ba.jpg",
    alt: "Đội ngũ Hooked tại Vui Fest Cát Bà",
    width: 1200,
    height: 800,
  },
  spinAwards: {
    src: "/images/photos/spin-awards.png",
    alt: "DJ biểu diễn tại SPIN Awards",
    width: 720,
    height: 404,
  },
} satisfies Record<string, Photo>;

/** Five slides, autoplay every 5s (Figma 90.1 · Home / Hero carousel). */
export const heroSlides: HeroSlide[] = [
  { id: "crowd-smoke", image: photos.crowdSmoke },
  { id: "devoid", image: photos.devoid },
  { id: "xom-huc", image: photos.xomHuc },
  { id: "dj-crowd", image: photos.djCrowd },
  { id: "hooked-texture", image: photos.hookedTexture },
];

export const intro = {
  titleLines: ["SUPPORTING", "LOCAL", "ARTISTS."],
  // Copy kept verbatim from Figma ("BỀ PHÓNG" — likely a typo of "BỆ PHÓNG", flagged in plan/06-open-questions.md).
  body: "HOOKED ENTERTAINMENT SẼ LÀ BỀ PHÓNG CHO NHỮNG NGHỆ SỸ ÂM NHẠC ĐIỆN TỬ CÓ CƠ HỘI PHÁT HUY TỐI ĐA TIỀM NĂNG CỦA MÌNH.",
};

export const highlights: Highlight[] = [
  {
    id: "academy",
    title: "ACADEMY",
    href: routes.academy,
    align: "end",
    image: {
      src: "/images/photos/highlight-academy.png",
      alt: "Học viên sản xuất nhạc tại Hooked Academy",
      width: 474,
      height: 308,
    },
  },
  {
    id: "projects",
    title: "PROJECTS",
    href: routes.projects,
    align: "start",
    image: {
      src: "/images/photos/highlight-projects.png",
      alt: "Sân khấu lễ hội ngoài trời do Hooked tổ chức",
      width: 556,
      height: 363,
    },
  },
];

export const services: Service[] = [
  {
    id: "academy",
    title: "ACADEMY",
    description:
      "Đào tạo kiến thức chuyên môn. cung cấp các khóa học về DJ, MC Hype & Producer từ Cơ bản cho người mới bắt đầu cho tới các khóa học Nâng Cao & Chuyên Nghiệp",
    image: photos.stageLights,
  },
  {
    id: "media",
    title: "MEDIA",
    description:
      "Hỗ trợ tối đa cho các nghệ sĩ về mặt hình ảnh & truyền thông. Cung cấp dịch vụ truyền thông, các ấn phẩm thiết kế & media phục vụ nghệ sĩ & sự kiện",
    image: photos.xomHuc,
  },
  {
    id: "artists-management-booking",
    title: "ARTISTS MANAGEMENT & BOOKING",
    titleLines: ["ARTISTS MANAGEMENT", "& BOOKING"],
    description:
      "Xây dựng, định hướng & phát triển hình ảnh nghệ sĩ giúp phát huy tối đa về tiềm năng của mình. Cung cấp nghệ sĩ cho các điểm đến Nightlife hàng đầu",
    image: photos.djCrowd,
  },
  {
    id: "event",
    title: "EVENT",
    description:
      "Kết nối cộng đồng DJ, MC Hype, Producer và người yêu âm nhạc điện tử (raver) bằng những sự kiện được đầu tư kĩ lưỡng về ý tưởng & âm nhạc. Tạo điều kiện cho các nghệ sĩ được tỏa sáng ở sân khấu xứng đáng.",
    image: photos.crowdSmoke,
  },
];

/**
 * Five-item cyclic blog carousel. Figma supplies the captions of "Vui Fest Cát Bà" and "Hệ sinh thái Hooked"
 * and only 3 real blog posts exist; the other captions/targets are placeholders until the CMS provides them.
 * Order matches the Home composition: Spin Awards (left) · Vui Fest (center) · Devoid (right).
 */
export const blogPreviews: BlogPreview[] = [
  {
    slug: "spin-awards-xom-huc",
    title: "SPIN AWARDS & XÓM HÚC",
    lines: ["Hooked × Jägermeister", "Sân chơi cho DJ trẻ"],
    href: "/blog/spin-awards-xom-huc",
    image: photos.spinAwards,
  },
  {
    slug: "vui-fest-cat-ba",
    title: "VUI FEST CÁT BÀ",
    lines: ["Hooked × Sun Group", "Bệ phóng cho nghệ sĩ trẻ"],
    href: "/blog/vui-fest-cat-ba",
    image: photos.vuiFest,
  },
  {
    slug: "devoid-music-festival",
    title: "DEVOID MUSIC FESTIVAL",
    lines: ["Hooked Projects", "Đêm nhạc điện tử"],
    href: `${routes.projects}/devoid-music-festival`,
    image: photos.devoid,
  },
  {
    slug: "hooked-projects",
    title: "HOOKED PROJECTS",
    lines: ["Event · Media · Booking", "Khám phá các dự án"],
    href: routes.projects,
    image: {
      src: "/images/blog/static-surge.png",
      alt: "Artwork Static Surge",
      width: 692,
      height: 990,
    },
  },
  {
    slug: "he-sinh-thai-hooked",
    title: "HỆ SINH THÁI HOOKED",
    lines: ["Định hình lại mô hình", "đào tạo âm nhạc điện tử"], // copy from the mobile Blogpost variant
    href: "/blog/he-sinh-thai-hooked",
    image: {
      src: "/images/blog/abstract.png",
      alt: "Artwork trừu tượng tông cam",
      width: 660,
      height: 1196,
    },
  },
];

/** Index of the post shown in the center card on first render. */
export const blogInitialIndex = 1;

export const partnersIntro = {
  titleLines: ["HOOKED ENTERTAINMENT", "ĐỒNG HÀNH CÙNG CÁC", "THƯƠNG HIỆU LỚN"],
  body: "Hơn cả một academy, Hooked Entertainment là cầu nối thực chiến đưa học viên bước ra các sân khấu lớn. Với sự bảo chứng từ các đối tác tầm cỡ như tập đoàn Sun Group, thương hiệu toàn cầu Jägermeister cùng hệ thống club partner đỉnh cao (NOXX, Weeknd Hanoi, Weeknd Saigon...), Hooked liên tục kiến tạo những trải nghiệm âm nhạc đẳng cấp và xây dựng bệ phóng vững chắc cho thế hệ nghệ sĩ trẻ.",
  cta: { label: "Đối tác của Hooked", href: routes.partners },
};

/** Logo sizes are the rendered sizes from Figma (Home / Logo marquee). */
export const partners: Partner[] = [
  {
    name: "Notfun Media",
    logo: { src: "/images/partners/notfun-media.png", alt: "Notfun Media", width: 88, height: 42 },
  },
  {
    name: "Weeknd",
    logo: { src: "/images/partners/weeknd.png", alt: "Weeknd", width: 139, height: 28 },
  },
  {
    name: "Sun Group",
    logo: { src: "/images/partners/sun-group.png", alt: "Sun Group", width: 168, height: 53 },
  },
  {
    name: "Jägermeister",
    logo: { src: "/images/partners/jagermeister.png", alt: "Jägermeister", width: 172, height: 37 },
  },
];
