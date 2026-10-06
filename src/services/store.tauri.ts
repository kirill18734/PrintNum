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

function isAppSettingsEntry(
  key: string,
  value: unknown,
): key is keyof AppSettings {
  switch (key) {
    case "printer":
    case "paper":
    case "themeStyle":
      return typeof value === "string";
    case "running":
    case "hybrid":
    case "idNum":
    case "endLine":
      return typeof value === "boolean";
    case "expand":
      return typeof value === "number" || value === "";
    case "theme":
      return value === "system" || value === "light" || value === "dark";
    case "excludedTexts":
      return (
        Array.isArray(value) &&
        value.every((item): item is string => typeof item === "string")
      );
    default:
      return false;
  }
}

interface TauriStore {
  entries(): Promise<[string, unknown][]>;
  set(key: string, value: unknown): Promise<void>;
}

let tauriStoreInstance: TauriStore | null = null;

/**
 * Инициализация хранилища.
 * Этот метод необходимо вызвать ОДИН раз при старте приложения,
 * прежде чем Zustand или другие сервисы начнут читать конфиг.
 */
export const initStoreService = async (): Promise<void> => {
  if (!isTauri) {
    // Для браузера данные уже в memoryConfig из defaultConfig
    return;
  }

  try {
    const { load } = await import("@tauri-apps/plugin-store");
    tauriStoreInstance = (await load("config.json", {
      autoSave: true,
      defaults: { ...defaultConfig },
    })) as TauriStore;

    // Выкачиваем все данные из файла в оперативную память для синхронного доступа
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
// Больше нет нужды разделять web и tauri на два разных объекта,
// так как чтение всегда идет из memoryConfig, а логика ветвится только при записи.
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
// Хранилище пользовательских настроек с реализацией для Tauri и браузера.
