/**
 * Project detail pages — Figma "05–09 · Projects / <project>" (one shared template, see plan/02-screens.md §05–09),
 * Video lightboxes (73 · OVERLAYS, 2363:1626) and Photo lightboxes (74 · OVERLAYS, 2384:1765).
 * Media come from LIBRARY "07 · ASSETS / Original project media" (2335:1380).
 *
 * Self-contained on purpose (the Projects overview owns `src/data/projects.ts`); shapes are CMS-friendly.
 */

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
};

export type ProjectPhoto = ProjectImage & {
  /** Figma layer name suffix: `photo-1` = "Photo / devoid-photo-1". */
  id: string;
  alt: string;
};

export type ProjectVideo = {
  /** YouTube video id. */
  id: string;
  title: string;
  /** 16:9 poster exported from Figma (also used inside the lightbox before the iframe is mounted). */
  thumbnail: ProjectImage;
  /**
   * Letterboxed posters are zoomed inside the lightbox to hide their baked black bars
   * (Figma 73 · `YouTube embed / <id>` image fill scale, e.g. 134.83% for UJvCMG7W6q8).
   */
  posterZoom?: number;
};

/** One tile of the "Mixed media / Masonry" album. */
export type MediaRef = { type: "photo"; id: string } | { type: "video"; id: string };

export type ProjectDetail = {
  slug: string;
  /** Page title / metadata ("Devoid Music Festival"). */
  name: string;
  /** H1 exactly as in Figma ("DEVOID MUSIC FESTIVAL"). */
  title: string;
  /** Orange tag line under the H1 and the "Dịch vụ cung cấp" list. */
  services: string[];
  /** "Đối tác" list — empty hides the column (Xóm Húc). */
  partners: string[];
  description: string;
  cover: {
    image: ProjectImage & { alt: string };
    /** Clicking the cover opens this photo (or video when the project has no photos — SPIN Awards). */
    opens: MediaRef;
    /** `wide`: 1192×620 desktop / 342×300 mobile crop. `poster`: 16:9 poster with the baked orange frame (Xóm Húc). */
    format: "wide" | "poster";
  };
  /** Photo lightbox order (Figma 74: the cover photo is always 01). */
  photos: ProjectPhoto[];
  videos: ProjectVideo[];
  /** Video opened by the play control on the Projects overview card; `null` → "Video đang được cập nhật." */
  featuredVideoId: string | null;
  /** Masonry column assignment — Figma places every tile by hand and the order differs per breakpoint. */
  masonry: {
    /** 3 columns ≥ 1200px. */
    desktop: MediaRef[][];
    /** 2 columns < 1200px (mobile frame; reused on tablet). */
    mobile: MediaRef[][];
  };
  /** Small link under the album: opens the photo lightbox from photo 1, or an external channel. */
  albumLink: { label: string; href?: string };
  figma: { section: string; desktop: string; mobile: string };
};

const photo = (id: string): MediaRef => ({ type: "photo", id });
const video = (id: string): MediaRef => ({ type: "video", id });

const landscape = { width: 1200, height: 800 } as const;
const portrait = { width: 800, height: 1200 } as const;
const poster = { width: 1200, height: 675 } as const;
const youtubeHd = { width: 1280, height: 720 } as const;
const youtubeSd = { width: 720, height: 404 } as const;

const albumLightbox = { label: "Xem toàn bộ album ảnh" };

