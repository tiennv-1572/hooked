import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;
