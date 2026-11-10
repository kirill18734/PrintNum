import { useEffect } from "react";
import { useAppStore } from "@/services/store";

export function useThemeRuntime(): void {
  const theme = useAppStore((state) => state.theme);
  const themeStyle = useAppStore((state) => state.themeStyle);

  // Стиль приложения
  useEffect(() => {
    document.documentElement.setAttribute("theme-style", themeStyle);
  }, [themeStyle]);
  // тема
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      void useAppStore
        .getState()
        .setSetting("theme", isDark ? "dark" : "light");
      return;
    }
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