const devoid: ProjectDetail = {
  slug: "devoid-music-festival",
  name: "Devoid Music Festival",
  title: "DEVOID MUSIC FESTIVAL",
  services: ["Event Production", "Artist Management", "Media", "Music Consultant", "International Artist Booking"],
  partners: [
    "NOXX",
    "Ticketmelon",
    "Not Fun Media",
    "Best EDM Beats",
    "Best EDM Drops",
    "EDless Rave",
    "Ultra Vietnam Team",
    "Uni Specs",
  ],
  description:
    "Devoid Music Festival là series sự kiện được tổ chức bởi Hooked Entertainment, nơi kết hợp giữa âm nhạc và những trang phục hóa trang đầy màu sắc cùng những câu chuyện về những vùng đất mới lạ. Phiên bản mới nhất của Devoid Music Festival - New Worlds mang đến âm nhạc từ 4 cộng đồng khác nhau, và khách mời đặc biệt - bộ đôi DJ quốc tế Matisse & Sadko.",
  cover: {
    image: {
      src: "/images/photos/devoid-music-festival.png",
      alt: "Bộ đôi Matisse & Sadko trên sân khấu Devoid Music Festival",
      ...landscape,
    },
    opens: photo("photo-1"),
    format: "wide",
  },
  photos: [
    {
      id: "photo-1",
      src: "/images/photos/devoid-music-festival.png",
      alt: "Bộ đôi Matisse & Sadko trên sân khấu Devoid Music Festival",
      ...landscape,
    },
    {
      id: "photo-2",
      src: "/images/projects/devoid-music-festival/photo-2.png",
      alt: "Đám đông dưới ánh laser xanh tại Devoid Music Festival",
      ...landscape,
    },
    {
      id: "photo-3",
      src: "/images/projects/devoid-music-festival/photo-3.png",
      alt: "Khán giả hóa trang cuồng nhiệt tại Devoid Music Festival",
      ...portrait,
    },
    {
      id: "photo-5",
      src: "/images/blog-posts/hooked-thuc-chien-san-khau.png",
      alt: "Nghệ sĩ biểu diễn giữa khói sân khấu tại Devoid Music Festival",
      ...landscape,
    },
  ],
  videos: [
    {
      id: "UJvCMG7W6q8",
      title: "DEVOID MUSIC FESTIVAL CHAPTER #3: NEW WORLD - Recap by Not Fun Media",
      thumbnail: { src: "/images/projects/devoid-music-festival/video-UJvCMG7W6q8.jpg", ...youtubeHd },
      posterZoom: 1.3483,
    },
    {
      id: "rwY_5DMDL18",
      title: "MATISSE & SADKO LIVE SET AT NOXX CITI, HANOI (28.12.2024)",
      thumbnail: { src: "/images/projects/devoid-music-festival/video-rwY_5DMDL18.jpg", ...youtubeHd },
    },
  ],
  featuredVideoId: "UJvCMG7W6q8",
  masonry: {
    desktop: [
      [photo("photo-1"), photo("photo-2"), photo("photo-5")],
      [video("UJvCMG7W6q8"), video("rwY_5DMDL18")],
      [photo("photo-3")],
    ],
    mobile: [
      [photo("photo-1"), photo("photo-3"), video("rwY_5DMDL18")],
      [video("UJvCMG7W6q8"), photo("photo-2"), photo("photo-5")],
    ],
  },
  albumLink: albumLightbox,
  figma: { section: "2846:5175", desktop: "2226:365", mobile: "2226:367" },
};

