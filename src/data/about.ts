/**
 * Static content for the About page (Figma "10 · About", desktop 2553:3834 / mobile 2553:3838).
 * Shapes are CMS-friendly (`page.about` later — see plan/02-screens.md §10).
 */
import type { Photo } from "@/data/home";
import { routes } from "@/lib/site";

export type Capability = {
  /** Bold lead-in ("Đào tạo chuyên môn & định hướng hình ảnh"). */
  lead: string;
  /** Regular continuation, starting with a space or punctuation. */
  rest: string;
  /** Where the lead-in leads. Figma draws no link here; wired to the matching section of the site (assumption). */
  href?: string;
};

export const aboutIntro = {
  /** "Page title" (2659:4691) — rendered as the page h1. */
  title: "ABOUT HOOKED",
  /** Mobile-only accent eyebrow (2659:4694). */
  eyebrow: "SUPPORT LOCAL ARTIST",
  lead: "Với những ai theo dõi âm nhạc điện tử lâu năm tại Việt Nam, HOOKED có lẽ không còn là cái tên quá xa lạ.",
  headlineLines: ["TỪ TINH THẦN", "SUPPORT LOCAL ARTIST"] as [string, string],
  body: 'Với tinh thần "support local artist", Hooked Management đóng vai trò quản lý, đồng hành cùng các DJ Việt để đón đầu làn sóng EDM bùng nổ vào năm 2016, biến những ước mơ đứng chung sân khấu với những tên tuổi hàng đầu như Armin van Buuren, Tiesto, Yellow Claw, Marshmello, Headhunterz,... trở thành hiện thực.',
  aside:
    "Bất cứ nơi nào có âm nhạc chất lượng, Hooked đều ở đó, đảm bảo cho một dàn line-up chất lượng, góp phần đặt nền móng cho sự phát triển của EDM tại Việt Nam.",
};

export const aboutEcosystem = {
  titleLines: ["MỘT HỆ SINH THÁI", "CHO NGHỆ SĨ VIỆT"],
  statement:
    "Hooked vẫn giữ vững tinh thần từ những ngày đầu tiên nhưng với một diện mạo hoàn toàn mới - một hệ sinh thái hỗ trợ các DJ, Producer, MC Hype một cách toàn diện nhất, bao gồm cả về kiến thức chuyên môn, xây dựng hình ảnh, và đưa sản phẩm đến gần hơn với khán giả.",
  body: "Bên cạnh việc quản lý & định hướng nghệ sĩ như trước đây hệ sinh thái của Hooked được mở rộng thêm các hạng mục mới: đào tạo chuyên môn, phát hành sản phẩm, media, tổ chức sự kiện,... mang đến mọi cơ hội cho nghệ sĩ có thể phát huy tối đa tiềm năng của mình, bao gồm",
  capabilities: [
    { lead: "Đào tạo chuyên môn & định hướng hình ảnh", rest: " DJ, MC Hype & Music Producer.", href: routes.academy },
    {
      lead: "Kết nối, phát triển cộng đồng",
      rest: " DJ/MC Hype/Raver tại Việt Nam một cách chuyên nghiệp và bài bản nhất.",
      href: routes.students,
    },
    {
      lead: "Cung cấp giải pháp hình ảnh chuyên nghiệp",
      rest: " cho đa dạng các loại hình sự kiện.",
      href: routes.projects,
    },
    { lead: "Tổ chức những lễ hội âm nhạc điện tử", rest: " quy mô lớn tại Việt Nam.", href: routes.projects },
    { lead: "Cung cấp DJ, MC Hype", rest: " cho các điểm đến nightlife hàng đầu tại Việt Nam.", href: routes.contact },
  ] satisfies Capability[],
  /** "Portfolio / Open PDF" (2658:4714) — the Figma prototype links to the portfolio PDF on Google Drive. */
  portfolio: {
    label: "Xem full portfolio",
    href: "https://drive.google.com/file/d/1KoAmeZnJNJLZ7eEsZiRmsYZF7EgPLz-q/view",
  },
};

/** `file` is relative to /images/about unless it is already an absolute path (shared photos). */
const photo = (file: string, alt: string, width: number, height: number): Photo => ({
  src: file.startsWith("/") ? file : `/images/about/${file}`,
  alt,
  width,
  height,
});

/** "02 / Photography · Stage to artists" (2685:4689): full stage + artists + portrait pair. */
export const stagePhotos = {
  fullStage: photo("devoid-full-stage.jpg", "Sân khấu Devoid Music Festival với pháo CO2 và khán giả", 2048, 1365),
  artists: photo("devoid-artists.jpg", "Các nghệ sĩ dang tay trên sân khấu Devoid Music Festival", 2048, 1365),
  localDj: photo("devoid-local-dj.jpg", "DJ Việt đeo kính trắng biểu diễn tại Devoid Music Festival", 1365, 2048),
  frequencyDj: photo("frequency-dj.jpg", "DJ tóc đỏ chơi nhạc tại Frequency Arena", 1600, 2400),
};

/** "04 / Photography · Live experience" (2685:4698). */
export const livePhotos = {
  djPerformance: photo(
    "devoid-dj-performance.jpg",
    "Matisse & Sadko biểu diễn dưới ánh đèn tại Devoid Music Festival",
    2048,
    1365,
  ),
  firePerformance: photo(
    "vui-fest-fire-performance.jpg",
    "Nghệ sĩ múa lửa giữa khán giả tại Vui Fest Cát Bà",
    1600,
    2400,
  ),
  performance: photo(
    "/images/photos/vui-fest-performance.jpg",
    "Màn trình diễn sân khấu phát sáng tại Vui Fest Cát Bà",
    2400,
    1600,
  ),
  audience: photo(
    "/images/photos/vui-fest-audience.jpg",
    "Biển khán giả bật đèn điện thoại tại Vui Fest Cát Bà",
    2400,
    1600,
  ),
};
