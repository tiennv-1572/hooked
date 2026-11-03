import type { AdminUser, MediaAsset } from "../types/shared";
import { daysAgo, stamp } from "./helpers";
import manifest from "./media-manifest.json";

export const userSeed: AdminUser[] = [
  {
    ...stamp("user-owner", 400, 0),
    name: "Hooked Admin",
    email: "admin@hooked.vn",
    role: "owner",
    status: "active",
    lastActiveAt: daysAgo(0, 9),
  },
  {
    ...stamp("user-academy", 220, 1),
    name: "Trần Minh Anh",
    email: "academy@hooked.vn",
    role: "admin",
    status: "active",
    lastActiveAt: daysAgo(1, 17, 20),
  },
  {
    ...stamp("user-content", 140, 3),
    name: "Lê Thu Hà",
    email: "content@hooked.vn",
    role: "editor",
    status: "active",
    lastActiveAt: daysAgo(3, 11, 5),
  },
  {
    ...stamp("user-intern", 6, 6),
    name: "Phạm Quốc Huy",
    email: "huy.pham@hooked.vn",
    role: "editor",
    status: "invited",
  },
];

/** Human alt text from a file name ("devoid-full-stage.jpg" → "Devoid full stage"). */
function altFromName(name: string) {
  const base = name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const mediaSeed: MediaAsset[] = manifest.map((asset, index) => ({
  ...stamp(`media-${String(index + 1).padStart(3, "0")}`, 60 - (index % 50), 60 - (index % 50)),
  url: asset.url,
  name: asset.name,
  alt: altFromName(asset.name),
  width: asset.width,
  height: asset.height,
  size: asset.size,
  mime: asset.mime,
  folder: asset.folder.replace(/^images\/?/, "") || "images",
  source: "seed",
}));
