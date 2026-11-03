"use client";

import { ChevronLeft, ChevronRight, Clapperboard, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { FormSection } from "@/admin/components/cms/form-fields";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/admin/components/ui/popover";
import { Spinner } from "@/admin/components/ui/spinner";
import { useSingleton } from "@/admin/lib/cms/hooks";
import { createId } from "@/admin/lib/cms/ids";
import type { HomePage, HomeSlide } from "@/admin/lib/cms/types/pages";
import type { ImageRef } from "@/admin/lib/cms/types/shared";
import { parseYouTubeId } from "@/admin/modules/projects/project-utils";
import { cn } from "@/lib/utils";

import { TabLayout } from "../editor-tabs";
import { ImageGridField } from "../image-grid-field";
import { PreviewCard, PreviewEmpty, SiteCanvas, SiteLogo } from "../site-preview";

/** Fixed by the design — same values as src/components/home/hero-carousel.tsx. */
const PHOTO_SECONDS = 5;
const VIDEO_SECONDS = 15;
const MARQUEE_TEXT = "SUPPORT LOCAL ARTISTS";

const slideSeconds = (slide: HomeSlide | undefined) => (slide?.youtubeId ? VIDEO_SECONDS : PHOTO_SECONDS);

export function HeroTab() {
  const [active, setActive] = useState(0);
  return (
    <TabLayout preview={<HeroPreview active={active} setActive={setActive} />}>
      <FormSection title="Ảnh trình chiếu" description="Ảnh hoặc video YouTube chạy lần lượt ở đầu trang chủ.">
        <ImageGridField<HomeSlide>
          name="hero.slides"
          label="Ảnh & video banner"
          required
          folder="home"
          aspect="16/9"
          getImage={(slide) => slide.image}
          setImage={(slide, image) => ({ ...slide, image })}
          create={(image) => ({ id: createId("slide"), image })}
          activeIndex={active}
          onTileClick={setActive}
          actions={<AddVideoButton onAdded={setActive} />}
          tileBadge={(slide) =>
            slide.youtubeId ? (
              <span className="flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                <Play className="size-3 fill-current" /> Video
              </span>
            ) : null
          }
          description="Nên dùng ảnh ngang. Với video, ảnh trong ô hiển thị trong lúc video đang tải."
        />
      </FormSection>
    </TabLayout>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Add a YouTube slide

/** YouTube's 1280×720 poster when the video has one, else the 480×360 (letterboxed) fallback that always exists. */
function youtubePoster(id: string, title: string): Promise<ImageRef> {
  const maxres = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  return new Promise((resolve) => {
    const probe = new window.Image();
    probe.onload = () =>
      resolve(
        probe.naturalWidth >= 640
          ? { url: maxres, alt: title, width: 1280, height: 720 }
          : { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: title, width: 480, height: 360 },
      );
    probe.onerror = () =>
      resolve({ url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: title, width: 480, height: 360 });
    probe.src = maxres;
  });
}

/** Title from YouTube oEmbed (also tells a private/removed video apart). `null` = not embeddable. */
async function youtubeTitle(id: string): Promise<string | null | undefined> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
    );
    if (response.status === 401 || response.status === 403 || response.status === 404) return null;
    if (!response.ok) return undefined;
    return ((await response.json()) as { title?: string }).title;
  } catch {
    return undefined; // offline or blocked — still allow adding
  }
}

