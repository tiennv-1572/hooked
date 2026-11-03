/**
 * Student Stories content (Figma "03 · Student Stories" 2846:5166, readers "72 · OVERLAYS / Student readers" 2815:4693).
 * Copy is the exact supplied student copy from the readers (desktop `Reader / Student introduction` layers).
 * CMS-friendly: every field here is expected to come from a CMS later (see plan/02-screens.md → 03 · Data).
 */
import type { Photo } from "@/data/home";
import { routes } from "@/lib/site";

/** Free text in the CMS ("DJ", "MC HYPE"). */
export type StudentRole = string;

export type StudentPortrait = Photo & {
  /**
   * Optional art-direction crop taken from the Figma photo component (`Stories / Photo / SIMPLE`):
   * the image is drawn `scale` × the frame width, left-aligned, and shifted up by `top` (fraction of the
   * image height). Frames using a crop must keep a width/height ratio ≥ 0.73 so the image still covers them.
   */
  crop?: { scale: number; top: number };
};

export type Student = {
  slug: string;
  name: string;
  role: StudentRole;
  affiliation: string;
  portrait: StudentPortrait;
  /** Reader copy: sanitized HTML from the CMS editor. */
  story: string;
};

/** Original site copy used to seed the CMS: the story is plain paragraphs. */
type StudentSeed = Omit<Student, "story"> & { story: string[] };

const affiliation = "Hooked Academy";

const portrait = (slug: string, name: string, width: number, height: number, ext = "jpg"): StudentPortrait => ({
  src: `/images/students/${slug}.${ext}`,
  alt: `Chân dung học viên ${name}`,
  width,
  height,
});

