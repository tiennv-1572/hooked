"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import { PhotoLightbox } from "@/components/projects/detail/photo-lightbox";
import { VideoLightbox } from "@/components/projects/detail/video-lightbox";
import type { MediaRef, ProjectPhoto, ProjectVideo } from "@/data/project-details";

type ProjectMediaContextValue = {
  /** Opens the photo or video lightbox; `trigger` gets focus back when it closes. */
  openMedia: (ref: MediaRef, trigger?: HTMLElement | null) => void;
};

const ProjectMediaContext = createContext<ProjectMediaContextValue | null>(null);

export function useProjectMedia() {
  const context = useContext(ProjectMediaContext);
  if (!context) throw new Error("useProjectMedia must be used inside <ProjectMediaProvider>");
  return context;
}

type ProjectMediaProviderProps = {
  /** Lightbox title: the project name ("Devoid Music Festival"). */
  title: string;
  photos: ProjectPhoto[];
  videos: ProjectVideo[];
  children: ReactNode;
};

/**
 * Owns the two overlays of a project detail page (Figma 73 Video lightbox, 74 Photo lightbox) so the cover,
 * the masonry tiles and the "Xem toàn bộ album ảnh" link — rendered by server components — can open them.
 * The last opened item stays mounted while the dialog fades out.
 */
export function ProjectMediaProvider({ title, photos, videos, children }: ProjectMediaProviderProps) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const openMedia = useCallback(
    (ref: MediaRef, trigger?: HTMLElement | null) => {
      opener.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      if (ref.type === "photo") {
        const index = photos.findIndex((entry) => entry.id === ref.id);
        setPhotoIndex(Math.max(index, 0));
        setPhotoOpen(true);
      } else {
        setVideoId(ref.id);
        setVideoOpen(true);
      }
    },
    [photos],
  );

  const value = useMemo(() => ({ openMedia }), [openMedia]);
  // Return focus to the tile that opened the overlay (WCAG 2.4.3).
  const restoreFocus = useCallback((event: Event) => {
    event.preventDefault();
    opener.current?.focus({ preventScroll: true });
  }, []);
  const video = videoId ? (videos.find((entry) => entry.id === videoId) ?? null) : null;

  return (
    <ProjectMediaContext.Provider value={value}>
      {children}
      {photos.length > 0 ? (
        <PhotoLightbox
          title={title}
          photos={photos}
          index={photoIndex}
          onIndexChange={setPhotoIndex}
          open={photoOpen}
          onOpenChange={setPhotoOpen}
          onCloseAutoFocus={restoreFocus}
        />
      ) : null}
      {videoId ? (
        <VideoLightbox video={video} open={videoOpen} onOpenChange={setVideoOpen} onCloseAutoFocus={restoreFocus} />
      ) : null}
    </ProjectMediaContext.Provider>
  );
}
