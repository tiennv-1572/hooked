"use client";

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";

import {
  findCourse,
  registrationSources,
  type AcademyCourse,
  type RegistrationCopy,
} from "@/components/academy/academy-content";
import { CourseProgramDialog } from "@/components/academy/course-program-dialog";
import { RegistrationDialog } from "@/components/academy/registration-dialog";

type AcademyOverlaysApi = {
  /** Opens "Đăng ký tư vấn" with `courseId` pre-selected; `source` is stored on the lead. */
  openRegistration: (courseId?: string, source?: string) => void;
  /** Opens the course program & benefits modal; `source` tells where (carousel, directory) it was opened. */
  openProgram: (courseId: string, source: string) => void;
};

const AcademyOverlaysContext = createContext<AcademyOverlaysApi | null>(null);

/** `null` outside `<AcademyOverlays>` — callers (e.g. RegisterButton) then render their own dialog. */
export function useAcademyOverlays() {
  return useContext(AcademyOverlaysContext);
}

type AcademyOverlaysProps = {
  /** Courses from the CMS: the program modal and the registration course selector use the same list. */
  courses: AcademyCourse[];
  /** "Đăng ký tư vấn" copy (fixed, `ACADEMY_COPY.registration`). */
  registration: RegistrationCopy;
  children: ReactNode;
};

/**
 * Hosts the single Registration (70 · OVERLAYS 2341:1603) and Course program (71 · OVERLAYS 2494:3835)
 * dialogs of the Academy page so every trigger (carousel, directory, program modal) shares them.
 * "Đăng ký tư vấn" inside the program modal replaces it with Registration (no stacking).
 */
export function AcademyOverlays({ courses, registration: copy, children }: AcademyOverlaysProps) {
  // The control that opened the current overlay; kept across the program → registration swap.
  const openerRef = useRef<HTMLElement | null>(null);
  const [registration, setRegistration] = useState<{ open: boolean; courseId?: string; source?: string }>({
    open: false,
  });
  const [program, setProgram] = useState<{ open: boolean; courseId?: string; source: string }>({
    open: false,
    source: registrationSources.fallback,
  });
  const programCourse = findCourse(courses, program.courseId);

  const api = useMemo<AcademyOverlaysApi>(
    () => ({
      openRegistration: (courseId, source) => {
        openerRef.current = document.activeElement as HTMLElement | null;
        setRegistration({ open: true, courseId, source });
      },
      openProgram: (courseId, source) => {
        openerRef.current = document.activeElement as HTMLElement | null;
        setProgram({ open: true, courseId, source });
      },
    }),
    [],
  );

  return (
    <AcademyOverlaysContext.Provider value={api}>
      {children}
      {programCourse ? (
        <CourseProgramDialog
          open={program.open}
          course={programCourse}
          returnFocusRef={openerRef}
          onOpenChange={(open) => setProgram((current) => ({ ...current, open }))}
          onRegister={(courseId) => {
            setProgram((current) => ({ ...current, open: false }));
            setRegistration({
              open: true,
              courseId,
              source: `${program.source} · ${registrationSources.program}`,
            });
          }}
        />
      ) : null}
      <RegistrationDialog
        open={registration.open}
        courses={courses}
        copy={copy}
        courseId={registration.courseId}
        source={registration.source}
        returnFocusRef={openerRef}
        onOpenChange={(open) => setRegistration((current) => ({ ...current, open }))}
      />
    </AcademyOverlaysContext.Provider>
  );
}
