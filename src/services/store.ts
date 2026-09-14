import { create } from "zustand";
import { storeService } from "./store.tauri";

export const useAppStore = create((set) => ({
  // 1. Инициализируем синхронными заглушками из Tauri JSON
  ...storeService.getAll(),

  serverOnline: false,
  printerOnline: false,
  version: "2.0.0",
  isUpdate: false,
  installUpdate: false,
  listPrinters: [],
  listPapers: [
    "30*20",
    "40*30",
    "43*25",
    "50*70",
    "58*40",
    "60*40",
    "75*120",
    "100*150",
  ],

  // 2. Универсальный сеттер для ЛЮБЫХ данных, которые нужно сохранять на диск
  updateStoreTauriValue: async (key: string, value: any) => {
    try {
      await storeService.set(key, value); // Пишем в Tauri JSON
      set({ [key]: value }); // Синхронно обновляем Zustand
    } catch (error) {
      console.error(`Ошибка сохранения ключа "${key}" на диск:`, error);
    }
  },

  // 3. Обычные сеттеры для локального стейта (не пишутся на диск)
  setServerOnline: (serverOnline: boolean) => set({ serverOnline }),
  setPrinterOnline: (printerOnline: boolean) => set({ printerOnline }),
  setListPrinters: (listPrinters: any) => set({ listPrinters }),
  setIsUpdate: (isUpdate: boolean) => set({ isUpdate }),
  setVersion: (version: string) => set({ version }),
  setInstallUpdate: (installUpdate: boolean) => set({ installUpdate }),
}));
