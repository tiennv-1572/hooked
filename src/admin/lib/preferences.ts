"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_PRESETS = [
  { value: "hooked", label: "Hooked", swatch: "oklch(0.64 0.19 39)" },
  { value: "tangerine", label: "Tangerine", swatch: "oklch(0.64 0.17 36.44)" },
  { value: "soft-pop", label: "Soft Pop", swatch: "oklch(0.51 0.23 277)" },
  { value: "brutalist", label: "Brutalist", swatch: "oklch(0.2 0 0)" },
] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number]["value"];

export const CONTENT_WIDTHS = ["centered", "full"] as const;
export type ContentWidth = (typeof CONTENT_WIDTHS)[number];

type PreferencesState = {
  mode: ThemeMode;
  preset: ThemePreset;
  contentWidth: ContentWidth;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePreset) => void;
  setContentWidth: (width: ContentWidth) => void;
};

export const PREFERENCES_STORAGE_KEY = "hooked-admin-preferences";

/** Admin UI preferences (theme mode, colour preset, content width) persisted in localStorage. */
export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      mode: "light",
      preset: "hooked",
      contentWidth: "centered",
      setMode: (mode) => set({ mode }),
      setPreset: (preset) => set({ preset }),
      setContentWidth: (contentWidth) => set({ contentWidth }),
    }),
    { name: PREFERENCES_STORAGE_KEY },
  ),
);

function resolveDark(mode: ThemeMode) {
  return mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

/** Keeps <html> in sync with the stored preferences (class `dark`, data-theme-preset, data-content-width). */
export function usePreferencesSync() {
  const { mode, preset, contentWidth } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.classList.add("disable-transitions");
      root.classList.toggle("dark", resolveDark(mode));
      root.dataset.themePreset = preset;
      root.dataset.contentWidth = contentWidth;
      requestAnimationFrame(() => root.classList.remove("disable-transitions"));
    };
    apply();
    if (mode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [mode, preset, contentWidth]);
}

/**
 * Inline script for <head>: applies the stored theme before first paint (no light/dark flash).
 * Mirrors `usePreferencesSync`.
 */
export const preferencesBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  PREFERENCES_STORAGE_KEY,
)})||"{}").state||{};var m=s.mode||"light";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;if(d)r.classList.add("dark");r.dataset.themePreset=s.preset||"hooked";r.dataset.contentWidth=s.contentWidth||"centered";}catch(e){}})();`;

/** Resolved light/dark for components that need it (e.g. the toaster). */
export function useResolvedTheme(): "light" | "dark" {
  const mode = usePreferences((state) => state.mode);
  if (typeof window === "undefined") return mode === "dark" ? "dark" : "light";
  return resolveDark(mode) ? "dark" : "light";
}
