import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

type ThemeState = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
};

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (mode: "light" | "dark") => {
  document.documentElement.classList.toggle("dark", mode === "dark");
};

export const useThemeStore = create<ThemeState>((set) => {
  const saved = (localStorage.getItem("theme") as ThemeMode) || "system";
  const resolved =
    saved === "system" ? getSystemTheme() : (saved as "light" | "dark");

  applyTheme(resolved); // ← apply immediately on init

  return {
    theme: saved,
    resolvedTheme: resolved,

    setTheme: (theme) => {
      const resolved =
        theme === "system" ? getSystemTheme() : (theme as "light" | "dark");

      localStorage.setItem("theme", theme);

      applyTheme(resolved); // ← apply when changed

      set({
        theme,
        resolvedTheme: resolved,
      });
    },
  };
});