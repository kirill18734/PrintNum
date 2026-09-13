import { appService } from "./services/app.tauri";
import Home from "./pages/home";
import { useEffect } from "react";
import { sendServer } from "./services/api";
import { useAppStore } from "./services/store";
import Updating from "./pages/updating";
import Loading from "./pages/loading";

// ---------- Остановка backend ----------
appService.initCloseHandler();

export default function Layout() {
  const hydrate = useAppStore((state: any) => state.hydrate);
  const serverOnline = useAppStore((state: any) => state.serverOnline);
  const theme = useAppStore((state: any) => state.theme);
  const themeStyle = useAppStore((state: any) => state.themeStyle);
  const installUpdate = useAppStore((state: any) => state.installUpdate);
  const setServerOnline = useAppStore((state: any) => state.setServerOnline);
  const setPrinterOnline = useAppStore((state: any) => state.setPrinterOnline);
  const setTheme = useAppStore((state: any) => state.setTheme); // Достаем метод смены темы

  useEffect(() => {
    hydrate(); // Запускаем асинхронное чтение настроек из файла Tauri
  }, [hydrate]);

  // Инициализация и запуск бэкенда
  useEffect(() => {
    appService.initStartHandler();
  }, []);

  useEffect(() => {
    const currentThemeStyle =
      document.documentElement.getAttribute("theme-style");
    if (currentThemeStyle !== themeStyle) {
      // Remove existing data-theme attribute
      document.documentElement.setAttribute("theme-style", themeStyle);
    }
  }, [themeStyle]);

  // тема
  useEffect(() => {
    const root = document.documentElement;
    // 1. Если тема "system", определяем системную тему и перезаписываем ее в сторе
    if (theme === "system") {
      const systemIsDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(systemIsDark ? "dark" : "light");
      return; // Прерываем выполнение, так как изменение темы вызовет этот useEffect снова
    }

    // 2. Обычная логика переключения классов для "dark" и "light"
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
  }, [theme]);

  // проверка сервера/принтера на доступность
  const checkStatus = async () => {
    try {
      const response = await sendServer.get("status-printer");
      const body = await response.json();

      setServerOnline(true);

      const statePrinter = body.printerOnline;

      setPrinterOnline(statePrinter);
    } catch {
      setServerOnline(true);
      setPrinterOnline(false);
    }
  };

  useEffect(() => {
    checkStatus();

    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // после запуска всех нужных компонентов показываем окно
  useEffect(() => {
    appService.visibleWindow();
  }, []);

  return (
    <>{installUpdate ? <Updating /> : serverOnline ? <Home /> : <Loading />}</>
  );
}
