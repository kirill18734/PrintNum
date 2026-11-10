import { useEffect } from "react";
import { useAppStore } from "@/services/store";

export function useThemeRuntime(): void {
  const theme = useAppStore((state) => state.theme);
  const themeStyle = useAppStore((state) => state.themeStyle);

  // Стиль приложения
  useEffect(() => {
    document.documentElement.setAttribute(
      "theme-style",
      themeStyle,
    );
  }, [themeStyle]);

  // Цветовая тема
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const applyTheme = () => {
      const isDark =
        theme === "system"
          ? media.matches
          : theme === "dark";

      root.classList.toggle("dark", isDark);
    };

    applyTheme();

    if (theme !== "system") return;

    media.addEventListener("change", applyTheme);

    return () => {
      media.removeEventListener("change", applyTheme);
    };
  }, [theme]);
}