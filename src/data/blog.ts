/**
 * Blog posts (Figma "11–13 · Blog", sections 2553:3833, 2846:5208, 2846:5213).
 * Article copy is verbatim from the Figma frames. Inline links and the index-card fields
 * (`kicker`, `excerpt`) are additions for navigation/SEO — see plan/02-screens.md → "Data".
 */
import type { Photo } from "@/data/home";
import { blogHref, projectHref, routes } from "@/lib/site";

/** A run of text inside a paragraph: plain, bold lead-in, or an inline link. */
export type Inline = string | { text: string; bold?: boolean; href?: string };

export type ArticleBlock =
  | { type: "paragraph"; content: Inline[] }
  /** Numbered section heading ("1. Xóm Húc – …"), rendered as `<h2>`. */
  | { type: "heading"; text: string }
  /** Paragraph-styled items that read as a list (bold lead-in + text). */
  | { type: "list"; items: Inline[][] }
  /** CMS / Photography pair — side by side from tablet, stacked on mobile. Heights are equalised. */
  | { type: "imagePair"; images: [Photo, Photo] }
  /** Orange link with ↗ ("Tìm hiểu các khóa học tại Hooked"). External hrefs open in a new tab. */
  | { type: "cta"; label: string; href: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** Figma section node id. */
  figma: string;
  /** Short label for the index card (not in Figma). */
  kicker: string;
  /** Verbatim fragment of the introduction — index card + meta description. */
  excerpt: string;
  intro: Inline[];
  introCta?: { label: string; href: string };
  hero: Photo;
  body: ArticleBlock[];
};

// Tiny authoring helpers keep the article data close to the Figma copy.
const p = (...content: Inline[]): ArticleBlock => ({ type: "paragraph", content });
const b = (text: string): Inline => ({ text, bold: true });
const a = (text: string, href: string): Inline => ({ text, href });
const cta = (label: string, href: string): ArticleBlock => ({ type: "cta", label, href });

