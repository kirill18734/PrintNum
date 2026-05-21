import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTheme, setActiveTheme] = useState("system");

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    if (currentTheme !== activeTheme) {
      // Remove existing data-theme attribute
      document.documentElement.removeAttribute("data-theme");

      // Remove any theme classes from body (cleanup)
      Array.from(document.body.classList)
        .filter((className) => className.startsWith("theme-"))
        .forEach((className) => {
          document.body.classList.remove(className);
        });
    }

    // Set data-theme on html element
    if (activeTheme) {
      document.documentElement.setAttribute("data-theme", activeTheme);
    }
  }, [activeTheme]);

  return (
    <ThemeContext value={{ activeTheme, setActiveTheme }}>
      {children}
    </ThemeContext>
  );
}

export const useAppContext = () => useContext(ThemeContext);
