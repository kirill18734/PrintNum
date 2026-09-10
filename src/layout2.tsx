import { useEffect } from "react";
import { appService } from "./services/app.tauri";
import Home from "./pages/home2";
import { useAppStore } from "./services/store";
import { sendServer } from "./services/api";

// ---------- Остановка backend ----------
appService.initCloseHandler();

export default function Layout() {
  // Забираем нужные экшены для инициализации
  const initStore = useAppStore((state) => state.initStore);
  const setServerOnline = useAppStore((state) => state.setServerOnline);
  const setPrinterOnline = useAppStore((state) => state.setPrinterOnline);
  const setListPrinters = useAppStore((state) => state.setListPrinters);

  // Вытаскиваем значения тем для отслеживания изменений
  const theme = useAppStore((state) => state.theme);
  const themeStyle = "vercel";

  // 1. Эффект первоначальной сборки и фоновых процессов
  useEffect(() => {
    // Загружаем настройки из config.json
    initStore();

    // Запускаем бэк
    appService.initStartHandler();

    // Интервал проверки принтеров (5 сек)
    const printerInterval = setInterval(async () => {
      try {
        const res = await sendServer.get("listPrinters");
        const body = await res.json();
        setListPrinters(body.listPrinters);
      } catch {
        setListPrinters([]);
      }
    }, 5000);

    // Интервал проверки статуса сервера (2 сек)
    const statusInterval = setInterval(async () => {
      try {
        const res = await sendServer.get("status-printer");
        const body = await res.json();
        setServerOnline(true);
        setPrinterOnline(body.printerOnline);
      } catch {
        setServerOnline(false);
        setPrinterOnline(false);
      }
    }, 2000);

    return () => {
      clearInterval(printerInterval);
      clearInterval(statusInterval);
    };
  }, []);

  // 2. Эффект применения стилей темы (следит за стором Zustand)
  useEffect(() => {
    document.documentElement.setAttribute("theme-style", themeStyle);
  }, [themeStyle]);

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    appService.visibleWindow();
  }, []);

  return (
    <>
      <Home />
    </>
  );
}
