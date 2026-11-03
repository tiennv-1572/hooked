/**
 * Static content for the Academy page and its overlays (Figma "02 · Academy" 2815:4691,
 * "70 · OVERLAYS / Registration states" 2341:1603, "71 · OVERLAYS / Course programs" 2494:3835).
 * Copy is transcribed from the Figma frames; every entity is CMS-ready (see plan/02-screens.md → "Data").
 */
import { routes } from "@/lib/site";

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const courseIds = [
  "dj-co-ban",
  "dj-toan-dien",
  "mc-co-ban",
  "mc-toan-dien",
  "producer-hiphop-rnb-ballad",
  "producer-edm",
  "flip",
] as const;

export type CourseId = (typeof courseIds)[number];

export type CourseCategory = "DJ" | "MC" | "Producer" | "Flip";

/** A line of course facts: plain text, or a bold label followed by ": value". */
export type InfoLine = string | { label: string; value: string };

export type Course = {
  id: CourseId;
  /** Upper-case title used by the carousel, overlays and mobile directory ("DJ CƠ BẢN"). */
  title: string;
  /** Desktop editorial index title ("DJ cơ bản", "Producer / HipHop · R&B · Ballad"). */
  indexTitle: string;
  /** Label above the desktop carousel side previews ("DJ Toàn diện"). */
  previewTitle: string;
  category: CourseCategory;
  description: string;
  /** "Giảng viên chính: Marcuz", "Trợ giảng: J.Grayson". */
  instructors: { label: string; value: string }[];
  /** Lộ trình — "Từ 2 đến 3 tháng". */
  duration: string;
  /** Giờ học lines — "Sáng: 9h - 12h / Chiều: 13h - 18h", { Thời lượng: 1 tiếng/ca }. */
  schedule: InfoLine[];
  /** Học phí. */
  tuition: string;
  modules: string[];
  benefits: string[];
  image: Photo;
  /**
   * Desktop card + side preview show only the top-left of the photo (Figma 156.25% crop),
   * which hides the "HOOKED ACADEMY" lockup baked into the producer artwork.
   */
  zoomTopLeft?: boolean;
};

const images = {
  dj: {
    src: "/images/photos/stage-lights.png",
    alt: "DJ biểu diễn trên sân khấu giữa ánh đèn và đám đông",
    width: 2550,
    height: 1440,
  },
  mc: {
    src: "/images/academy/course-mc.png",
    alt: "MC hype khuấy động đám đông trong một đêm diễn của Hooked",
    width: 2550,
    height: 1440,
  },
  producer: {
    src: "/images/academy/course-producer.png",
    alt: "Học viên sản xuất âm nhạc trên phần mềm DAW tại Hooked Academy",
    width: 474,
    height: 388,
  },
} satisfies Record<string, Photo>;

const djDescription =
  "Khoá học dành cho những bạn muốn học DJ để thỏa mãn đam mê, giải trí hoặc tự tin chơi nhạc trong các buổi tiệc, sự kiện cùng bạn bè. Lộ trình tập trung xây dựng nền tảng vững chắc và giúp bạn có thể tự tin mix những set nhạc yêu thích.";

const djSchedule: InfoLine[] = ["Sáng: 9h - 12h / Chiều: 13h - 18h", { label: "Thời lượng", value: "1 tiếng/ca" }];
const mcSchedule: InfoLine[] = ["Chiều: 18h - 20h30", "Từ thứ 3 đến Chủ nhật"];
const flexibleSchedule = (length: string): InfoLine[] => [
  { label: "Thời lượng", value: length },
  "Linh động theo lịch của học viên",
];

