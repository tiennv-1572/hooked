import { cva, type VariantProps } from "class-variance-authority";

/**
 * Academy flow buttons used inside the Registration and Course program overlays
 * (Figma 82 · INTERNAL / Registration state controls 2494:4748, `Academy / Flow Button / *`).
 * - `primary`: orange #FF750A, hover #FF923D ("Gửi đăng ký tư vấn", "Đăng ký tư vấn", "Tiếp tục khám phá Academy").
 * - `secondary`: dark outline, hover warm fill + orange border/label ("×", "Đóng ×", the 7 course choices).
 */
export const flowButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-inter text-[15px] leading-6 font-medium transition-colors duration-150 select-none",
  {
    variants: {
      tone: {
        primary: "h-13 bg-[#ff750a] px-6 text-[#160c05] hover:bg-[#ff923d] aria-disabled:cursor-wait",
        secondary:
          "h-13 border border-[#49382d] bg-[#19130f] px-4 text-ivory hover:border-[#ff750a] hover:bg-[#302116] hover:text-[#ff750a]",
      },
    },
    defaultVariants: { tone: "primary" },
  },
);

export type FlowButtonVariantProps = VariantProps<typeof flowButtonVariants>;

/** Dark translucent backdrop drawn behind every Academy overlay ("Registration / Dismiss backdrop"). */
export const academyOverlayBackdrop = "bg-[#120d0b]/[0.98]";
