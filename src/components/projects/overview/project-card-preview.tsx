"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import { preconnect } from "react-dom";

import type { ProjectPreview } from "@/components/projects/project-content";
import type { Photo } from "@/data/home";
import { cn } from "@/lib/utils";

/*
 * Hover previews of the /projects cards: the project's video plays (muted), or — without a video — its album turns
 * into a slideshow. Only where there is a mouse, motion is welcome and the visitor has not asked to save data; touch
 * screens and reduced motion keep the static card. Keyboard focus inside a card plays it too.
 */

/** Hover this long before a card plays (a pointer sweeping across the grid starts nothing). */
const INTENT_MS = 150;
/** Fade of the preview layer, in and out. */
const FADE_MS = 500;

const CAPABLE = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeCapable(notify: () => void) {
  const query = window.matchMedia(CAPABLE);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

const capable = () =>
  window.matchMedia(CAPABLE).matches &&
  !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

// The first mouse movement on the page: from then on, cards on (or near) the screen get their preview ready.
let mouseSeen = false;
const mouseListeners = new Set<() => void>();

function onFirstMouse(event: globalThis.PointerEvent) {
  if (event.pointerType !== "mouse") return;
  mouseSeen = true;
  window.removeEventListener("pointermove", onFirstMouse);
  mouseListeners.forEach((notify) => notify());
}

function subscribeMouse(notify: () => void) {
  if (mouseSeen) return () => {};
  mouseListeners.add(notify);
  window.addEventListener("pointermove", onFirstMouse, { passive: true });
  return () => {
    mouseListeners.delete(notify);
    if (!mouseListeners.size) window.removeEventListener("pointermove", onFirstMouse);
  };
}

/** True while the element intersects the viewport grown by `margin` (an IntersectionObserver `rootMargin`). */
function useInView(ref: RefObject<Element | null>, enabled: boolean, margin: string) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled, margin]);
  return enabled && inView;
}

/**
 * Card-level trigger: `active` after `INTENT_MS` of mouse hover, or while keyboard focus (`:focus-visible`) is inside.
 * Spread `handlers` on the card.
 */
export function usePreviewTrigger() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    active: hovered || focused,
    handlers: {
      onPointerEnter(event: PointerEvent<HTMLElement>) {
        if (event.pointerType !== "mouse") return;
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setHovered(true), INTENT_MS);
      },
      onPointerLeave() {
        window.clearTimeout(timer.current);
        setHovered(false);
      },
      onFocus(event: FocusEvent<HTMLElement>) {
        if ((event.target as Element).matches(":focus-visible")) setFocused(true);
      },
      onBlur(event: FocusEvent<HTMLElement>) {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      },
    },
  };
}

/** Video preview, as the card's play control shows it: ▶, a spinner while loading, hidden while the video plays. */
export type PreviewStatus = "idle" | "loading" | "playing";

/**
 * The preview layer, inside the card's media box (above the poster, below the outline and play control). Decorative:
 * hidden from assistive technology and out of the tab order — the play control opens the real video.
 */
export function ProjectCardPreview({
  preview,
  active,
  sizes,
  onStatusChange,
}: {
  preview: ProjectPreview;
  active: boolean;
  /** The poster's `sizes`: album photos fill the same box. */
  sizes: string;
  /** Video previews: whether the video is loading or playing (album previews never report). */
  onStatusChange?: (status: PreviewStatus) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeCapable, capable, () => false);
  const mouse = useSyncExternalStore(
    subscribeMouse,
    () => mouseSeen,
    () => false,
  );
  // Warm = get ready before the hover. A video player buffers several MB, so only cards on screen warm one (and drop
  // it when they leave); album cards just fetch their first two photos, from half a screen ahead.
  const video = preview.type === "video";
  const warm = useInView(box, enabled && mouse, video ? "0px" : "50% 0px");
  const on = enabled && active;

  // Open the connection to YouTube up front: the first player starts a little sooner.
  useEffect(() => {
    if (enabled && video) preconnect(YOUTUBE);
  }, [enabled, video]);

  return (
    <div ref={box} aria-hidden inert className="pointer-events-none absolute inset-0">
      {preview.type === "video" ? (
        <VideoPreview
          youtubeId={preview.youtubeId}
          zoom={preview.zoom}
          active={on}
          warm={warm}
          onStatusChange={onStatusChange}
        />
      ) : (
        <AlbumPreview photos={preview.photos} sizes={sizes} active={on} warm={warm} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Video

const YOUTUBE = "https://www.youtube-nocookie.com";
/** YouTube player states (IFrame API). */
const PLAYING = 1;
const BUFFERING = 3;
/**
 * YouTube draws its title bar, controls and logo over the video for ~3.5s every time playback starts (`controls=0`
 * included); the preview stays hidden until they have faded — measured 3.5–4.2s after the player reports playing.
 */
const CHROME_MS = 4600;
/** While warm (on screen, not hovered) the player idles small and in slow motion, so it buffers slowly. */
const IDLE_RATE = 0.25;
const IDLE_SIZE = "25%";
/** Stop the loading spinner when YouTube never answers (blocked, offline): the poster just stays. */
const GIVE_UP_MS = 15000;

const embedUrl = (id: string) => {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
    cc_load_policy: "0",
    loop: "1",
    playlist: id,
    playsinline: "1",
    rel: "0",
    enablejsapi: "1",
    origin: window.location.origin,
  });
  return `${YOUTUBE}/embed/${encodeURIComponent(id)}?${params}`;
};

function command(frame: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  frame?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args, id: 1, channel: "widget" }),
    YOUTUBE,
  );
}

