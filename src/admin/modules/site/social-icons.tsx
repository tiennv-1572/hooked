import { AtSign, Globe, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
 * Recognisable platform glyphs for the social links editor. lucide-react v1 ships no brand icons,
 * so these are small hand-drawn 24×24 glyphs in `currentColor`.
 */

export type SocialPlatform = {
  key: string;
  name: string;
  /** Brand colour of the icon tile. */
  color: string;
  /** Domains matched against the URL host. */
  domains: string[];
  /** Placeholder profile URL. */
  example: string;
  glyph: ReactNode;
};

const svg = (children: ReactNode, props: { fill?: boolean } = {}) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    fill={props.fill === false ? "none" : "currentColor"}
    stroke={props.fill === false ? "currentColor" : undefined}
    strokeWidth={props.fill === false ? 2 : undefined}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-full"
  >
    {children}
  </svg>
);

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    key: "facebook",
    name: "Facebook",
    color: "#1877F2",
    domains: ["facebook.com", "fb.com", "fb.me"],
    example: "https://www.facebook.com/hookedvn",
    glyph: svg(
      <path d="M14 8h2.5V4.5H14c-2.2 0-4 1.8-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.5c0-.3.2-.5.5-.5Z" />,
    ),
  },
  {
    key: "instagram",
    name: "Instagram",
    color: "#E4405F",
    domains: ["instagram.com", "instagr.am"],
    example: "https://www.instagram.com/hooked.vn/",
    glyph: svg(
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
      </>,
      { fill: false },
    ),
  },
  {
    key: "youtube",
    name: "YouTube",
    color: "#FF0000",
    domains: ["youtube.com", "youtu.be"],
    example: "https://www.youtube.com/@hookedvn",
    glyph: svg(
      <path
        fillRule="evenodd"
        d="M6.5 5h11A4.5 4.5 0 0 1 22 9.5v5a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 14.5v-5A4.5 4.5 0 0 1 6.5 5ZM10 8.8v6.4l5.4-3.2L10 8.8Z"
      />,
    ),
  },
  {
    key: "tiktok",
    name: "TikTok",
    color: "#111111",
    domains: ["tiktok.com"],
    example: "https://www.tiktok.com/@hookedvn",
    glyph: svg(
      <path d="M16.2 3c.3 2.2 1.7 3.7 3.8 4v3.1c-1.4 0-2.8-.4-3.9-1.2v6a5.9 5.9 0 1 1-5.9-5.9h.4v3.2h-.4a2.7 2.7 0 1 0 2.7 2.7V3h3.3Z" />,
    ),
  },
  {
    key: "x",
    name: "X (Twitter)",
    color: "#111111",
    domains: ["x.com", "twitter.com"],
    example: "https://x.com/hookedvn",
    glyph: svg(
      <>
        <path d="M4 4h4.6l11.4 16h-4.6L4 4Z" />
        <path d="M19.4 4 4.6 20" stroke="currentColor" strokeWidth="1.8" />
      </>,
    ),
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    domains: ["linkedin.com"],
    example: "https://www.linkedin.com/company/hooked",
    glyph: svg(
      <>
        <circle cx="6" cy="5.8" r="2" />
        <rect x="4.2" y="9" width="3.6" height="11" rx="0.5" />
        <path d="M10 9h3.5v1.6c.6-1 1.8-1.9 3.6-1.9 3 0 3.9 2 3.9 4.8V20h-3.6v-5.8c0-1.4-.2-2.8-1.9-2.8s-2 1.3-2 2.8V20H10V9Z" />
      </>,
    ),
  },
  {
    key: "spotify",
    name: "Spotify",
    color: "#1DB954",
    domains: ["spotify.com"],
    example: "https://open.spotify.com/artist/…",
    glyph: svg(
      <>
        <circle cx="12" cy="12" r="9.2" />
        <path d="M7 9.6c3.4-1 7-.7 10 1M7.6 12.8c2.9-.8 5.7-.5 8.2.9M8.2 15.8c2.3-.6 4.4-.4 6.3.7" />
      </>,
      { fill: false },
    ),
  },
  {
    key: "soundcloud",
    name: "SoundCloud",
    color: "#FF5500",
    domains: ["soundcloud.com"],
    example: "https://soundcloud.com/hookedvn",
    glyph: svg(
      <>
        <path d="M10.5 18V9.4A5.5 5.5 0 0 1 20.6 12 3 3 0 0 1 20 18h-9.5Z" />
        <rect x="2.2" y="13" width="1.5" height="5" rx="0.75" />
        <rect x="5" y="11" width="1.5" height="7" rx="0.75" />
        <rect x="7.8" y="9.5" width="1.5" height="8.5" rx="0.75" />
      </>,
    ),
  },
  {
    key: "threads",
    name: "Threads",
    color: "#111111",
    domains: ["threads.net", "threads.com"],
    example: "https://www.threads.net/@hooked.vn",
    glyph: <AtSign className="size-full" strokeWidth={2.2} />,
  },
  {
    key: "zalo",
    name: "Zalo",
    color: "#0068FF",
    domains: ["zalo.me", "zaloapp.com"],
    example: "https://zalo.me/…",
    glyph: <MessageCircle className="size-full" strokeWidth={2.2} />,
  },
];

/** Platform of a social link, from its URL host (or its label as a fallback). */
export function detectPlatform(href: string | undefined, label?: string): SocialPlatform | undefined {
  let host = "";
  try {
    host = href ? new URL(href).host.toLowerCase().replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (host) {
    const byHost = SOCIAL_PLATFORMS.find((platform) =>
      platform.domains.some((domain) => host === domain || host.endsWith(`.${domain}`)),
    );
    if (byHost) return byHost;
  }
  const name = label?.trim().toLowerCase();
  if (!name) return undefined;
  return SOCIAL_PLATFORMS.find((platform) => platform.key === name || platform.name.toLowerCase() === name);
}

/**
 * Platform icon: a brand-coloured tile with a white glyph (default) or the bare glyph in `currentColor` (`mono`).
 * Unknown platforms get a globe.
 */
export function SocialIcon({
  href,
  label,
  mono = false,
  className,
}: {
  href?: string;
  label?: string;
  mono?: boolean;
  className?: string;
}) {
  const platform = detectPlatform(href, label);
  if (mono) {
    return (
      <span className={cn("inline-flex size-4 shrink-0", className)}>
        {platform?.glyph ?? <Globe className="size-full" />}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg p-[7px] text-white ring-1 ring-black/5 dark:ring-white/10",
        !platform && "text-muted-foreground bg-muted",
        className,
      )}
      style={platform ? { backgroundColor: platform.color } : undefined}
      title={platform?.name ?? "Liên kết"}
    >
      {platform?.glyph ?? <Globe className="size-full" />}
    </span>
  );
}
