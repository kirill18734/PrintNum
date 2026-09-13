import { create } from "zustand";
import { storeService } from "./store.tauri";
import { appService } from "./app.tauri";
import { defaultConfig } from "@/config/defaultConfig";

export const useAppStore = create((set) => ({
  // 1. Инициализируем синхронными заглушками, чтобы UI не падал
  ...defaultConfig,

  serverOnline: false,
  printerOnline: false,
  version: "",
  isUpdate: false,
  installUpdate: false,

  // Флаг готовности данных (аналог вашего const [loaded, setLoaded])
  isHydrated: false,

  // 2. Аналог вашего первого useEffect — асинхронная загрузка ВСЕХ данных при старте
  hydrate: async () => {
    try {
      // Загружаем данные из config.json
      const config = await storeService.getAll();

      // Загружаем данные из appService
      const version = await appService.getAppVersion();
      const isUpdate = await appService.checkForUpdates();

      set({
        ...config, // Применяем сохраненные значения поверх дефолтных
        version,
        isUpdate,
        isHydrated: true, // Данные готовы, промисов больше нет
      });
    } catch (e) {
      console.error("Ошибка загрузки конфига:", e);
      set({ isHydrated: true });
    }
  },

  // 3. Сеттеры (аналог вашего второго useEffect — запись изменений на диск)
  setTheme: async (theme: string) => {
    await storeService.set("theme", theme); // Пишем в Tauri JSON
    set({ theme }); // Обновляем в Zustand (строка, не Promise)
  },

  setServerOnline: (serverOnline: boolean) => set({ serverOnline }),
  setPrinterOnline: (printerOnline: boolean) => set({ printerOnline }),
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  setVersion: (version: string) => set({ version }),
  setInstallUpdate: (installUpdate: boolean) => set({ installUpdate }),
}));
