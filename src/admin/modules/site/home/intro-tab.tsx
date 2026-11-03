"use client";

import { useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

import { FormSection, StringListField, TextareaField } from "@/admin/components/cms/form-fields";
import type { HomePage } from "@/admin/lib/cms/types/pages";
import { cn } from "@/lib/utils";

import { TabLayout } from "../editor-tabs";
import { INTRO_BODY_MAX } from "../site-schemas";
import { PreviewCard, SiteCanvas } from "../site-preview";

/** Desktop typography of the intro paragraph (src/components/home/intro-section.tsx). */
const BODY = { width: 780, fontSize: 32, lineHeight: 40, maxLines: 3 } as const;
const BODY_FONT = '"Young Display", var(--font-inter-face), ui-sans-serif, sans-serif';
/** Preview scale: the 780px desktop paragraph drawn inside the ~330px preview column. */
const SCALE = 0.4;

/**
 * Lines the paragraph takes on desktop, measured with the site's font, size and width. A ResizeObserver
 * re-measures when the text changes, when the web font loads and when the tab is shown (tabs stay mounted).
 */
function useDesktopLines() {
  const probe = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState(0);
  useEffect(() => {
    const node = probe.current;
    if (!node) return;
    const measure = () => setLines(node.textContent?.trim() ? Math.round(node.offsetHeight / BODY.lineHeight) : 0);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);
  return { probe, lines };
}

export function IntroTab() {
  const body = (useWatch({ name: "intro.body" }) as string | undefined) ?? "";
  const { probe, lines } = useDesktopLines();
  const over = lines > BODY.maxLines;
  return (
    <TabLayout preview={<IntroPreview lines={lines} />}>
      <FormSection title="Tuyên ngôn" description="Khối chữ lớn ngay dưới banner.">
        <StringListField
          name="intro.titleLines"
          label="Tiêu đề"
          required
          max={4}
          placeholder="SUPPORTING"
          addLabel="Thêm dòng"
        />
        <div className="grid gap-1.5">
          <TextareaField name="intro.body" label="Đoạn giới thiệu" required rows={3} maxLength={INTRO_BODY_MAX} />
          <p
            className={cn("text-xs font-medium", over ? "text-destructive" : "text-muted-foreground")}
            aria-live="polite"
          >
            Trên desktop: {lines}/{BODY.maxLines} dòng
            {over ? " — website chỉ hiện 3 dòng, hãy rút ngắn đoạn văn." : ""}
          </p>
        </div>
        {/* Off-screen probe with the exact desktop typography. */}
        <div aria-hidden className="pointer-events-none invisible fixed top-0 left-[-9999px]">
          <div
            ref={probe}
            className="font-bold uppercase"
            style={{
              width: BODY.width,
              fontSize: BODY.fontSize,
              lineHeight: `${BODY.lineHeight}px`,
              fontFamily: BODY_FONT,
            }}
          >
            {body}
          </div>
        </div>
      </FormSection>
    </TabLayout>
  );
}

function IntroPreview({ lines }: { lines: number }) {
  const intro = useWatch({ name: "intro" }) as HomePage["intro"] | undefined;
  const titleLines = (intro?.titleLines ?? []).filter((line) => line.trim());
  return (
    <PreviewCard href="/">
      <SiteCanvas className="bg-[linear-gradient(180deg,rgba(51,34,12,0.95)_0%,#020000_100%)]">
        <div className="flex min-h-56 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
          <p className="text-[28px] leading-[1.02] font-extrabold uppercase">
            {titleLines.length ? (
              titleLines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span className="text-white/30">TIÊU ĐỀ</span>
            )}
          </p>
          {/* The real 780px paragraph scaled down, so line breaks match the website; clamped to 3 lines like it. */}
          <div
            className="overflow-hidden"
            style={{
              width: BODY.width * SCALE,
              height: Math.max(1, Math.min(lines, BODY.maxLines)) * BODY.lineHeight * SCALE,
            }}
          >
            <p
              className="line-clamp-3 origin-top-left font-bold uppercase"
              style={{
                width: BODY.width,
                fontSize: BODY.fontSize,
                lineHeight: `${BODY.lineHeight}px`,
                fontFamily: BODY_FONT,
                transform: `scale(${SCALE})`,
              }}
            >
              {intro?.body || <span className="text-white/30">Đoạn giới thiệu…</span>}
            </p>
          </div>
        </div>
      </SiteCanvas>
    </PreviewCard>
  );
}