function AddVideoButton({ onAdded }: { onAdded: (index: number) => void }) {
  const { getValues, setValue } = useFormContext<HomePage>();
  const [open, setOpen] = useState(false);
  const [value, setValueInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const id = parseYouTubeId(value);
    if (!id) {
      setError("Không đọc được link. Dán link YouTube (watch, youtu.be, shorts…) hoặc ID 11 ký tự.");
      return;
    }
    setBusy(true);
    const title = await youtubeTitle(id);
    if (title === null) {
      setBusy(false);
      setError("Video không công khai hoặc không cho phép nhúng.");
      return;
    }
    const image = await youtubePoster(id, title || "Video YouTube");
    const slides = getValues("hero.slides") ?? [];
    setValue("hero.slides", [...slides, { id: createId("slide"), youtubeId: id, image }], {
      shouldDirty: true,
      shouldValidate: true,
    });
    onAdded(slides.length);
    setBusy(false);
    setOpen(false);
    setValueInput("");
    setError(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Clapperboard /> Thêm video YouTube
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80" onOpenAutoFocus={() => input.current?.focus()}>
        <form onSubmit={submit} className="grid gap-2">
          <label htmlFor="hero-youtube" className="text-sm font-medium">
            Link video YouTube
          </label>
          <Input
            id="hero-youtube"
            ref={input}
            value={value}
            onChange={(event) => {
              setValueInput(event.target.value);
              setError(null);
            }}
            placeholder="https://www.youtube.com/watch?v=…"
            aria-invalid={error ? true : undefined}
          />
          {error ? (
            <p className="text-destructive text-xs">{error}</p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Video phát không tiếng và lặp lại; ảnh chờ được lấy tự động từ YouTube.
            </p>
          )}
          <Button type="submit" size="sm" disabled={busy || !value.trim()}>
            {busy ? <Spinner /> : null} Thêm video
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------------------------------------
// Preview

function HeroPreview({ active, setActive }: { active: number; setActive: Dispatch<SetStateAction<number>> }) {
  const hero = useWatch({ name: "hero" }) as HomePage["hero"] | undefined;
  const { data: navigation } = useSingleton("navigation");
  const [playing, setPlaying] = useState(true);
  const slides = hero?.slides ?? [];
  const count = slides.length;
  const index = count ? Math.min(active, count - 1) : 0;
  const current = slides[index];
  const seconds = slideSeconds(current);
  const navItems = (navigation?.desktop ?? []).filter((item) => item.visible);

  // Per-slide duration (photo 5 s, video 15 s), restarted whenever the slide changes.
  useEffect(() => {
    if (!playing || count < 2) return;
    const timer = window.setTimeout(
      () => setActive((value) => (Math.min(value, count - 1) + 1) % count),
      seconds * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [playing, count, seconds, index, setActive]);

  const go = (delta: number) => count && setActive((index + delta + count) % count);

  return (
    <PreviewCard
      href="/"
      description={
        count ? `${current?.youtubeId ? "Video" : "Ảnh"} ${index + 1}/${count} · hiển thị ${seconds} giây` : undefined
      }
    >
      <SiteCanvas>
        <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]">
          {slides.map((slide, i) =>
            slide.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={slide.id}
                src={slide.image.url}
                alt={slide.image.alt}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-700",
                  i === index ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null,
          )}
          {current?.youtubeId && playing ? (
            // 16:9 video covering the 16:10 frame: full height, width 16/9 ÷ 16/10 = 111.1%.
            <iframe
              key={current.id}
              src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${current.youtubeId}&controls=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0`}
              title={current.image?.alt || "Video YouTube"}
              allow="autoplay; encrypted-media"
              tabIndex={-1}
              className="pointer-events-none absolute top-0 left-1/2 h-full w-[111.2%] -translate-x-1/2 border-0"
            />
          ) : null}
          {!count ? (
            <PreviewEmpty className="absolute inset-0 flex items-center justify-center">
              Chưa có ảnh hoặc video banner
            </PreviewEmpty>
          ) : null}
          <div className="absolute inset-x-0 top-0 flex h-7 items-center justify-between gap-3 bg-[linear-gradient(90deg,#983a0f_0%,#000_49%,#983a0f_100%)] px-3">
            <SiteLogo className="w-9" />
            <div className="flex min-w-0 gap-2 overflow-hidden text-[6px] font-bold whitespace-nowrap text-[#ccc] uppercase">
              {navItems.map((item) => (
                <span key={item.id}>{item.label}</span>
              ))}
            </div>
          </div>
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-1.5 -translate-y-1/2 text-white/90 hover:text-white"
                aria-label="Slide trước"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute top-1/2 right-1.5 -translate-y-1/2 text-white/90 hover:text-white"
                aria-label="Slide sau"
              >
                <ChevronRight className="size-4" />
              </button>
            </>
          ) : null}
        </div>
        {/* Fixed marquee: "SUPPORT LOCAL ARTISTS" alternating with the HOOKED ENTERTAINMENT lockup. */}
        <div className="flex items-center gap-2.5 overflow-hidden border-t border-white/5 py-2 text-[13px] leading-none font-extrabold whitespace-nowrap uppercase">
          {[0, 1, 2].map((key) => (
            <span key={key} className="flex shrink-0 items-center gap-2.5">
              <span className="text-transparent [-webkit-text-stroke:0.7px_#ff6b00]">{MARQUEE_TEXT}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand/hooked-mark.svg" alt="" className="h-2.5 w-auto" />
              <span className="flex items-center gap-1">
                <SiteLogo className="w-12" /> ENTERTAINMENT
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/brand/hooked-mark.svg" alt="" className="h-2.5 w-auto" />
            </span>
          ))}
        </div>
      </SiteCanvas>
      {count ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setPlaying((value) => !value)}
            aria-label={playing ? "Tạm dừng" : "Tự chạy"}
          >
            {playing ? <Pause /> : <Play />}
          </Button>
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${slide.youtubeId ? "Video" : "Ảnh"} ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "bg-primary w-5" : "bg-muted-foreground/30 hover:bg-muted-foreground/60 w-1.5",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </PreviewCard>
  );
}
