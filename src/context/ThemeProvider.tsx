import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

function usePersistedState(key: string, defaultValue: any) {
  const [state, setState] = useState(() => {
    const value = tempConfig[key] || defaultValue;
    return value;
  });

  // сохранение в конфиге
  useEffect(() => {
    const confValue = tempConfig[key];
    if (confValue !== state) {
      tempConfig[key] = state;
    }
  }, [state]);

  return [state, setState];
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = usePersistedState("theme", "system");

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
