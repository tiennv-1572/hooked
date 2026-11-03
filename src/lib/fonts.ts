import { Inter, Manrope } from "next/font/google";

/** Main UI font of the public site. */
export const manrope = Manrope({
  variable: "--font-manrope-face",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** Blog carousel + a few legacy desktop headings. Also the admin CMS UI font. */
export const inter = Inter({
  variable: "--font-inter-face",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

export const siteFontVariables = `${manrope.variable} ${inter.variable}`;
