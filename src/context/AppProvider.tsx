import { sendServer } from "@/services/api";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Command } from "@tauri-apps/plugin-shell";
// import { updater } from "@/services/updater";
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext({});

export default function AppProvider({ children }) {
  const [tab, setTab] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  const [printerOnline, setPrinterOnline] = useState(false);

  // запуск проверки для обновлений
  useEffect(() => {
    // updater();
  }, []);

  const closeWindow = async () => {
    const window = getCurrentWindow();
    await Command.create("stop_backend").execute();
    await window.close();
  };

  const hideWindow = () => "test"; //getCurrentWindow().minimize();
  const openHelp = () => "test"; //open("https://github.com/kirill18734/PrintNum");
  const getVersion = () => "1.1.0"; //invoke("get_version");

  const checkServerStatus = async () => {
    await sendServer
      .get()
      .then(() => {
        if (!serverOnline) setServerOnline(true);
      })
      .catch(() => {
        if (serverOnline) setServerOnline(false);
      });
  };

  useEffect(() => {
    const interval = setInterval(checkServerStatus, 1000);
    return () => clearInterval(interval);
  }, [serverOnline]);

  // при полной загрузки окна отображаем страницу
  useEffect(() => {
    getCurrentWindow().show();
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
        getVersion,
        openHelp,
      }}
    >
      {children}
    </AppContext>
  );
}

export const useAppContext = () => useContext(AppContext);