const spinAwards: ProjectDetail = {
  slug: "spin-awards",
  name: "SPIN Awards",
  title: "SPIN AWARDS",
  services: ["Media", "Event Production", "DJ Contest"],
  partners: ["WEEKND", "Jagermeister", "Mad Mask Music Academy", "Hanoi Spinning Space"],
  description:
    "Cuộc thi DJ chuyên nghiệp với quy mô toàn quốc với sự đầu tư kỹ lưỡng nhất về mặt chuyên môn, giải thưởng cùng sự hợp tác với những thương hiệu lớn: Vinaphone (mùa 1) và Jagermeister (mùa 2). Đây là bệ phóng lý tưởng cho các DJ để đến với các sân khấu lớn.",
  cover: {
    image: {
      src: "/images/photos/spin-awards.png",
      alt: "DJ biểu diễn trước bảng neon Jägermeister tại chung kết SPIN Awards",
      ...youtubeSd,
    },
    opens: video("PzwmcJ661fc"),
    format: "wide",
  },
  photos: [],
  videos: [
    {
      id: "PzwmcJ661fc",
      title: "TYNDOLCE - Team Gaztik - Chung Kết | SPIN Awards Hip-hop Edition",
      thumbnail: { src: "/images/photos/spin-awards.png", ...youtubeSd },
    },
    {
      id: "gEANpJs5vZ0",
      title: "VATUZ - Team Regus & Steji - Chung Kết | SPIN Awards Hip-hop Edition",
      thumbnail: { src: "/images/blog-posts/spin-awards-san-khau.png", ...youtubeSd },
    },
    {
      id: "PdYnmncGQOg",
      title: "JAKE RYAN - Team Gaztik - Chung Kết | SPIN Awards Hip-hop Edition",
      thumbnail: { src: "/images/projects/spin-awards/video-PdYnmncGQOg.png", ...youtubeSd },
    },
    {
      id: "ESf1PwqkLuM",
      title: "SLIME SEVEN - Team LKAZ & Luniic - Chung Kết | SPIN Awards Hip-hop Edition",
      thumbnail: { src: "/images/blog-posts/spin-awards-trinh-dien.png", ...youtubeSd },
    },
    {
      id: "I7A5KptHPgw",
      title: "RECAP VÒNG BÁN KẾT ( TOP 8 ) - SPIN AWARDS HIP-HOP EDITION",
      thumbnail: { src: "/images/projects/spin-awards/video-I7A5KptHPgw.png", ...youtubeSd },
    },
    {
      id: "-xmEKB-IR6M",
      title: "Recap Vòng Ghi Hình - SPIN Awards Hip-hop Edition",
      thumbnail: { src: "/images/projects/spin-awards/video--xmEKB-IR6M.png", ...youtubeSd },
    },
  ],
  featuredVideoId: "PzwmcJ661fc",
  masonry: {
    desktop: [
      [video("PzwmcJ661fc"), video("ESf1PwqkLuM")],
      [video("gEANpJs5vZ0"), video("I7A5KptHPgw")],
      [video("PdYnmncGQOg"), video("-xmEKB-IR6M")],
    ],
    mobile: [
      [video("PzwmcJ661fc"), video("PdYnmncGQOg"), video("I7A5KptHPgw")],
      [video("gEANpJs5vZ0"), video("ESf1PwqkLuM"), video("-xmEKB-IR6M")],
    ],
  },
  albumLink: { label: "Xem toàn bộ video SPIN Awards", href: "https://www.youtube.com/@SPINAwardsVN" },
  figma: { section: "2846:5180", desktop: "2327:1178", mobile: "2327:3840" },
};

const xomHucPhotos: ProjectPhoto[] = [
  {
    id: "photo-4",
    src: "/images/photos/xom-huc-mua-2.png",
    alt: "Poster Xóm Húc mùa 2 — đám đông khán giả cổ vũ",
    ...poster,
  },
  {
    id: "photo-1",
    src: "/images/projects/xom-huc/photo-1.png",
    alt: "Poster Xóm Húc mùa 2 — DJ biểu diễn dưới ánh đèn đỏ",
    ...poster,
  },
  {
    id: "photo-2",
    src: "/images/projects/xom-huc/photo-2.png",
    alt: "Poster Xóm Húc mùa 2 — hai thí sinh đeo kính râm",
    ...poster,
  },
  {
    id: "photo-5",
    src: "/images/projects/xom-huc/photo-5.png",
    alt: "Poster Xóm Húc mùa 2 — các DJ ăn mừng sau phần thi",
    ...poster,
  },
];

const xomHuc: ProjectDetail = {
  slug: "xom-huc",
  name: "“Xóm Húc” DJ Contest",
  title: "“XÓM HÚC” DJ CONTEST",
  services: ["Media", "Event Production", "DJ Contest"],
  partners: [],
  description:
    "Cuộc thi DJ “ao làng” với sự tham gia của các học viên của Hooked cùng với các DJ bán chuyên, bedroom DJ tại miền Bắc nhằm tìm ra các nhân tố mới cho các sự kiện âm nhạc của Hooked.",
  cover: { image: xomHucPhotos[0], opens: photo("photo-4"), format: "poster" },
  photos: xomHucPhotos,
  videos: [],
  featuredVideoId: null,
  masonry: {
    desktop: [[photo("photo-1"), photo("photo-5")], [photo("photo-4")], [photo("photo-2")]],
    mobile: [
      [photo("photo-1"), photo("photo-2")],
      [photo("photo-4"), photo("photo-5")],
    ],
  },
  albumLink: albumLightbox,
  figma: { section: "2846:5185", desktop: "2327:1264", mobile: "2327:3919" },
};