export const courses: Course[] = [
  {
    id: "dj-co-ban",
    title: "DJ CƠ BẢN",
    indexTitle: "DJ cơ bản",
    previewTitle: "DJ Cơ bản",
    category: "DJ",
    description: djDescription,
    instructors: [
      { label: "Giảng viên chính", value: "Marcuz" },
      { label: "Trợ giảng", value: "J.Grayson" },
    ],
    duration: "Từ 2 đến 3 tháng",
    schedule: djSchedule,
    tuition: "15.000.000 VND",
    modules: ["Lý thuyết cơ bản", "Sử dụng phần mềm", "Setup thiết bị", "Cue/Tempo/Loop cơ bản", "Mixing cơ bản"],
    benefits: ["Học 1:1 cùng với giảng viên", "Cung cấp data nhạc học tập", "Tham gia sự kiện & workshop chuyên môn"],
    image: images.dj,
  },
  {
    id: "dj-toan-dien",
    title: "DJ TOÀN DIỆN",
    indexTitle: "DJ toàn diện",
    previewTitle: "DJ Toàn diện",
    category: "DJ",
    // Same copy as DJ CƠ BẢN in Figma (flagged in plan/03 §2 — awaiting confirmation).
    description: djDescription,
    instructors: [
      { label: "Giảng viên chính", value: "Marcuz" },
      { label: "Trợ giảng", value: "J.Grayson" },
    ],
    duration: "Từ 4 đến 6 tháng",
    schedule: djSchedule,
    tuition: "28.000.000 VND",
    modules: [
      "Lý thuyết cơ bản",
      "Sử dụng phần mềm",
      "Setup thiết bị",
      "Cue/Tempo/Loop cơ bản",
      "Mixing cơ bản & nâng cao",
      "Mashup/Edit (đặc quyền khóa DJ toàn diện).",
    ],
    benefits: [
      "Học 1:1 cùng với giảng viên",
      "Cung cấp data nhạc học tập",
      "Miễn phí mashup/edit cơ bản",
      "Cấp chứng chỉ chính thức tại Hooked",
      "Tham gia sự kiện & workshop chuyên môn",
      "Hỗ trợ thực tập",
    ],
    image: images.dj,
  },
  {
    id: "mc-co-ban",
    title: "MC CƠ BẢN",
    indexTitle: "MC cơ bản",
    previewTitle: "MC Cơ bản",
    category: "MC",
    description:
      "Khoá học dành cho những bạn muốn học MC để rèn luyện kỹ năng giao tiếp, tự tin trước đám đông và thỏa mãn đam mê. Tập trung xây dựng nền tảng về giọng nói, phong thái và kỹ năng dẫn dắt, giúp bạn tự tin trong các hoạt động cá nhân hoặc sự kiện nhỏ.",
    instructors: [
      { label: "Giảng viên chính", value: "Lil'Bee" },
      { label: "Trợ giảng", value: "Mambo" },
    ],
    duration: "Từ 1 đến 2 tháng",
    schedule: mcSchedule,
    tuition: "15.000.000 VND",
    modules: [
      "Tổng quan nghề MC Hype",
      "Cấu trúc bài nhạc",
      "Đếm nhịp bắt khuôn",
      "Luyện hơi",
      "Tìm hiểu hype up với nhiều thể loại nhạc",
      "Học diễn xuất trước ông kính",
      "Phong cách trình diễn trên sân khấu",
    ],
    benefits: ["Tham gia sự kiện & workshop chuyên môn"],
    image: images.mc,
  },
  {
    id: "mc-toan-dien",
    title: "MC TOÀN DIỆN",
    indexTitle: "MC toàn diện",
    previewTitle: "MC Toàn diện",
    category: "MC",
    description:
      "Dành cho những bạn mong muốn theo đuổi nghề MC chuyên nghiệp, với lộ trình đào tạo toàn diện từ kỹ năng dẫn chương trình, làm chủ sân khấu đến định hướng phát triển sự nghiệp và trải nghiệm môi trường làm việc thực tế.",
    instructors: [
      { label: "Giảng viên chính", value: "Lil'Bee" },
      { label: "Trợ giảng", value: "Mambo" },
    ],
    duration: "Từ 3 đến 6 tháng",
    schedule: mcSchedule,
    tuition: "28.000.000 VND",
    modules: [
      "Tổng quan nghề MC Hype",
      "Nhạc lý cơ bản",
      "Sử dụng giọng nói cho MC",
      "Phong thái & hình thể biểu diễn",
      "Thực hành hoạt náo & xử lý tình huống",
      "Các nhánh MC khác (MC sự kiện, MC hype chuyên nghiệp....).",
    ],
    benefits: ["Cấp chứng chỉ chính thức Hooked", "Tham gia sự kiện & workshop chuyên môn", "Hỗ trợ thực tập"],
    image: images.mc,
  },
  {
    id: "producer-hiphop-rnb-ballad",
    title: "PRODUCER (HIPHOP / R&B / BALLAD)",
    indexTitle: "Producer / HipHop · R&B · Ballad",
    previewTitle: "Producer HipHop / R&B / Ballad",
    category: "Producer",
    description:
      "Khóa học Producer dành cho những bạn yêu thích sáng tác và sản xuất âm nhạc theo các dòng Hip Hop, R&B và Ballad. Chương trình giúp bạn xây dựng nền tảng từ tư duy làm nhạc, phối khí đến hoàn thiện một sản phẩm âm nhạc mang dấu ấn cá nhân.",
    instructors: [{ label: "Giảng viên chính", value: "FLOWZ" }],
    duration: "Tối thiểu 3 tháng",
    schedule: flexibleSchedule("2h/ca"),
    tuition: "35.000.000 VND",
    modules: [
      "Giới thiệu & Làm quen với Ableton Live",
      "Tạo Beat & Drum",
      "Nhạc lý & Hòa âm",
      "Nhạc cụ & Sample",
      "Warping & Remix",
      "Plugin & Sound Design",
      "Cấu trúc & Phát triển bài nhạc",
      "Thu âm (Recording)",
      "Mixing",
      "Mastering",
      "Định hướng nghề nghiệp",
    ],
    benefits: [
      "Học 1:1 cùng với giảng viên Flowz",
      "Hỗ trợ cài đặt phần mềm, Plugin và Sample.",
      "Tự tin sản xuất Beat đa thể loại.",
      "Tặng kho Sample Pack & Preset trong suốt khóa học.",
    ],
    image: images.producer,
    zoomTopLeft: true,
  },
  {
    id: "producer-edm",
    title: "PRODUCER (EDM)",
    indexTitle: "Producer / EDM",
    previewTitle: "Producer EDM",
    category: "Producer",
    description:
      "Khóa học Producer dành cho những bạn yêu thích sáng tác, sản xuất âm nhạc theo các dòng EDM. Chương trình giúp bạn xây dựng nền tảng từ tư duy làm nhạc, phối khí đến hoàn thiện một sản phẩm âm nhạc mang dấu ấn cá nhân.",
    instructors: [{ label: "Giảng viên chính", value: "MINDFREAK" }],
    duration: "Tối thiểu 3 tháng",
    schedule: flexibleSchedule("2h/ca, 3 buổi/tuần"),
    tuition: "35.000.000 VND",
    modules: [
      "Giới thiệu & Làm quen với Ableton Live",
      "Make Beat & Xây dựng cấu trúc bài nhạc",
      "Nhạc lý & Hòa âm",
      "MIDI, VST & Hoàn thiện bài nhạc",
      "Sound Design",
      "Mixing & Mastering",
      "Hoàn thiện sản phẩm cuối khóa",
    ],
    benefits: [
      "Học 1:1 cùng với giảng viên MindFreak",
      "Hỗ trợ cài đặt phần mềm, plugin và thư viện âm thanh.",
      "Tự tin sản xuất Beat với nhiều thể loại âm nhạc.",
      "Tặng kho Sample Pack và Preset sử dụng trong suốt khóa học.",
    ],
    image: images.producer,
    zoomTopLeft: true,
  },
  {
    id: "flip",
    title: "FLIP",
    indexTitle: "Flip",
    previewTitle: "Flip",
    category: "Flip",
    description:
      "Khoá học dành cho những bạn mong muốn học cách biến những bản nhạc yêu thích thành phiên bản mang đậm dấu ấn cá nhân, phát triển tư duy sáng tạo và kỹ năng Flip theo phong cách riêng.",
    instructors: [{ label: "Giảng viên chính", value: "MINDFREAK" }],
    duration: "Tối thiểu 2 tháng",
    schedule: flexibleSchedule("2h/ca, 3 buổi/tuần"),
    tuition: "12.000.000 VND",
    modules: [
      "Làm quen với DAW (Ableton Live/FL Studio)",
      "Drum Beat & Phân tích bài nhạc",
      "Nhạc lý ứng dụng",
      "Flip & Hoàn thiện bài nhạc",
      "Giới thiệu Mixing & Mastering",
    ],
    benefits: [
      "Học 1:1 cùng với giảng viên MindFreak",
      "Tips & Tricks thực chiến từ Mentor.",
      "Phát triển tư duy sản xuất âm nhạc.",
      "Tặng kho Sample Pack & hỗ trợ cài đặt VST.",
      "Hỗ trợ sửa bài sau khóa học.",
      "Cơ hội phát hành sản phẩm trên Hooked Label.",
    ],
    image: images.producer,
    zoomTopLeft: true,
  },
];