/**
 * Muted YouTube embed driven through the IFrame API's postMessage protocol (no API script).
 *
 * YouTube shows its chrome whenever playback starts or resumes, and seeking shows it too; a playback-rate change or a
 * resize does not. So a card on screen (once the visitor has used the mouse) loads its player early and lets it run
 * hidden — small and at quarter speed, so it buffers slowly. Hovering switches it to full size (zoomed by `zoom`) and
 * normal speed and fades it in at once, by then free of chrome; YouTube moves up to a sharp quality within a moment.
 * A hover before the player is ready (~6s after it starts loading) waits for it; `onStatusChange` reports it.
 * Captions, which muted autoplay switches on, are unloaded. Leaving the screen unmounts the player (stops the stream).
 */
function VideoPreview({
  youtubeId,
  zoom,
  active,
  warm,
  onStatusChange,
}: {
  youtubeId: string;
  zoom: number;
  active: boolean;
  warm: boolean;
  onStatusChange?: (status: PreviewStatus) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const activeRef = useRef(active);
  const stateRef = useRef(-1);
  const [clean, setClean] = useState(false);
  // Full size from the hover until the fade-out has finished.
  const [large, setLarge] = useState(false);
  if (active && !large) setLarge(true);
  const mounted = warm || active;
  const status: PreviewStatus = !active ? "idle" : clean ? "playing" : "loading";

  useEffect(() => {
    if (active) return;
    const timer = window.setTimeout(() => setLarge(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  useEffect(() => {
    onStatusChange?.(status);
    if (status !== "loading") return;
    const timer = window.setTimeout(() => onStatusChange?.("idle"), GIVE_UP_MS);
    return () => window.clearTimeout(timer);
  }, [status, onStatusChange]);

  // Player protocol: handshake, state tracking, captions off, the chrome timer.
  useEffect(() => {
    const iframe = frame.current;
    if (!mounted || !iframe) return;
    let heard = false;
    let started = false;
    let handshake = 0;
    let chrome = 0;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || event.origin !== YOUTUBE || typeof event.data !== "string") return;
      let data: { event?: string; info?: unknown };
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      heard = true;
      const state =
        data.event === "onStateChange"
          ? data.info
          : data.event === "infoDelivery"
            ? (data.info as { playerState?: unknown } | null)?.playerState
            : undefined;
      if (typeof state !== "number" || state === stateRef.current) return;
      stateRef.current = state;
      if (state === PLAYING) {
        command(iframe, "unloadModule", ["captions"]);
        command(iframe, "unloadModule", ["cc"]);
        command(iframe, "setPlaybackRate", [activeRef.current ? 1 : IDLE_RATE]);
        // A fresh start (not the end of a buffering stall) brings the chrome back.
        if (!started) {
          started = true;
          window.clearTimeout(chrome);
          chrome = window.setTimeout(() => setClean(true), CHROME_MS);
        }
      } else if (state !== BUFFERING) {
        started = false;
        window.clearTimeout(chrome);
        setClean(false);
      }
    };

    const listen = () =>
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), YOUTUBE);
    const onLoad = () => {
      let tries = 0;
      window.clearInterval(handshake);
      listen();
      handshake = window.setInterval(() => {
        if (heard || ++tries > 40) window.clearInterval(handshake);
        else listen();
      }, 250);
    };

    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("message", onMessage);
      iframe.removeEventListener("load", onLoad);
      window.clearInterval(handshake);
      window.clearTimeout(chrome);
      stateRef.current = -1;
      setClean(false);
    };
  }, [mounted]);

  // Hover: normal speed (and play again if the browser or the end of the video stopped it); away: idle speed.
  useEffect(() => {
    activeRef.current = active;
    const iframe = frame.current;
    if (!iframe) return;
    command(iframe, "setPlaybackRate", [active ? 1 : IDLE_RATE]);
    if (active && stateRef.current !== PLAYING && stateRef.current !== BUFFERING) command(iframe, "playVideo");
  }, [active, mounted]);

  if (!mounted) return null;
  const size = large ? `${zoom * 100}%` : IDLE_SIZE;
  const offset = large ? `${50 - zoom * 50}%` : "0";
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden bg-black transition-opacity duration-500 ease-out",
        status === "playing" ? "opacity-100" : "opacity-0",
      )}
    >
      <iframe
        ref={frame}
        src={embedUrl(youtubeId)}
        title="Video xem trước"
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        referrerPolicy="strict-origin-when-cross-origin"
        className="pointer-events-none absolute border-0"
        style={{ width: size, height: size, left: offset, top: offset }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Album

/** How long each photo stays (after it has faded in). */
const SLIDE_MS = 1600;

/**
 * Album slideshow: the photos cross-fade in turn (each new one over the last, settling from a slight zoom), with a
 * thin progress bar per photo. Photos load one ahead of the one shown; the first two are fetched as soon as the card
 * is warm, so the slideshow starts the moment the hover does. Leaving fades it out and rewinds to the first photo.
 */
function AlbumPreview({
  photos,
  sizes,
  active,
  warm,
}: {
  photos: Photo[];
  sizes: string;
  active: boolean;
  warm: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [reach, setReach] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  const count = photos.length;
  const next = (index + 1) % count;
  const ready = loaded.has(index);
  const nextReady = loaded.has(next);
  if ((warm || active) && reach < 1) setReach(1);

  useEffect(() => {
    if (!active || count < 2 || !ready || !nextReady) return;
    const timer = window.setTimeout(() => {
      setPrevious(index);
      setIndex(next);
      setReach((value) => Math.max(value, next + 1));
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, count, index, next, ready, nextReady]);

  useEffect(() => {
    if (active) return;
    const timer = window.setTimeout(() => {
      setIndex(0);
      setPrevious(null);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [active]);

  // Mounted: everything shown so far plus the one after it.
  const mountedCount = reach ? Math.min(count, reach + 1) : 0;
  if (!mountedCount) return null;
  const showing = active && ready;

  return (
    <div
      className={cn(
        "absolute inset-0 bg-black transition-opacity duration-500 ease-out",
        showing ? "opacity-100" : "opacity-0",
      )}
    >
      {photos.slice(0, mountedCount).map((photo, position) => {
        const current = position === index;
        const below = position === previous;
        return (
          <Image
            key={`${position}-${photo.src}`}
            src={photo.src}
            alt=""
            fill
            sizes={sizes}
            loading="eager"
            draggable={false}
            onLoad={() => setLoaded((set) => new Set(set).add(position))}
            className={cn(
              "object-cover select-none",
              current || below
                ? "[transition:opacity_700ms_ease-out,transform_2400ms_cubic-bezier(0.22,1,0.36,1)]"
                : "opacity-0",
              current && "z-[2] opacity-100",
              below && "z-[1] opacity-100",
              current || below ? "scale-100" : "scale-[1.06]",
            )}
          />
        );
      })}
      {count > 1 ? (
        <div className="absolute inset-x-4 bottom-4 z-[3] flex gap-1 tablet:inset-x-5 tablet:bottom-5">
          {photos.map((photo, position) => (
            <span key={`${position}-${photo.src}`} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                key={position === index ? `run-${index}` : "idle"}
                className={cn(
                  "block size-full origin-left bg-white",
                  position < index ? "scale-x-100" : position === index && showing ? "animate-progress" : "scale-x-0",
                )}
                style={position === index ? { animationDuration: `${SLIDE_MS}ms` } : undefined}
              />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
