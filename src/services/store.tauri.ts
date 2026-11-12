// Хранилище пользовательских настроек с реализацией для Tauri и браузера.
import { defaultConfig, type AppSettings } from "../config/defaultConfig";

const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

interface StoreService {
  get<K extends keyof AppSettings>(key: K): AppSettings[K];
  set<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void>;
  getAll(): AppSettings;
}

const memoryConfig = { ...defaultConfig };

// Динамическая валидация на основе defaultConfig
function isAppSettingsEntry(
  key: string,
  value: unknown,
): key is keyof AppSettings {
  // Проверяем, существует ли вообще такой ключ в дефолтном конфиге
  if (!(key in defaultConfig)) return false;

  // Для массива excludedTexts нельзя определять тип элементов через
  // defaultValue[0]: у пустого массива этот элемент равен undefined.
  if (key === "excludedTexts") {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
  }

  const defaultValue = defaultConfig[key as keyof AppSettings];

  // Обработка остальных массивов
  if (Array.isArray(defaultValue)) {
    return (
      Array.isArray(value) &&
      value.every((item) => typeof item === typeof defaultValue[0])
    );
  }

  // Для остальных типов (string, number, boolean) сравниваем типы напрямую
  return typeof value === typeof defaultValue;
}

interface TauriStore {
  entries(): Promise<[string, unknown][]>;
  set(key: string, value: unknown): Promise<void>;
}

let tauriStoreInstance: TauriStore | null = null;

/**
 * Инициализация хранилища.
 */
export const initStoreService = async (): Promise<void> => {
  if (!isTauri) {
    return;
  }

  try {
    const { load } = await import("@tauri-apps/plugin-store");
    tauriStoreInstance = (await load("config.json", {
      autoSave: true,
      defaults: { ...defaultConfig },
    })) as TauriStore;

    const entries = await tauriStoreInstance.entries();
    for (const [key, value] of entries) {
      if (isAppSettingsEntry(key, value)) {
        Object.assign(memoryConfig, { [key]: value });
      }
    }
    console.log("[Store] Успешно инициализировано хранилище Tauri");
  } catch (error) {
    console.error(
      "[Store] Ошибка инициализации Tauri Store, откат на memoryConfig:",
      error,
    );
  }
};

// ─── ЕДИНАЯ РЕАЛИЗАЦИЯ СЕРВИСА ───
export const storeService: StoreService = {
  get: (key) => memoryConfig[key],
  set: async (key, value) => {
    memoryConfig[key] = value;

    if (isTauri) {
      if (tauriStoreInstance) {
        await tauriStoreInstance.set(key, value);
      } else {
        console.warn(
          `[Store] Попытка записи ключа "${key}" до инициализации tauriStoreInstance`,
        );
      }
    } else {
      console.log(`[Mock Store] Ключ "${key}" изменен на:`, value);
    }
  },

  getAll: () => {
    return memoryConfig;
  },
};
