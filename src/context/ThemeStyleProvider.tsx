import { useStorageState } from "@/hooks/useStorageState";
import { createContext, useContext, useEffect } from "react";

const ThemeStyleContext = createContext({});

export default function ThemeStyleProvider({ children }: any) {
  const [themeStyle, setThemeStyle] = useStorageState("themeStyle", "vercel");

  useEffect(() => {
    const currentThemeStyle =
      document.documentElement.getAttribute("theme-style");
    if (currentThemeStyle !== themeStyle) {
      // Remove existing data-theme attribute
      document.documentElement.setAttribute("theme-style", themeStyle);
    }
  }, [themeStyle]);

  return (
    <ThemeStyleContext value={{ themeStyle, setThemeStyle }}>
      {children}
    </ThemeStyleContext>
  );
}

export const useThemeStyleContext = () => useContext(ThemeStyleContext);