export const defaultCourseId: CourseId = "dj-co-ban";

export function getCourse(id: CourseId | undefined): Course {
  return courses.find((course) => course.id === id) ?? courses[0];
}

/** Directory filter chips (Figma "Directory / Filters" 2469:3821, mobile 2822:4850). */
export const courseFilters = ["Tất cả", "DJ", "MC", "Producer", "Flip"] as const;
export type CourseFilter = (typeof courseFilters)[number];

/** Featured students on the Academy story carousel (Figma 2082:376, Slide=1..3). */
export type FeaturedStudent = {
  /** Matches the Student Stories reader: `/academy/students?story=<slug>`. */
  slug: string;
  name: string;
  role: string;
  headline: string;
  portrait: Photo;
};

/** Opens the Student reader on the Student Stories page: `/academy/students?story=jgrayson`. */
export const storyHref = (slug: string) => `${routes.students}?story=${encodeURIComponent(slug)}`;

export const featuredStudents: FeaturedStudent[] = [
  {
    slug: "jgrayson",
    name: "JGRAYSON",
    role: "DJ · Hooked Academy",
    headline: "J Grayson bứt phá mạnh mẽ với thành tích 2 lần lọt vào chung kết cuộc thi Xóm Húc.",
    portrait: {
      src: "/images/students/jgrayson.jpg",
      alt: "Chân dung DJ JGRAYSON đeo kính râm và áo khoác da",
      width: 1067,
      height: 1600,
    },
  },
  {
    slug: "vatuz",
    name: "Vatuz",
    role: "DJ · Hooked Academy",
    headline: "Top 3 Xóm Húc 2024 và Á quân Spin Awards HipHop Edition 2025.",
    portrait: {
      src: "/images/students/vatuz.jpg",
      alt: "Chân dung DJ Vatuz đeo kính râm và áo len trắng",
      width: 1067,
      height: 1600,
    },
  },
  {
    slug: "kimmy",
    name: "KIMMY",
    role: "DJ · Hooked Academy",
    headline: "Cô ghi dấu ấn mạnh mẽ với phong cách biến hóa đa dạng từ Afro House, Melodic Techno đến EDM sôi động.",
    portrait: {
      src: "/images/students/kimmy.jpg",
      alt: "DJ KIMMY hòa mình cùng khán giả trong một đêm diễn",
      width: 1067,
      height: 1600,
    },
  },
];
