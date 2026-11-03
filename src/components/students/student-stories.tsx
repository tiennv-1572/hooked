"use client";

import { useSyncExternalStore } from "react";

import { STORY_QUERY_KEY, type Student } from "@/data/students";
import { cn } from "@/lib/utils";

import { StoryCard } from "./story-card";
import { StudentReaderDialog, type StudentReaderLabels } from "./student-reader";

/*
 * The open reader lives in the URL (`?story=<slug>`) so it can be deep-linked from Academy and shared.
 * The query is read from `window.location` after hydration (server snapshot = closed), which keeps the
 * page fully static — no `useSearchParams` / Suspense boundary needed.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const readStorySlug = () => new URLSearchParams(window.location.search).get(STORY_QUERY_KEY);

/** Replace (not push) the current entry: `?story=<slug>` while a reader is open, clean URL once closed. */
function writeStorySlug(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(STORY_QUERY_KEY, slug);
  else url.searchParams.delete(STORY_QUERY_KEY);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  listeners.forEach((listener) => listener());
}

/**
 * Student Stories article grid + reader (Figma `Stories / Article grid` 2189:2547, mobile
 * `Stories / Two-column grid` 2823:4911, tablet `Stories / Three columns` 2830:5114).
 * Grid: 1 column below 348px (cards would drop under 144px), 2 columns (12px gap) on mobile,
 * 3 columns with 24px gaps from tablet.
 */
type StudentStoriesProps = {
  students: Student[];
  /** Card link label ("Xem câu chuyện") + reader copy, fixed in `studentsPage` (src/data/students.ts). */
  labels: StudentReaderLabels & { readLabel: string };
  className?: string;
};

export function StudentStories({ students, labels, className }: StudentStoriesProps) {
  const slug = useSyncExternalStore(subscribe, readStorySlug, () => null);
  const active = slug ? students.find((student) => student.slug === slug) : undefined;

  return (
    <>
      <ul
        role="list"
        className={cn(
          "grid grid-cols-1 gap-x-3 gap-y-6 min-[348px]:grid-cols-2 tablet:grid-cols-3 tablet:gap-x-6 tablet:gap-y-8 desktop:gap-y-6",
          className,
        )}
      >
        {students.map((student, index) => (
          <li key={student.slug}>
            <StoryCard
              student={student}
              index={index}
              readLabel={labels.readLabel}
              eager={index < 3}
              onOpen={writeStorySlug}
            />
          </li>
        ))}
      </ul>

      <StudentReaderDialog student={active} labels={labels} onClose={() => writeStorySlug(null)} />
    </>
  );
}