const frequencyCover = {
  src: "/images/photos/dj-crowd.jpg",
  alt: "Đám đông vây quanh bàn DJ trong đêm Frequency Arena",
  ...landscape,
};

const frequencyArena: ProjectDetail = {
  slug: "frequency-arena",
  name: "Frequency Arena Face2Face EDM Battle",
  title: "FREQUENCY ARENA FACE2FACE EDM BATTLE",
  services: ["Event Production", "Artist Management", "Media", "Music Consultant"],
  partners: ["NOXX"],
  description:
    "Frequency Arena - Face2Face EDM Battle là series sự kiện chuyên về Face2Face trong lồng sắt với concept cage fight độc đáo, nơi mỗi drop là một đòn đánh knockout chí mạng. Sự kiện nhận được sự ủng hộ mạnh mẽ trong cộng đồng.",
  // The cover photo is only reachable through the lightbox (Figma 74 has 5 Frequency frames, the album shows 4).
  cover: { image: frequencyCover, opens: photo("cover"), format: "wide" },
  photos: [
    { id: "cover", ...frequencyCover },
    {
      id: "photo-1",
      src: "/images/projects/frequency-arena/photo-1.jpg",
      alt: "Khán giả giơ tay theo nhịp drop tại Frequency Arena",
      width: 960,
      height: 1200,
    },
    {
      id: "photo-3",
      src: "/images/projects/frequency-arena/photo-3.jpg",
      alt: "Hai DJ đối đầu Face2Face giữa lồng sắt tại Frequency Arena",
      ...landscape,
    },
    {
      id: "photo-5",
      src: "/images/projects/frequency-arena/photo-5.jpg",
      alt: "Toàn cảnh sân khấu lồng sắt rực đèn tại Frequency Arena",
      ...landscape,
    },
    {
      id: "photo-6",
      src: "/images/projects/frequency-arena/photo-6.jpg",
      alt: "DJ biểu diễn dưới ánh đèn xanh tại Frequency Arena",
      ...portrait,
    },
  ],
  videos: [
    {
      id: "SOTPf9y6peo",
      title: "READY FOR ROUND 2? | Frequency Arena II",
      thumbnail: { src: "/images/projects/frequency-arena/video-SOTPf9y6peo.jpg", ...youtubeHd },
      posterZoom: 1.4286,
    },
    {
      id: "paDDzE7QfI4",
      title: "FREQ ARENA F2F NOT AFRAID x NIGHT WATCHERS (MC LIL BEE) - LIVE at @NOXXCITI",
      thumbnail: { src: "/images/projects/frequency-arena/video-paDDzE7QfI4.jpg", ...youtubeHd },
    },
    {
      id: "8nDhAC2jDsQ",
      title: "NOT AFRAID Face2Face @Freq Arena Round 2 (ft. MC Lil'Bee) 2025 | Live at @NOXXCITI",
      thumbnail: { src: "/images/projects/frequency-arena/video-8nDhAC2jDsQ.jpg", ...youtubeHd },
    },
  ],
  featuredVideoId: "SOTPf9y6peo",
  masonry: {
    desktop: [
      [photo("photo-1"), photo("photo-6")],
      [video("SOTPf9y6peo"), video("paDDzE7QfI4")],
      [photo("photo-5"), photo("photo-3"), video("8nDhAC2jDsQ")],
    ],
    mobile: [
      [photo("photo-1"), photo("photo-5"), video("paDDzE7QfI4"), video("8nDhAC2jDsQ")],
      [video("SOTPf9y6peo"), photo("photo-3"), photo("photo-6")],
    ],
  },
  albumLink: albumLightbox,
  figma: { section: "2846:5190", desktop: "2327:1350", mobile: "2327:3998" },
};

const vuiFestCover = {
  src: "/images/photos/vui-fest-cat-ba.jpg",
  alt: "Đội ngũ Hooked bên sân khấu vỏ sò tại Vui Fest Cát Bà",
  ...landscape,
};

