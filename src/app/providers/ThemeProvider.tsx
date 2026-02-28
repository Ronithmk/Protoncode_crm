import { useEffect } from "react";
import { useThemeStore } from "../../store/useThemeStore";

export const ThemeProvider = () => {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const theme = useThemeStore((s) => s.theme);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      const newTheme = media.matches ? "dark" : "light";
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [theme]);

  return null;
};