export const blogPosts: BlogPost[] = [
  {
    slug: "vui-fest-cat-ba",
    title: "Hooked Entertainment × Sun Group: Bệ Phóng Đưa Nghệ Sĩ Trẻ Ra Sân Khấu Vui Fest Cát Bà",
    figma: "2553:3833",
    kicker: "Hooked × Sun Group",
    excerpt:
      "Sự hợp tác chiến lược giữa Hooked Entertainment và tập đoàn Sun Group tại chuỗi sự kiện Vui Fest Cát Bà chính là bước ngoặt khẳng định vị thế bệ phóng âm nhạc thực chiến hàng đầu dành cho thế hệ nghệ sĩ trẻ.",
    intro: [
      "Sự hợp tác chiến lược giữa Hooked Entertainment và tập đoàn ",
      a("Sun Group", routes.partners),
      " tại chuỗi sự kiện Vui Fest Cát Bà chính là bước ngoặt khẳng định vị thế bệ phóng âm nhạc thực chiến hàng đầu dành cho thế hệ nghệ sĩ trẻ. Vượt khỏi giới hạn của một academy đào tạo truyền thống, Hooked đem đến cơ hội đưa các học viên tiềm năng bước ra ánh sáng, trực tiếp biểu diễn và làm việc trong môi trường chuyên nghiệp đỉnh cao",
    ],
    introCta: { label: "Tìm hiểu thêm về Vui Fest Cát Bà", href: projectHref("vui-fest-cat-ba") },
    hero: {
      src: "/images/photos/vui-fest-cat-ba.jpg",
      alt: "Học viên và mentor Hooked trước sân khấu Ngọc Trai tại Vui Fest Cát Bà",
      width: 1200,
      height: 800,
    },
    body: [
      p(
        "Tại VUI FEST CAT BA Hooked Entertainment phụ trách không chỉ âm nhạc, mà toàn bộ chương trình biểu diễn nghệ thuật với nhiều loại hình biểu diễn khác nhau tại VUI-Fest Cat Ba để mang không khí lễ hội đến với Sun Paradise Land Cat Ba.",
      ),
      p(
        "Sân khấu Ngọc Trai không ngủ với âm nhạc từ các DJ & MC Hype nhà Hooked, những giai điệu du dương của Violin tại Quảng Trường, những màn diễu hành, dance routine, xiếc đầy màu sắc trên đường phố màn biểu diễn lửa trên bờ biển khởi động cho show diễn pháo hoa đầy màu sắc đã mang tới cho Sun Paradise Land Cat Ba một mùa hè đáng nhớ.",
      ),
      p(
        'Đặc biệt, tại sân khấu Ngọc Trai các "Rising Stars" của Hooked được trao tấm vé độc quyền để làm chủ sân khấu, chia sẻ không gian trình diễn cùng dàn Mentor giàu kinh nghiệm tại một trong những tọa độ giải trí sôi động nhất với hàng nghìn lượt khán giả ghé thăm sân khấu Ngọc Trai mỗi buổi biểu diễn.',
      ),
      {
        type: "imagePair",
        images: [
          {
            src: "/images/photos/vui-fest-performance.jpg",
            alt: "Màn trình diễn vũ đạo phát sáng trên sân khấu Vui Fest Cát Bà",
            width: 2400,
            height: 1600,
          },
          {
            src: "/images/photos/vui-fest-audience.jpg",
            alt: "Hàng nghìn khán giả bật đèn điện thoại tại Vui Fest Cát Bà",
            width: 2400,
            height: 1600,
          },
        ],
      },
      cta("Tìm hiểu các khóa học tại Hooked", routes.academy),
      p(
        "Mô hình ",
        a("hệ sinh thái của Hooked Entertainment", blogHref("he-sinh-thai-hooked")),
        " được xây dựng trên 3 giá trị cốt lõi: Học - Thực chiến - Trở thành Rising Star mainstream. Dự án Vui Fest Cát Bà là cầu nối trực tiếp biến đam mê thành sự nghiệp, giúp học viên tự tin khẳng định cái tôi sáng tạo và bản sắc cá nhân độc bản",
      ),
      p(
        "Dù bạn là một Newbie bắt đầu từ con số 0 hay người đã có nghề muốn nâng cao kỹ năng biểu diễn, Hooked luôn chuẩn bị sẵn sàng bệ phóng để đưa bạn bước ra các sân khấu tầm cỡ.",
      ),
      cta("Xem recap Vui Fest Cát Bà", "https://youtu.be/EmbpvTQbrCs"),
    ],
  },
  {
    slug: "he-sinh-thai-hooked",
    title: "HỆ SINH THÁI HOOKED: ĐỊNH HÌNH LẠI MÔ HÌNH ĐÀO TẠO ÂM NHẠC ĐIỆN TỬ",
    figma: "2846:5208",
    kicker: "Hooked Academy",
    excerpt:
      "Trong bối cảnh thị trường giải trí và nền công nghiệp Nightlife tại Việt Nam đang phát triển mạnh mẽ, âm nhạc điện tử không còn đơn thuần là thú vui giải trí ngẫu hứng.",
    intro: [
      "Trong bối cảnh thị trường giải trí và nền công nghiệp Nightlife tại Việt Nam đang phát triển mạnh mẽ, âm nhạc điện tử không còn đơn thuần là thú vui giải trí ngẫu hứng. Nghề DJ, MC Hype hay Producer đòi hỏi sự kết hợp bài bản giữa tư duy nghệ thuật, kỹ năng kỹ thuật chuẩn mực và bản lĩnh sân khấu thực chiến.",
    ],
    hero: {
      src: "/images/photos/devoid-music-festival.png",
      alt: "Hai nghệ sĩ biểu diễn tại Devoid Music Festival",
      width: 1200,
      height: 800,
    },
    body: [
      p(
        "Sự xuất hiện của Hooked Entertainment đã mang đến một làn gió mới, từng bước định hình lại mô hình đào tạo âm nhạc điện tử truyền thống bằng một hệ sinh thái toàn diện và khác biệt.",
      ),
      cta("Tìm hiểu các khóa học tại Hooked", routes.academy),
      p(
        "Không dừng lại ở mô hình lớp học truyền thống chỉ xoay quanh việc truyền đạt lý thuyết khô khan hay hướng dẫn thao tác nút bấm, Hooked Entertainment được xây dựng dựa trên 3 giá trị cốt lõi:",
      ),
      {
        type: "list",
        items: [
          [
            b("Điểm chạm Nghệ thuật:"),
            ' Giao điểm hoàn hảo giữa kỹ năng chuyên môn chuẩn mực (DJ, MC Hype, Producer) và việc khai phá bản sắc cá nhân độc đáo. Tại Hooked, học viên không chỉ học cách mix nhạc hay điều khiển thiết bị, mà học cách "mix" chính cá tính và tần số âm nhạc riêng của mình vào từng set nhạc.',
          ],
          [
            b("Mô hình Hệ sinh thái Âm nhạc Thực chiến:"),
            " Hooked vận hành như một bệ phóng thực thụ với lộ trình khép kín: Học - Thực chiến - Trở thành Rising Star mainstream. Học viên được cọ xát thực tế thông qua các sự kiện, workshop, giải đấu nội bộ (",
            a("Xóm Húc", projectHref("xom-huc")),
            ") và mở rộng ra các sân khấu lớn như NOXX, Weeknd Hanoi, hay sự kiện hợp tác tầm cỡ cùng Sun Group tại ",
            a("Vui Fest Cát Bà", projectHref("vui-fest-cat-ba")),
            ".",
          ],
          [
            b("Tinh thần Nghệ sĩ mới:"),
            ' Đại diện cho thế hệ trẻ khao khát khẳng định cái tôi. Hooked đề cao sự sáng tạo, tư duy phản biện và tinh thần học hỏi độc lập để mỗi cá nhân khi bước ra khỏi studio đều là một phiên bản độc bản, không bao giờ là "bản sao" của bất kỳ ai',
          ],
        ],
      },
      {
        type: "imagePair",
        images: [
          {
            src: "/images/photos/stage-lights.png",
            alt: "Nghệ sĩ Hooked biểu diễn trước đám đông dưới ánh đèn tím",
            width: 2550,
            height: 1440,
          },
          {
            src: "/images/blog-posts/hooked-thuc-chien-san-khau.png",
            alt: "Nghệ sĩ Hooked thực chiến trên sân khấu Devoid Music Festival",
            width: 1200,
            height: 800,
          },
        ],
      },
      p(
        "Cho dù bạn là một Newbie chưa từng chạm vào bàn DJ, một nhân viên văn phòng muốn tìm kiếm nghề tay trái nghệ thuật để tỏa sáng tại Year End Party, hay thế hệ trẻ nhí (dự án HOOKID dành cho lứa tuổi 8-15), Hooked luôn có lộ trình đào tạo được thiết kế tối ưu:",
      ),
      {
        type: "list",
        items: [
          [
            b("Khóa học DJ & MC Hype (Cơ bản & Toàn diện):"),
            " Tối ưu thời gian, trang bị đầy đủ tư duy nhịp điệu, kỹ năng xử lý tình huống và phong thái làm chủ sân khấu.",
          ],
          [
            b("Khóa học Sáng tạo âm nhạc (Producer EDM, Hiphop & Flip Production):"),
            " Cung cấp tư duy làm nhạc, phần mềm chuyên dụng và data sample sound độc quyền.",
          ],
          [
            b("Sân chơi cọ xát đỉnh cao:"),
            " Chuỗi giải đấu ",
            a("Spin Awards Hip-hop Edition", projectHref("spin-awards")),
            ", ",
            a("Frequency Arena", projectHref("frequency-arena")),
            ", ",
            a("Xóm Húc Contest", projectHref("xom-huc")),
            " giúp học viên rèn luyện bản lĩnh thi đấu và khẳng định tên tuổi.",
          ],
        ],
      },
      cta("Khám phá khóa học DJ & MC tại Hooked", "https://youtu.be/UU5u9odLfn8"),
    ],
  },
  {
    slug: "spin-awards-xom-huc",
    title: "Spin Awards & Xóm Húc - Những Giải Đấu Nâng Tầm Cộng Đồng DJ",
    figma: "2846:5213",
    kicker: "DJ Contest",
    excerpt:
      "Hooked Entertainment không chỉ dừng lại ở vai trò một academy đào tạo DJ, MC Hype và Producer, mà còn chủ động kiến tạo những sân chơi quy mô từ nội bộ đến mở rộng như Xóm Húc và Spin Awards.",
    intro: [
      "Trong nền công nghiệp giải trí và âm nhạc điện tử, kỹ thuật trình diễn chuyên nghiệp cùng bản lĩnh sân khấu không thể tự nhiên hình thành nếu thiếu đi môi trường cọ xát thực tế. Nhận thức rõ điều đó, Hooked Entertainment không chỉ dừng lại ở vai trò một ",
      a("academy đào tạo DJ, MC Hype và Producer", routes.academy),
      ", mà còn chủ động kiến tạo những sân chơi quy mô từ nội bộ đến mở rộng như ",
      a("Xóm Húc", projectHref("xom-huc")),
      " và ",
      a("Spin Awards", projectHref("spin-awards")),
      ". Đây chính là những cột mốc quan trọng giúp nuôi dưỡng tài năng, rèn luyện tư duy âm nhạc và từng bước nâng tầm cộng đồng DJ Việt Nam",
    ],
    hero: {
      src: "/images/photos/spin-awards.png",
      alt: "DJ biểu diễn tại Spin Awards: Hip-hop Edition",
      width: 720,
      height: 404,
    },
    body: [
      { type: "heading", text: '1. Xóm Húc – Sân Chơi "Ao Làng" Đầy Bứt Phá Cho Học Viên' },
      p(
        'Được mệnh danh là giải đấu "ao làng", quy mô giới hạn nhưng cực kỳ khốc liệt do Hooked tổ chức, Xóm Húc là bước đệm đầu tiên giúp các học viên bước ra khỏi phòng tập để đối mặt với áp lực sân khấu thực tế:',
      ),
      p(
        "Môi trường cọ xát thực chiến: Học viên được tự do thử nghiệm tư duy chọn bài, kỹ thuật và khả năng kiểm soát năng lượng đám đông, ứng phó trước các đề bài bất ngờ của cuộc thi, trước sự đánh giá trực tiếp từ dàn Mentor.",
      ),
      cta(
        "Xem Xóm Húc trên YouTube",
        "https://youtube.com/playlist?list=PLnIAMU0jaevQJ7V6ONtFXyXlJRIOCMeTV&si=BNKqVrabSACPy3ZH",
      ),
      p(
        "Bệ phóng nhân tố mới: Xóm Húc chính là nơi phát hiện và tôi luyện nhiều gương mặt nổi bật. Điển hình như hành trình của ",
        a("DJ J.Grayson", routes.students),
        " – từ một học viên tham gia Xóm Húc mùa 1 đạt giải ba, tiếp tục bứt phá giành ngôi Á quân mùa 2, để rồi tích lũy kinh nghiệm biểu diễn tại các cơ sở nightlife lớn và chính thức trở thành Resident DJ tại NOXX, Dopamine, và nhiều điểm đến nightlife tại Hà Nội.",
      ),
      p(
        "Tinh thần kết nối Homie: Không nặng nề áp lực thắng thua, Xóm Húc tạo nên không gian chia sẻ kinh nghiệm, nơi các học viên cùng học hỏi và nhận được những góp ý thẳng thắn từ người đi trước để hoàn thiện bản thân.",
      ),
      { type: "heading", text: "2. Spin Awards – Đỉnh Cao Cọ Xát & Khẳng Định Bản Thân" },
      p(
        "Nếu Xóm Húc là bước khởi đầu nội bộ, thì Spin Awards (tiêu biểu là Spin Awards: Hip-hop Edition) là đấu trường chuyên nghiệp mở rộng, thu hút những nhân tố xuất sắc trong giới DJ:",
      ),
      cta(
        "Xem Spin Awards trên YouTube",
        "https://youtube.com/playlist?list=PLA8iImZ2cpBcTX_bfIbsUPy721pQcjs-I&si=pwLGm6cc4KRRWA4J",
      ),
      p(
        "Quy mô & Thể lệ chuyên nghiệp: Giải đấu quy tụ dàn thí sinh tài năng trải qua các vòng thi gay gắt như Vòng Ghi Hình, Bán Kết (Top 8) và Chung Kết, đòi hỏi tư duy âm nhạc độc bản cùng kỹ thuật scratching, mixing chuẩn mực",
      ),
      {
        type: "imagePair",
        images: [
          {
            src: "/images/blog-posts/spin-awards-trinh-dien.png",
            alt: "Thí sinh trình diễn trên sân khấu Spin Awards",
            width: 720,
            height: 404,
          },
          {
            src: "/images/blog-posts/spin-awards-san-khau.png",
            alt: "DJ cổ vũ khán giả trên sân khấu Spin Awards",
            width: 720,
            height: 404,
          },
        ],
      },
      p(
        "Giải thưởng hấp dẫn & Bảo chứng uy tín: Với cơ cấu giải thưởng giá trị (Quán quân nhận 50.000.000 VNĐ, Á quân 40.000.000 VNĐ, Hạng ba 25.000.000 VNĐ) cùng sự đồng hành của các đối tác lớn như ",
        a("WEEKND và JÄGERMEISTER", routes.partners),
        ", Spin Awards đã vinh danh những cái tên nổi bật như Champion Jake Ryan.",
      ),
      p(
        "Lan tỏa cảm hứng âm nhạc: Giải đấu không chỉ tôn vinh nhà vô địch mà còn tạo nên hiệu ứng truyền thông mạnh mẽ, khẳng định vị thế và tư duy âm nhạc chất lượng của thế hệ nghệ sĩ trẻ.",
      ),
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

const inlineText = (content: Inline[]) => content.map((run) => (typeof run === "string" ? run : run.text)).join("");

/** Estimated reading time in minutes (≈ 220 Vietnamese words per minute). */
export function readingMinutes(post: BlogPost) {
  const text = [
    inlineText(post.intro),
    ...post.body.map((block) => {
      if (block.type === "paragraph") return inlineText(block.content);
      if (block.type === "list") return block.items.map(inlineText).join(" ");
      if (block.type === "heading") return block.text;
      return "";
    }),
  ].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
