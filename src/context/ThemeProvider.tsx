import { useStorageState } from "@/hooks/useStorageState";
import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({});

export default function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useStorageState("theme", "system");

  useEffect(() => {
    const root = document.documentElement;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  }, [theme]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export const useThemeContext = () => useContext(ThemeContext);
