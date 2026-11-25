import type { MetadataRoute } from "next";

import { getSite } from "@/server/content/queries";

/**
 * Web app manifest (/manifest.webmanifest): name and icons when the site is added to a home screen (Android, desktop
 * Chrome/Edge). The favicon set itself lives next to this file: favicon.ico (16/32/48), icon.svg, apple-icon.png.
 * The maskable icon sits on the site's ink with the rings inside the 80% safe zone, so launchers can crop it to any
 * shape.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSite();
  return {
    name: site.name,
    short_name: "Hooked",
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#050101",
    theme_color: "#050101",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