/** Grid order of the Figma article grid (2189:2547): 8 DJs, then 5 MC Hype. */
export const students: StudentSeed[] = [
  {
    slug: "jgrayson",
    name: "JGRAYSON",
    role: "DJ",
    affiliation,
    portrait: portrait("jgrayson", "JGRAYSON", 1067, 1600),
    story: [
      "Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, J Grayson bứt phá mạnh mẽ với thành tích 2 lần lọt vào chung kết cuộc thi Xóm Húc. Từng biểu diễn tại loạt tụ điểm như Pretty, Analog, Dopamine và Yin District, hiện anh đang là Resident DJ tại NOXX CITI, đồng thời trở lại Hooked với cương vị giảng viên.",
    ],
  },
  {
    slug: "vatuz",
    name: "Vatuz",
    role: "DJ",
    affiliation,
    portrait: portrait("vatuz", "Vatuz", 1067, 1600),
    story: [
      "Sau khi hoàn thành khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, DJ Vatuz đã bứt phá mạnh mẽ với các thành tích nổi bật: Top 3 Xóm Húc 2024 và Á quân Spin Awards HipHop Edition 2025. Với tư duy âm nhạc cá tính, anh tự tin làm chủ bàn mix và biểu diễn thường xuyên tại nhiều tụ điểm giải trí lớn như Weeknd Hanoi, Analog Bar và Pretty Lounge.",
    ],
  },
  {
    slug: "kimmy",
    name: "KIMMY",
    role: "DJ",
    affiliation,
    portrait: portrait("kimmy", "KIMMY", 1067, 1600),
    story: [
      "Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, DJ Kimmy đã nhanh chóng khẳng định bản lĩnh khi biểu diễn tại nhiều sự kiện lớn của Vietjet, Đại học FPT cùng các club nổi tiếng như 1900, Dopamine. Cô ghi dấu ấn mạnh mẽ với phong cách biến hóa đa dạng từ Afro House, Melodic Techno đến EDM sôi động.",
    ],
  },
  {
    slug: "justwang",
    name: "JUSTWANG",
    role: "DJ",
    affiliation,
    portrait: portrait("justwang", "JUSTWANG", 1200, 1600),
    story: [
      "Thuộc nhóm tân binh trẻ nhất thuộc Hooked nhưng JustWang đã được thử lửa tại nhiều môi trường đầy thử thách như các show tại ĐH Thương mại, ĐH Văn Hoá, ĐH Kinh tế - ĐHQG và nhiều trường THCS, THPT cùng hàng loạt Bar,  Lounge, Club lớn nhỏ.",
    ],
  },
  {
    slug: "tobi",
    name: "TOBI",
    role: "DJ",
    affiliation,
    portrait: portrait("tobi", "TOBI", 1143, 1600),
    story: [
      "Hoàn thành khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, Tobi đã nhanh chóng khẳng định vị thế là một nhân tố đầy triển vọng trong cộng đồng nightlife Hà Nội. Hiện đang đảm nhiệm vai trò Resident DJ tại WKND Hanoi, đã từng hợp tác với thương hiệu Heineken trong sự kiện Countdown Heineken 2025-2026",
    ],
  },
  {
    slug: "afterglow",
    name: "AFTERGLOW",
    role: "DJ",
    affiliation,
    portrait: portrait("afterglow", "AFTERGLOW", 1365, 2048),
    story: [
      "Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, DJ Afterglow ghi dấu ấn với khả năng làm chủ các dòng nhạc năng lượng cao như House, Techno và DNB. Sở hữu bản lĩnh sân khấu vững vàng, anh phủ sóng từ các sự kiện trường học đến loạt tụ điểm nightlife hàng đầu như Weeknd Hanoi, Midnight Club và YIN District.",
    ],
  },
  {
    slug: "tiinix",
    name: "TIINIX",
    role: "DJ",
    affiliation,
    portrait: portrait("tiinix", "TIINIX", 1067, 1600),
    story: [
      "Sau khóa học DJ Chuyên Nghiệp tại Hooked Entertainment, DJ Tiinix chuyển mình ấn tượng từ nhiếp ảnh gia thành DJ/Producer với thương hiệu âm nhạc TIINIXERGY. Đảm nhiệm vai trò Leader của Dopamine Hanoi, anh liên tục khuấy động các sân khấu như Cosmos, Block B và ASTA Club bằng những set nhạc remix, mashup bùng nổ năng lượng.",
    ],
  },
  {
    slug: "norriz",
    name: "NORRIZ",
    role: "DJ",
    affiliation,
    portrait: portrait("norriz", "NORRIZ", 1200, 1600, "png"),
    story: [
      "Norriz là một tài năng trẻ, đã hoàn thành khóa học DJ chuyên nghiệp tại Hooked Entertainment. Norriz lọt sâu vào top các cuộc thi về DJ như Xóm Húc, đồng thời để lại dấu ấn mạnh mẽ trong lần debut tại NOXX Citi - Club xếp hạng thứ 85 thế giới (DJ Mag) tại sự kiện Hooked Rising Star.",
    ],
  },
  {
    slug: "puzzle",
    name: "PUZZLE",
    role: "MC HYPE",
    affiliation,
    portrait: portrait("puzzle", "PUZZLE", 1065, 1600),
    story: [
      "MC Puzzle là một nghệ sĩ MC Hype đầy tài năng với kinh nghiệm dày dặn tại những sân khấu giải trí hàng đầu khu vực miền Bắc. Khẳng định vị thế qua vai trò nghệ sĩ trình diễn tại NOXX CITI (Top 85 Clubs thế giới)",
      "Puzzle sở hữu khả năng làm chủ sân khấu cực kỳ ấn tượng cùng tư duy âm nhạc hiện đại và kỹ năng điều phối đám đông linh hoạt",
    ],
  },
  {
    slug: "mambo",
    name: "MAMBO",
    role: "MC HYPE",
    affiliation,
    portrait: portrait("mambo", "MAMBO", 1068, 1600),
    story: [
      "Sau khóa học MC Chuyên Nghiệp tại Hooked Entertainment, MC Mambo nhanh chóng khẳng định tên tuổi nhờ nguồn năng lượng bùng nổ và chất giọng đặc trưng cuốn hút. Anh hiện là gương mặt quen thuộc khuấy động các điểm đến nightlife hàng đầu Hà Nội như NOXX CITI, WEEKND Hanoi, Sniff, Midnight Club và Zion Lounge.",
    ],
  },
  {
    slug: "simple",
    name: "SIMPLE",
    role: "MC HYPE",
    affiliation,
    // Square poster: Figma crops to the portrait on the left (x 0–70%), hiding the "PROFILE" panel.
    portrait: { ...portrait("simple", "SIMPLE", 3509, 3508), crop: { scale: 1.4286, top: 0.04 } },
    story: [
      "Sau khóa học MC Chuyên Nghiệp tại Hooked Entertainment, MC Simple khẳng định tư duy điều phối sân khấu nhạy bén và bản lĩnh chuyên nghiệp. Anh liên tục khuấy động loạt tụ điểm giải trí như Sniff, Lism, Shark Club, The Kollab, đồng thời dẫn dắt nhiều sự kiện lớn tại NOXX Citi cùng các trường đại học hàng đầu.",
    ],
  },
  {
    slug: "lil-v",
    name: "LIL'V",
    role: "MC HYPE",
    affiliation,
    portrait: portrait("lil-v", "LIL'V", 1067, 1600),
    story: [
      "Sau khóa học MC Chuyên Nghiệp tại Hooked Entertainment, MC Lil’V nhanh chóng khẳng định năng lực khi trở thành Head Operator tại VOX Westlake Hanoi. Anh liên tục khuấy động các sân khấu lớn như NOXX CITI, các đêm tiệc Countdown tại Terraco & Majesty Hotel cùng hàng loạt sự kiện âm nhạc quy mô tại Bắc Ninh và Hạ Long.",
    ],
  },
  {
    slug: "t14",
    name: "T14",
    role: "MC HYPE",
    affiliation,
    portrait: portrait("t14", "T14", 1066, 1600),
    story: [
      "Sau khóa học MC Chuyên Nghiệp tại Hooked Entertainment, nữ MC Hype trẻ T14 (tổ đội The Hornet) đã nhanh chóng khẳng định thực lực và bản lĩnh sân khấu. Dù mới bắt đầu sự nghiệp từ năm 2024, cô đã trở thành gương mặt trình diễn quen thuộc tại nhiều tụ điểm nightlife hàng đầu như NOXX CITI, Hero Club và Track 42.",
    ],
  },
];

