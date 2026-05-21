import { createContext, useContext, useEffect, useState } from "react";

const ThemeStyleContext = createContext({});

export default function ThemeStyleProvider({ children }) {
  const [themeStyle, setThemeStyle] = useState("vercel");

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