const vuiFestCatBa: ProjectDetail = {
  slug: "vui-fest-cat-ba",
  name: "Vui Fest Cát Bà",
  title: "VUI FEST CÁT BÀ",
  services: ["Event Production", "Artist Management", "Media", "Music Consultant"],
  partners: ["Golden Sky Media - Sun Group"],
  description:
    "Đảm nhận vai trò phụ trách toàn bộ chương trình biểu diễn nghệ thuật với nhiều loại hình biểu diễn khác nhau tại VUI-Fest Cat Ba từ khảo sát, ý tưởng cho tới vận hành sự kiện, trong suốt mùa hè 2026, Hooked đã nỗ lực từng ngày để đổi lấy những khoảnh khắc rực rỡ nhất trên sân khấu, những cảm xúc ngạc nhiên và những tràng pháo tay của các du khách, và sự tin tưởng tuyệt đối của đối tác tầm cỡ Sun Group.",
  cover: { image: vuiFestCover, opens: photo("photo-4"), format: "wide" },
  photos: [
    { id: "photo-4", ...vuiFestCover },
    {
      id: "photo-1",
      src: "/images/projects/vui-fest-cat-ba/photo-1.jpg",
      alt: "Đoàn nghệ sĩ dạo phố đêm tại Vui Fest Cát Bà",
      ...landscape,
    },
    {
      id: "photo-3",
      src: "/images/projects/vui-fest-cat-ba/photo-3.jpg",
      alt: "Con phố rợp cờ hoa ban ngày tại Vui Fest Cát Bà",
      ...landscape,
    },
    {
      id: "photo-5",
      src: "/images/projects/vui-fest-cat-ba/photo-5.jpg",
      alt: "Nghệ sĩ biểu diễn với vòng ánh sáng tại Vui Fest Cát Bà",
      ...portrait,
    },
  ],
  videos: [
    {
      id: "EmbpvTQbrCs",
      title: "HOOKED @ VUI-Fest Cat Ba | RECAP VIDEO",
      thumbnail: { src: "/images/projects/vui-fest-cat-ba/video-EmbpvTQbrCs.jpg", ...youtubeHd },
      posterZoom: 1.2996,
    },
    {
      id: "iEmG7dcKxm8",
      title: 'HOOKED: "Chúng tôi muốn biến VUI FEST CÁT BÀ trở thành điểm đến đáng nhớ xuyên suốt mùa hè này"',
      thumbnail: { src: "/images/projects/vui-fest-cat-ba/video-iEmG7dcKxm8.jpg", ...youtubeHd },
      posterZoom: 1.3139,
    },
  ],
  featuredVideoId: "EmbpvTQbrCs",
  masonry: {
    desktop: [
      [photo("photo-1"), photo("photo-3")],
      [video("EmbpvTQbrCs"), photo("photo-5")],
      [photo("photo-4"), video("iEmG7dcKxm8")],
    ],
    mobile: [
      [photo("photo-1"), photo("photo-4"), photo("photo-3"), photo("photo-5")],
      [video("EmbpvTQbrCs"), video("iEmG7dcKxm8")],
    ],
  },
  albumLink: albumLightbox,
  figma: { section: "2846:5195", desktop: "2327:1436", mobile: "2327:4077" },
};

/** All five project detail pages, in the order of plan/02-screens.md (05–09). */
export const projectDetails: ProjectDetail[] = [devoid, spinAwards, xomHuc, frequencyArena, vuiFestCatBa];

export function getProjectDetail(slug: string) {
  return projectDetails.find((project) => project.slug === slug);
}

/** Every YouTube video of every project (Figma 73 · Video lightboxes: 13 ids). */
export const projectVideos: ProjectVideo[] = projectDetails.flatMap((project) => project.videos);

export function getProjectVideo(id: string) {
  return projectVideos.find((entry) => entry.id === id);
}

/** Video for the play control of a project card; `null` means the Unavailable state (Xóm Húc). */
export function getFeaturedProjectVideo(slug: string): ProjectVideo | null {
  const project = getProjectDetail(slug);
  if (!project?.featuredVideoId) return null;
  return project.videos.find((entry) => entry.id === project.featuredVideoId) ?? null;
}
