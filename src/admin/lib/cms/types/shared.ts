/** Shared CMS primitives. Every collection item extends `Entity`. */

export type ID = string;

export type Entity = {
  id: ID;
  /** ISO date-time. */
  createdAt: string;
  /** ISO date-time. */
  updatedAt: string;
};

export type PublishStatus = "draft" | "published";

/** An image stored inline in an entity (URL from the media library, or an uploaded data URL). */
export type ImageRef = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type LinkRef = { label: string; href: string };

/** Menu item for header / footer navigation. */
export type NavItem = {
  id: ID;
  label: string;
  href: string;
  visible: boolean;
  newTab?: boolean;
};

export type MediaAsset = Entity & {
  url: string;
  /** File name shown in the library. */
  name: string;
  alt: string;
  width: number;
  height: number;
  /** Bytes. */
  size: number;
  mime: string;
  /** Library folder ("photos", "projects/devoid-music-festival", "uploads"…). */
  folder: string;
  source: "seed" | "upload" | "url";
};

export type AdminRole = "owner" | "admin" | "editor";

export type AdminUser = Entity & {
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "invited" | "disabled";
  avatar?: string;
  lastActiveAt?: string;
};
