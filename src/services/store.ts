// Типизированное глобальное состояние приложения и действия для его обновления.
import { create } from "zustand";
import type { AppSettings } from "@/config/defaultConfig";
import { storeService } from "./store.tauri";

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

interface AppStore extends AppSettings {
  serverOnline: boolean;
  printerOnline: boolean;
  isUpdate: boolean;
  isUpdating: boolean;
  installUpdate: boolean;
  listPrinters: string[];
  listFonts: string[];
  listBackgrounds: string[];
  dataBackgrounds: {};
  listPapers: string[];
  setSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void>;
  setConnectionStatus(serverOnline: boolean, printerOnline: boolean): void;
  setListPrinters(printers: string[] | ((current: string[]) => string[])): void;
  setListFonts(fonts: string[] | ((current: string[]) => string[])): void;
  setListBackgrounds(
    backgrounds: string[] | ((current: string[]) => string[]),
  ): void;
  setDataBackgrounds(
    dataBackgrounds:
      | Record<string, string>
      | ((current: Record<string, string>) => Record<string, string>),
  ): void;
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
  listFonts: [],
  listBackgrounds: [],
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
  setConnectionStatus: (serverOnline, printerOnline) =>
    set({ serverOnline, printerOnline }),
  setListPrinters: (printers) =>
    set((state) => ({
      listPrinters:
        typeof printers === "function"
          ? printers(state.listPrinters)
          : printers,
    })),
  setListFonts: (fonts) =>
    set((state) => ({
      listFonts: typeof fonts === "function" ? fonts(state.listFonts) : fonts,
    })),
  setListBackgrounds: (background) =>
    set((state) => ({
      listBackgrounds:
        typeof background === "function"
          ? background(state.listBackgrounds)
          : background,
    })),
  setDataBackgrounds: (background) =>
    set((state) => ({
      dataBackgrounds:
        typeof background === "function"
          ? background(state.dataBackgrounds)
          : background,
    })),
  setIsUpdate: (isUpdate) => set({ isUpdate }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  setInstallUpdate: (installUpdate) => set({ installUpdate }),
}));
// Типизированное глобальное состояние приложения и действия для его обновления.
