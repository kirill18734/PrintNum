import { appService } from "./services/app.tauri";
import Home from "./pages/home";
import { useEffect } from "react";
import { sendServer } from "./services/api";
import { useAppStore } from "./services/store";
import Updating from "./pages/updating";
import Loading from "./pages/loading";
import { initStoreService } from "./services/store.tauri";

// ---------- Остановка backend ----------
appService.initCloseHandler();

// Инициализируем конфиг (загрузит данные с диска, если это Tauri)
await initStoreService();

export default function Layout() {
  const serverOnline = useAppStore((state: any) => state.serverOnline);
  const theme = useAppStore((state: any) => state.theme);
  const themeStyle = useAppStore((state: any) => state.themeStyle);
  const installUpdate = useAppStore((state: any) => state.installUpdate);
  const setServerOnline = useAppStore((state: any) => state.setServerOnline);
  const setPrinterOnline = useAppStore((state: any) => state.setPrinterOnline);
  const listPrinters = useAppStore((state: any) => state.listPrinters);
  const setListPrinters = useAppStore((state: any) => state.setListPrinters);
  const updateStoreTauriValue = useAppStore(
    (state: any) => state.updateStoreTauriValue,
  );

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
      updateStoreTauriValue("theme", systemIsDark ? "dark" : "light");
      return; // Прерываем выполнение, так как изменение темы вызовет этот useEffect снова
    }

    // 2. Обычная логика переключения классов для "dark" и "light"
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
  }, [theme]);

const updateListPrinters = async () => {
  try {
    const response = await sendServer.get("listPrinters");
    const body = await response.json();
    const next = body.listPrinters;

    // 1. Простая проверка по ссылке (быстрая)
    if (listPrinters === next) return;

    // 2. Более надёжная проверка (по содержимому)
    if (JSON.stringify(listPrinters) === JSON.stringify(next)) return;

    // Если список изменился, обновляем Zustand
    setListPrinters(next);
  } catch {
    // Если произошла ошибка и текущий список не пуст — очищаем его
    if (listPrinters.length !== 0) {
      setListPrinters([]);
    }
  }
};

useEffect(() => {
  updateListPrinters();

  const interval = setInterval(updateListPrinters, 5000);

  return () => clearInterval(interval);
}, [listPrinters]); // Добавляем в зависимости, чтобы внутри updateListPrinters всегда были актуальные данные


  // проверка сервера/принтера на доступность
  const checkStatus = async () => {
    try {
      const response = await sendServer.get("status-printer");
      const body = await response.json();

      setServerOnline(true);

      const statePrinter = body.printerOnline;

      setPrinterOnline(statePrinter);
    } catch {
      setServerOnline(false);
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
