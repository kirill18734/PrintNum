import { defaultConfig } from "../config/defaultConfig";

const isTauri = typeof window !== "undefined" && "__TAURI_METADATA__" in window;

interface IStoreService {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  getAll(): Promise<Record<string, any>>;
}

// Временный объект в оперативной памяти браузера для отслеживания изменений во время сессии
const memoryConfig = { ...defaultConfig };

// ─── РЕАЛИЗАЦИЯ ДЛЯ БРАУЗЕРА ───
const webStoreService: IStoreService = {
  get: async (key) => {
    return (memoryConfig as Record<string, any>)[key] ?? null;
  },

  set: async (key, value) => {
    (memoryConfig as Record<string, any>)[key] = value;
    console.log(`[Mock Store] Ключ "${key}" изменен на:`, value);
  },

  getAll: async () => {
    return memoryConfig;
  },
};

// ─── РЕАЛИЗАЦИЯ ДЛЯ TAURI V2 ───
let tauriStoreInstance: any = null;

const getTauriStore = async () => {
  if (tauriStoreInstance) return tauriStoreInstance;
  const { load } = await import("@tauri-apps/plugin-store");
  tauriStoreInstance = await load("config.json", {
    autoSave: true,
    defaults: defaultConfig, // Если файла на диске нет, Tauri Store возьмет данные из defaultConfig
  });
  return tauriStoreInstance;
};

const tauriStoreService: IStoreService = {
  get: async (key) => {
    const store = await getTauriStore();
    return await store.get(key);
  },

  set: async (key, value) => {
    const store = await getTauriStore();
    await store.set(key, value);
  },

  getAll: async () => {
    const store = await getTauriStore();
    const entries = await store.entries();
    return Object.fromEntries(entries);
  },
};

// Экспортируем только сервис для Zustand. Никакого реактивного кода тут больше нет!
export const storeService = isTauri ? tauriStoreService : webStoreService;
