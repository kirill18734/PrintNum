import { create } from "zustand";
import { defaultConfig } from "../config/defaultConfig";
import { storeService } from "./store.tauri";

// Вытаскиваем тип настроек из вашего конфига
type ConfigType = typeof defaultConfig;

// Описываем интерфейс всего состояния приложения
interface AppState extends ConfigType {
  // --- Состояния сети и принтера ---
  serverOnline: boolean;
  printerOnline: boolean;
  listPrinters: string[];
  version: string;
  isUpdate: boolean;

  // --- Системные экшены ---
  setServerOnline: (online: boolean) => void;
  setPrinterOnline: (online: boolean) => void;
  setListPrinters: (printers: string[]) => void;
  setVersion: (version: string) => void;
  setIsUpdate: (isUpdate: boolean) => void;

  // --- Экшены для настроек (динамический сеттер) ---
  // Позволяет обновить любой ключ из config.json
  setConfigValue: <K extends keyof ConfigType>(
    key: K,
    value: ConfigType[K],
  ) => void;

  // Метод для начальной загрузки всех настроек из Tauri на старте приложения
  initStore: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  // 1. Инициализируем настройки дефолтными значениями из defaultConfig
  ...defaultConfig,

  // 2. Начальные значения для статусов бэкенда
  serverOnline: false,
  printerOnline: false,
  listPrinters: [],
  version: "",
  isUpdate: false,

  // 3. Изменение статусов бэкенда
  setServerOnline: (online) => set({ serverOnline: online }),
  setPrinterOnline: (online) => set({ printerOnline: online }),
  setListPrinters: (printers) => set({ listPrinters: printers }),
  setVersion: (version) => set({ version }),
  setIsUpdate: (isUpdate) => set({ isUpdate }),

  // 4. Умный синхронно-асинхронный сеттер настроек
  setConfigValue: (key, value) => {
    // Сначала МГНОВЕННО обновляем состояние в React (интерфейс не ждет диск)
    set({ [key]: value } as any);

    // Затем асинхронно сохраняем на диск в config.json через ваш storeService
    storeService.set(key, value).catch((err) => {
      console.error(`Ошибка сохранения ключа ${String(key)} на диск:`, err);
    });
  },

  // 5. Загрузка данных с диска при старте приложения
  initStore: async () => {
    try {
      const savedConfig = await storeService.getAll();
      // Обновляем стор только теми ключами, которые реально пришли из хранилища
      set(savedConfig);
    } catch (error) {
      console.error(
        "Не удалось загрузить настройки с диска, используются дефолтные:",
        error,
      );
    }
  },
}));
