import { z } from "zod";

import { hrefSchema, imageRefSchema, linkSchema, optionalImageSchema, requiredText } from "@/admin/lib/cms/schemas";
import { htmlToText } from "@/lib/html-text";

/*
 * Validation of the site-content singletons (Home, About, Contact, Partners page, settings, navigation).
 * Outputs match the CMS types in src/admin/lib/cms/types/pages.ts exactly (zod strips unknown keys).
 */

const id = z.string().min(1);

/**
 * Home intro paragraph: the design sets it on 3 lines on desktop (780px, 32/40 bold uppercase) — about 115–120
 * characters. The editor preview counts the real lines; this cap stops anything clearly longer.
 */
export const INTRO_BODY_MAX = 130;

/** Ordered text lines (title lines…): trimmed, empty rows dropped, at least `min` lines. */
export const linesSchema = (message = "Nhập ít nhất 1 dòng.", min = 1) =>
  z
    .array(z.string())
    .transform((lines) => lines.map((line) => line.trim()).filter(Boolean))
    .refine((lines) => lines.length >= min, message);

/** Optional line breaks: an empty list is stored as `undefined` (the site then uses the plain title). */
const optionalLinesSchema = z
  .array(z.string())
  .optional()
  .transform((lines) => {
    const clean = (lines ?? []).map((line) => line.trim()).filter(Boolean);
    return clean.length ? clean : undefined;
  });

const optionalHrefSchema = z
  .union([z.literal(""), hrefSchema])
  .optional()
  .transform((value) => value || undefined);

// ---------------------------------------------------------------------------------------------------------
// Home

export const homeSchema = z.object({
  hero: z.object({
    slides: z
      .array(
        z.object({
          id,
          image: imageRefSchema("Chọn ảnh."),
          youtubeId: z
            .string()
            .regex(/^[\w-]{11}$/, "ID video YouTube không hợp lệ.")
            .optional(),
        }),
      )
      .min(1, "Cần ít nhất 1 ảnh hoặc video banner."),
  }),
  intro: z.object({
    titleLines: linesSchema("Nhập ít nhất 1 dòng tiêu đề."),
    body: requiredText("Nhập đoạn giới thiệu.").max(INTRO_BODY_MAX, `Tối đa ${INTRO_BODY_MAX} ký tự (3 dòng).`),
  }),
  highlights: z
    .array(
      z.object({
        id,
        title: requiredText("Nhập tiêu đề thẻ."),
        href: hrefSchema,
        align: z.enum(["start", "end"]),
        image: imageRefSchema("Chọn ảnh nền."),
      }),
    )
    .length(2, "Khối Highlight cần đúng 2 thẻ."),
  services: z
    .array(
      z.object({
        id,
        title: requiredText("Nhập tên dịch vụ."),
        titleLines: optionalLinesSchema,
        description: requiredText("Nhập mô tả ngắn."),
        href: hrefSchema,
        image: imageRefSchema("Chọn ảnh."),
      }),
    )
    .min(1, "Cần ít nhất 1 dịch vụ."),
  blogCarousel: z
    .object({
      initialIndex: z.number().int().min(0),
      items: z
        .array(
          z.object({
            id,
            title: requiredText("Nhập tiêu đề."),
            lines: z.tuple([requiredText("Nhập dòng chú thích 1."), z.string().trim()]),
            href: hrefSchema,
            image: imageRefSchema("Chọn ảnh."),
          }),
        )
        .min(1, "Cần ít nhất 1 thẻ."),
    })
    .refine((value) => value.initialIndex < value.items.length, {
      path: ["initialIndex"],
      message: "Thẻ này không còn tồn tại — chọn lại thẻ ở giữa.",
    }),
  partners: z.object({
    titleLines: linesSchema("Nhập ít nhất 1 dòng tiêu đề."),
    body: requiredText("Nhập nội dung."),
    cta: linkSchema,
  }),
});

// ---------------------------------------------------------------------------------------------------------
// About / Contact / Partners

