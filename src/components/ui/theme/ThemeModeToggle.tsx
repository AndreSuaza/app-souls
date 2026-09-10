"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { IconType } from "react-icons";
import {
  IoDesktopOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "souls-theme-mode";

const modeOrder: ThemeMode[] = ["light", "dark", "system"];

const modeConfig: Record<ThemeMode, { label: string; Icon: IconType }> = {
  light: { label: "Claro", Icon: IoSunnyOutline },
  dark: { label: "Oscuro", Icon: IoMoonOutline },
  system: { label: "Sistema", Icon: IoDesktopOutline },
};

const applyThemeMode = (mode: ThemeMode) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.dataset.themeMode = mode;
};

export const ThemeModeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    const nextMode =
      storedMode === "light" || storedMode === "dark" || storedMode === "system"
        ? storedMode
        : "system";

    setMode(nextMode);
    applyThemeMode(nextMode);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      const currentMode = window.localStorage.getItem(STORAGE_KEY);
      if (!currentMode || currentMode === "system") applyThemeMode("system");
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const selectMode = (nextMode: ThemeMode) => {
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    applyThemeMode(nextMode);
  };

  const cycleMode = () => {
    const currentIndex = modeOrder.indexOf(mode);
    const nextMode = modeOrder[(currentIndex + 1) % modeOrder.length];
    selectMode(nextMode);
  };

  const CurrentIcon = modeConfig[mode].Icon;

  return (
    <button
      type="button"
      onClick={cycleMode}
      title={`Tema actual: ${modeConfig[mode].label}`}
      className={clsx(
        "inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition",
        "border-slate-200 bg-slate-100 text-slate-600 hover:border-purple-300 hover:text-purple-700",
        "dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:border-purple-400/60 dark:hover:text-purple-300",
      )}
    >
      <CurrentIcon className="h-4 w-4" />
      <span>{modeConfig[mode].label}</span>
    </button>
  );
};
