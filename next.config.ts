import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // CMS editors can paste image URLs from any HTTPS host (media library "Thêm từ URL"); uploads are served locally from /uploads.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // The site and the admin CMS are two root layouts, so unmatched URLs need app/global-not-found.tsx.
    globalNotFound: true,
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
