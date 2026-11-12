// Типизированное глобальное состояние приложения и действия для его обновления.
import { create } from "zustand";
import type { AppSettings, PaperFormat } from "@/config/defaultConfig";
import { storeService } from "./store.tauri";
import type { StatusCardProps } from "@/types/printJob";
import type { BackgroundItem, FontItem } from "@/types/api";
export type { BackgroundItem, FontItem } from "@/types/api";

import { listPapers } from "@/config/defaultConfig";

interface AppStore extends AppSettings {
  serverOnline: boolean;
  printerOnline: boolean;
  isUpdate: boolean;
  isUpdating: boolean;
  installUpdate: boolean;
  listPrinters: string[];
  printJobs: StatusCardProps[];
  dataFonts: FontItem[];
  dataBackgrounds: BackgroundItem[];
  listPapers: PaperFormat[];

  setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void>;
  setServerOnline(serverOnline: boolean): void;
  setPrinterOnline(printerOnline: boolean): void;
  setListPrinters(printers: string[] | ((current: string[]) => string[])): void;
  setDataBackgrounds: (
    next: BackgroundItem[] | ((current: BackgroundItem[]) => BackgroundItem[]),
  ) => void;

  setPrintJobs: (
    next:
      | StatusCardProps[]
      | ((current: StatusCardProps[]) => StatusCardProps[]),
  ) => void;

  setDataFonts: (
    next: FontItem[] | ((current: FontItem[]) => FontItem[]),
  ) => void;
  setIsUpdate(isUpdate: boolean): void;
  setIsUpdating(isUpdating: boolean): void;
  setInstallUpdate(installUpdate: boolean): void;
}

export const useAppStore = create<AppStore>((set) => ({
  ...storeService.getAll(),
  serverOnline: false,
  printerOnline: false,
  isUpdate: false,
  isUpdating: false,
  installUpdate: false,
  listPrinters: [],
  printJobs: [],

  dataFonts: [],
  dataBackgrounds: [],
  listPapers,
  setSetting: async (key, value) => {
    try {
      await storeService.set(key, value);
      set((state) => ({ ...state, [key]: value }));
    } catch (error) {
      console.error(`Ошибка сохранения настройки "${key}":`, error);
      throw error;
    }
  },
  setPrintJobs: (next) =>
    set((state) => ({
      printJobs: typeof next === "function" ? next(state.printJobs) : next,
    })),
  setServerOnline: (serverOnline) => set({ serverOnline }),
  setPrinterOnline: (printerOnline) => set({ printerOnline }),
  setListPrinters: (printers) =>
    set((state) => ({
      listPrinters:
        typeof printers === "function"
          ? printers(state.listPrinters)
          : printers,
    })),
  setDataFonts: (next) =>
    set((state) => ({
      // Проверяем, функция перед нами или готовый массив
      dataFonts: typeof next === "function" ? next(state.dataFonts) : next,
    })),
  setDataBackgrounds: (next) =>
    set((state) => ({
      // Проверяем, функция перед нами или готовый массив
      dataBackgrounds:
        typeof next === "function" ? next(state.dataBackgrounds) : next,
    })),
  setIsUpdate: (isUpdate) => set({ isUpdate }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  setInstallUpdate: (installUpdate) => set({ installUpdate }),
}));
// Типизированное глобальное состояние приложения и действия для его обновления.