/** Page copy, fixed on the site (Stories / Intro 2189:2540, Grid header 2189:2544, mobile Introduction 2823:4904). */
export const studentsPage = {
  title: "Học viên tiêu biểu",
  /** Mobile breaks the H1 after "Học viên" (2823:4907). */
  titleLines: ["Học viên", "tiêu biểu"],
  description: "Những câu chuyện từ cộng đồng học viên Hooked.",
  collectionLabel: "Tất cả câu chuyện",
  countLabel: `${students.length} HỌC VIÊN`,
  readLabel: "Xem câu chuyện",
  /** Mobile reader close bar label (Stories / Reader / Mobile 2815:4714). */
  readerLabel: "HỌC VIÊN TIÊU BIỂU",
} as const;

/** "DJ · Hooked Academy" */
export const studentRoleLabel = (student: Pick<Student, "role" | "affiliation">) =>
  `${student.role} · ${student.affiliation}`;

export const getStudent = (slug: string | null | undefined) =>
  slug ? students.find((student) => student.slug === slug) : undefined;

/** Query key used to deep-link a reader: `/academy/students?story=vatuz`. */
export const STORY_QUERY_KEY = "story";

/** `/academy/students?story=vatuz` — opens that student's reader on load. */
export const studentStoryHref = (slug: string) => `${routes.students}?${STORY_QUERY_KEY}=${slug}`;
