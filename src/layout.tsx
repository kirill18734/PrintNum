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
  const serverOnline = useAppStore((state: any) => state.serverOnline);
  const theme = useAppStore((state: any) => state.theme);
  const installUpdate = useAppStore((state: any) => state.installUpdate);
  const setServerOnline = useAppStore((state: any) => state.setServerOnline);
  const setPrinterOnline = useAppStore((state: any) => state.setPrinterOnline);

  // Инициализация и запуск бэкенда
  useEffect(() => {
    appService.initStartHandler();
  }, []);

  // тема
  useEffect(() => {
    const root = document.documentElement;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

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