/** An About photo block: its 4 slots, each one required. */
const photoBlockSchema = z.tuple([
  imageRefSchema("Chọn ảnh."),
  imageRefSchema("Chọn ảnh."),
  imageRefSchema("Chọn ảnh."),
  imageRefSchema("Chọn ảnh."),
]);

export const aboutSchema = z.object({
  intro: z.object({
    title: requiredText("Nhập tiêu đề trang."),
    eyebrow: z.string().trim(),
    lead: requiredText("Nhập câu mở đầu."),
    headlineLines: z.tuple([requiredText("Nhập dòng 1."), requiredText("Nhập dòng 2.")]),
    body: requiredText("Nhập đoạn nội dung."),
    aside: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined),
  }),
  ecosystem: z.object({
    titleLines: linesSchema("Nhập ít nhất 1 dòng tiêu đề."),
    statement: requiredText("Nhập câu tuyên bố."),
    body: requiredText("Nhập đoạn mô tả."),
    capabilities: z
      .array(
        z.object({
          id,
          lead: requiredText("Nhập phần in đậm."),
          // The site prints lead + rest back to back: make sure they are separated.
          rest: z.string().transform((rest) => (rest && !/^[\s.,;:!?)…-]/.test(rest) ? ` ${rest}` : rest)),
          href: optionalHrefSchema,
        }),
      )
      .min(1, "Cần ít nhất 1 năng lực."),
  }),
  portfolio: linkSchema,
  photos: z.object({ top: photoBlockSchema, bottom: photoBlockSchema }),
});

export const contactSchema = z.object({
  eyebrow: requiredText("Nhập dòng nhãn."),
  title: requiredText("Nhập tiêu đề."),
});

export const partnersPageSchema = z.object({
  title: requiredText("Nhập tiêu đề."),
  body: z.string().refine((html) => Boolean(htmlToText(html)), "Nhập nội dung."),
  collaborations: z.array(
    z.object({
      id: z.string(),
      title: requiredText("Nhập tên dự án."),
      partnerLabel: requiredText("Nhập tên đối tác."),
      href: hrefSchema,
      image: imageRefSchema("Chọn ảnh."),
    }),
  ),
});

// ---------------------------------------------------------------------------------------------------------
// Settings & navigation

export const settingsSchema = z.object({
  siteName: requiredText("Nhập tên website."),
  tagline: z.string().trim(),
  description: requiredText("Nhập mô tả website."),
  company: z.object({
    legalName: requiredText("Nhập tên pháp lý."),
    address: requiredText("Nhập địa chỉ."),
    email: z.string().trim().pipe(z.email("Email không hợp lệ.")),
    phoneDisplay: requiredText("Nhập số điện thoại."),
    phoneHref: z
      .string()
      .trim()
      .regex(/^tel:\+?\d{6,15}$/, "Dạng tel:+84966609807 (chỉ chữ số)."),
  }),
  socials: z.array(
    z.object({
      id,
      label: requiredText("Nhập tên mạng xã hội."),
      href: z
        .string()
        .trim()
        .regex(/^https?:\/\/[^\s/]+\.[^\s]+$/, "Nhập URL đầy đủ, bắt đầu bằng https://"),
    }),
  ),
  seo: z.object({
    titleTemplate: z
      .string()
      .trim()
      .min(1, "Nhập mẫu tiêu đề.")
      .refine((value) => value.includes("%s"), "Mẫu cần chứa %s — vị trí của tiêu đề từng trang."),
    defaultTitle: requiredText("Nhập tiêu đề mặc định."),
    ogImage: optionalImageSchema,
  }),
});

const navItemSchema = z.object({
  id,
  label: requiredText("Nhập nhãn."),
  href: hrefSchema,
  visible: z.boolean(),
  newTab: z.boolean().optional(),
});

export const navigationSchema = z.object({
  desktop: z.array(navItemSchema),
  mobile: z.array(navItemSchema),
  footer: z.array(navItemSchema),
});
