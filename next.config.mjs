/*
 * Plain JavaScript on purpose (not next.config.ts): Next compiles a TypeScript config with its native SWC binary on
 * every start, and the Linux build of SWC needs glibc 2.29 — CloudLinux 8 / AlmaLinux 8 hosting (cPanel) has 2.28, so
 * the server could not start there (it then tries to download a WASM fallback with pnpm, which the host does not have).
 * A .mjs config needs no compiler. scripts/release.sh refuses to package a next.config.ts.
 */

import { PHASE_PRODUCTION_SERVER } from "next/constants.js";

/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // CMS editors can paste image URLs from any HTTPS host (media library "Thêm từ URL"); uploads are served locally from /uploads.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Every image is served at quality 90 (the default 75 resolves to the closest allowed value): the dark, grainy
    // photography visibly softens at 75. Sources are the full-size originals from Figma, one per image for all screens.
    qualities: [90],
  },
  experimental: {
    // The site and the admin CMS are two root layouts, so unmatched URLs need app/global-not-found.tsx.
    globalNotFound: true,
    // One sharp thread per image optimisation (default: CPU cores / 2). The cPanel host (CloudLinux) counts every
    // thread as a process against the plan's limit — see server.js. Optimised images are cached on disk.
    imgOptConcurrency: 1,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    ignoreIssue: [
      {
        // The Admin guide's search highlights matches with ::highlight(fd-search) (Fumadocs). Lightning CSS does not
        // know that pseudo-element yet: it warns but keeps the rule. Only this warning, only for guide.css.
        description: /'highlight' is not recognized as a valid pseudo-element/,
        path: "**/src/app/huong-dan/guide.css",
      },
    ],
  },
};

/**
 * The Admin guide (/huong-dan) is MDX compiled by fumadocs-mdx (source.config.ts → .source/), which `createMDX` sets up
 * for `next dev` and `next build`. Not when the built app starts (server.js on the cPanel host): `createMDX` would
 * recompile source.config.ts with esbuild on every start, a file the release package does not carry, in a process
 * whose threads CloudLinux counts against the plan's limit. The built app does not need it — the pages are compiled in.
 */
export default async function config(phase) {
  if (phase === PHASE_PRODUCTION_SERVER) return nextConfig;
  const { createMDX } = await import("fumadocs-mdx/next");
  return createMDX()(nextConfig);
}
