import { z } from "zod";

/*
 * Reusable zod pieces for editor schemas. Messages are Vietnamese because they surface in the UI.
 */

/** Required image: `imageRefSchema("Chọn ảnh bìa.")`. */
export function imageRefSchema(message = "Chọn ảnh.") {
  return z.object(
    {
      url: z.string().min(1, message),
      alt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
    },
    { error: message },
  );
}

/** Optional image; a removed one (`null` in the form, see ImageField) is saved as undefined. */
export const optionalImageSchema = z
  .object({ url: z.string(), alt: z.string(), width: z.number().optional(), height: z.number().optional() })
  .nullish()
  .transform((image) => image ?? undefined);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Nhập đường dẫn.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.");

export const publishStatusSchema = z.enum(["draft", "published"]);

/** Internal path ("/academy") or absolute URL. */
export const hrefSchema = z
  .string()
  .trim()
  .min(1, "Nhập đường dẫn.")
  .refine(
    (value) => value.startsWith("/") || value.startsWith("#") || /^(https?:|mailto:|tel:)/.test(value),
    "Bắt đầu bằng / hoặc https://",
  );

export const linkSchema = z.object({ label: z.string().trim().min(1, "Nhập nhãn."), href: hrefSchema });

export const requiredText = (message: string) => z.string().trim().min(1, message);
