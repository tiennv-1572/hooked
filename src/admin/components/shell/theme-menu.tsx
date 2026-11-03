"use client";

import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";

import { Button } from "@/admin/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";
import { THEME_PRESETS, usePreferences, type ThemeMode } from "@/admin/lib/preferences";

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "system", label: "Theo hệ thống", icon: Monitor },
];

/** Light/dark mode, colour preset and content width. */
export function ThemeMenu() {
  const { mode, preset, contentWidth, setMode, setPreset, setContentWidth } = usePreferences();
  const ModeIcon = MODES.find((item) => item.value === mode)?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Giao diện">
          <ModeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Chế độ</DropdownMenuLabel>
        {MODES.map((item) => (
          <DropdownMenuItem key={item.value} onSelect={() => setMode(item.value)}>
            <item.icon />
            {item.label}
            {mode === item.value ? <Check className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="size-3.5" /> Màu chủ đạo
        </DropdownMenuLabel>
        {THEME_PRESETS.map((item) => (
          <DropdownMenuItem key={item.value} onSelect={() => setPreset(item.value)}>
            <span className="size-3.5 rounded-full border" style={{ background: item.swatch }} />
            {item.label}
            {preset === item.value ? <Check className="ml-auto" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Bố cục</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setContentWidth("centered")}>
          Căn giữa (tối đa 1440px)
          {contentWidth === "centered" ? <Check className="ml-auto" /> : null}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setContentWidth("full")}>
          Toàn chiều rộng
          {contentWidth === "full" ? <Check className="ml-auto" /> : null}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
