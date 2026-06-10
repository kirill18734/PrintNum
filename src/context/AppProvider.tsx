import { sendServer } from "@/services/api";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Command, open } from "@tauri-apps/plugin-shell";
import { updater } from "@/services/updater";
import { createContext, useContext, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const AppContext = createContext({});

// // ---------- Остановка backend ----------
getCurrentWindow().onCloseRequested(() => {
  Command.create("stop_backend").execute();
});

export default function AppProvider({ children }: any) {
  const [tab, setTab] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [printerOnline, setPrinterOnline] = useState(false);
  const [version, setVersion] = useState("");
  // запуск проверки для обновлений
  useEffect(() => {
    updater();
  }, []);

  const closeWindow = async () => {
    const window = getCurrentWindow();
    await window.close();
  };

  const hideWindow = () => getCurrentWindow().minimize();
  const openHelp = () => open("https://github.com/kirill18734/PrintNum");
  const visibleWindow = () => getCurrentWindow().show();

  useEffect(() => {
    invoke("get_version").then(
      (message) => message && setVersion(`${message}`),
    );
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

  return (
    <AppContext
      value={{
        serverOnline,
        tab,
        setTab,
        printerOnline,
        setPrinterOnline,
        closeWindow,
        hideWindow,
        version,
        openHelp,
        visibleWindow,
      }}
    >
      {children}
    </AppContext>
  );
}

export const useAppContext = () => useContext(AppContext);
