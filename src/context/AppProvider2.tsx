import { sendServer } from "@/services/api";
import { appService } from "@/services/app.tauri";
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext({});

// ---------- Остановка backend ----------
appService.initCloseHandler();

export default function AppProvider({ children }: any) {
  const [serverOnline, setServerOnline] = useState(false);
  const [printerOnline, setPrinterOnline] = useState(false);
  const [version, setVersion] = useState("");
  const [isUpdate, setIsUpdate] = useState(false);
  const [theme, setTheme] = useStorageState("theme");
  const [themeStyle, setThemeStyle] = useStorageState("themeStyle");
  const [printer, setPrinter] = useStorageState("printer");
  const [paper, setPaper] = useStorageState("paper");
  const [idNum, setIdNum] = useStorageState("idNum");
  const [endLine, setEndLine] = useStorageState("endLine");
  const [hybrid, setHybrid] = useStorageState("hybrid");
  const [expand, setExpand] = useStorageState("expand");

  const listPapers = [
    "30*20",
    "40*30",
    "43*25",
    "50*70",
    "58*40",
    "60*40",
    "75*120",
    "100*150",
  ];

  const [listPrinters, setListPrinters] = useState([]);

  const updateListPrinters = async () => {
    try {
      const response = await sendServer.get("listPrinters");
      const body = await response.json();

      setListPrinters((prev: any) => {
        const next = body.listPrinters;

        // простая проверка по ссылке (быстрая)
        if (prev === next) return prev;

        // более надёжная проверка (по содержимому)
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

        return next;
      });
    } catch {
      setListPrinters((prev: any) => (prev.length === 0 ? prev : []));
    }
  };

  useEffect(() => {
    updateListPrinters();

    const interval = setInterval(updateListPrinters, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentThemeStyle =
      document.documentElement.getAttribute("theme-style");
    if (currentThemeStyle !== themeStyle) {
      // Remove existing data-theme attribute
      document.documentElement.setAttribute("theme-style", themeStyle);
    }
  }, [themeStyle]);

  useEffect(() => {
    const root = document.documentElement;

    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  }, [theme]);

  // запуск backend
  useEffect(() => {
    appService.initStartHandler();
  }, []);

  const closeWindow = async () => appService.closeWindow();

  const hideWindow = () => appService.minWindow();
  const openHelp = () =>
    appService.openExternalUrl("https://github.com/kirill18734/PrintNum");
  const visibleWindow = () => appService.visibleWindow();

  useEffect(() => {
    appService
      .checkForUpdates()
      .then((message: any) => message && setVersion(`${message}`));
  }, []);

  const checkStatus = async () => {
    try {
      const response = await sendServer.get("status-printer");
      const body = await response.json();

      setServerOnline(true);

      const statePrinter = body.printerOnline;

      setPrinterOnline((prev) => (prev === statePrinter ? prev : statePrinter));
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

  // useEffect #2: Проверка обновлений (Низкий приоритет, фоновый режим)
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const resUpdate = await appService.checkForUpdates();
        setIsUpdate(resUpdate);
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    fetchUpdates();
  }, []);

  return (
    <AppContext
      value={{
        serverOnline,
        printerOnline,
        setPrinterOnline,
        closeWindow,
        hideWindow,
        version,
        openHelp,
        visibleWindow,
        isUpdate,
        theme,
        setTheme,
        printer,
        setPrinter,
        paper,
        setPaper,
        idNum,
        setIdNum,
        endLine,
        setEndLine,
        hybrid,
        setHybrid,
        expand,
        setExpand,
        listPapers,
        listPrinters,
      }}
    >
      {children}
    </AppContext>
  );
}

export const useAppContext = () => useContext(AppContext);
