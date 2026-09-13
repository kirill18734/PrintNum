import { create } from "zustand";
import { storeService } from "./store.tauri";
import { appService } from "./app.tauri";

export const useAppStore = create((set) => ({
  // config.json
  theme: storeService.get("theme"),
  themeStyle: storeService.get("themeStyle"),
  running: storeService.get("running"),
  printer: storeService.get("printer"),
  paper: storeService.get("paper"),
  idNum: storeService.get("idNum"),
  endLine: storeService.get("endLine"),
  hybrid: storeService.get("hybrid"),
  expand: storeService.get("expand"),

  serverOnline: false,
  printerOnline: false,
  version: appService.getAppVersion(),
  isUpdate: appService.checkForUpdates(),
  installUpdate: false,

  setServerOnline: (serverOnline: boolean) => set({ serverOnline }),
  setPrinterOnline: (printerOnline: boolean) => set({ printerOnline }),
  setTheme: (theme: string) => {
    // Действие 1: Сохраняем в сторонний сервис (например, в плагин Tauri или LocalStorage)
    storeService.set("theme", theme);

    // Действие 2: Обновляем состояние в Zustand для триггера перерендера
    set({ theme });
  },
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  setVersion: (version: boolean) => set({ version }),
  setInstallUpdate: (installUpdate: boolean) => set({ installUpdate }),
}));
