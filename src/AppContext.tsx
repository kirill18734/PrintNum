import { createContext, useContext, useState, useEffect } from "react";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { LogicalSize } from "@tauri-apps/api/dpi";

import { sendDataServer } from "./utils";

const AppContext = createContext({});

function usePersistedState(key: any, defaultValue: any) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);

    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
    const new_value = structuredClone(state);
    const update = { [key]: new_value };
    sendDataServer("set_config", update);
  }, [key, state]);

  return [state, setState];
}

export function MainContext({ children }: any) {
  const [service, setService] = usePersistedState("service", {
    default: "Ozon",
    data: ["Ozon"],
  });

  const [mode, setMode] = usePersistedState("mode", {
    default: "extension",
    data: ["extension", "neiro"],
  });

  const [theme, setTheme] = usePersistedState("theme", {
    default: "auto",
    data: ["auto", "light", "dark"],
  });

  const [printer, setPrinter] = usePersistedState("printer", {
    default: "",
    data: [""],
  });

  const [running, setRunning] = usePersistedState("running", {
    default: false,
    data: [true, false],
  });

  const [search, setSearch] = usePersistedState("search", {
    default: "Неполные номера (123)",
    expand: "500",
    data: [
      "Неполные номера (123)",
      "Полные номера (123-123)",
      "Неполные номера/текст (123, Возврат)",
      "Полные номера/текст (123-123, Возврат-1)",
      "Другое (1–499: 123/Возврат, 500+: 500-1)",
    ],
  });

  const [paper, setPaper] = usePersistedState("paper", {
    default: "30*20",
    width: "30",
    height: "20",
    data: [
      "30*20",
      "40*30",
      "43*25",
      "50*70",
      "58*40",
      "75*120",
      "100*150",
      "Ручной ввод",
    ],
  });

  const [activeTab, setActiveTab] = useState(false);

  const [status, setStatus] = useState("Сервер НЕДОСТУПЕН");

  // тема
  useEffect(() => {
    const html = document.querySelector("html");
    html?.style.setProperty(
      "color-scheme",
      theme.default === "auto" ? "light dark" : theme.default,
    );
  }, [theme]);

  // высота приложения
  useEffect(() => {
    let height;
    const width = 420;
    if (activeTab) {
      height = 270;
      if (paper.default == "Ручной ввод") height += 35;
      if (search.default.startsWith("Другое")) height += 45;
    } else {
      height = 150;
    }

    getCurrentWindow().setSize(new LogicalSize(width, height));
  }, [activeTab, paper, search]);

  // при полной загрузки окна отображаем страницу
  useEffect(() => {
    getCurrentWindow().show();
  }, []);

  function updateConfig(config: any) {
    if (service !== config.service) setService(config.service);
    if (mode !== config.mode) setMode(config.mode);
    if (theme !== config.theme) setTheme(config.theme);
    if (printer !== config.printer) setPrinter(config.printer);
    if (running !== config.running) setRunning(config.running);
    if (search !== config.search) setSearch(config.search);
    if (paper !== config.paper) setPaper(config.paper);
  }

  function checkBackend() {
    const errServer = "Сервер НЕДОСТУПЕН";
    const errPrinter = "Принтер НЕДОСТУПЕН";

    sendDataServer("statePrinter")
      .then((res) => {
        if (status == errServer) {
          sendDataServer("firstRun").then((conf) => {
            const config = conf.config;
            updateConfig(config);
          });
        }
        if (!res.state) {
          setStatus(errPrinter);
        } else {
          setStatus("");
        }
      })
      .catch(() => {
        if (status !== errServer) setStatus(errServer);
      });
  }

  useEffect(() => {
    const interval = setInterval(checkBackend, 1000);
    return () => clearInterval(interval);
  }, [service, mode, theme, printer, running, search, paper, status]);

  return (
    <AppContext
      value={{
        service,
        setService,
        mode,
        setMode,
        printer,
        setPrinter,
        search,
        setSearch,
        running,
        setRunning,
        paper,
        setPaper,
        activeTab,
        setActiveTab,
        status,
        setStatus,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext>
  );
}

export const useAppContext = () => useContext(AppContext);
