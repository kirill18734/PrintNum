import { defaultConfig } from "../config/defaultConfig";

const isTauri = typeof window !== "undefined" && "__TAURI_METADATA__" in window;

// Интерфейс теперь полностью синхронный на чтение
interface IStoreService {
  get(key: string): any;
  set(key: string, value: any): Promise<void>; // Запись остается асинхронной
  getAll(): Record<string, any>;
}

// Единый источник правды в оперативной памяти для быстрого синхронного доступа
const memoryConfig = { ...defaultConfig };

// Ссылка на инстанс Tauri Store
let tauriStoreInstance: any = null;

/**
 * Инициализация хранилища.
 * Этот метод необходимо вызвать ОДИН раз при старте приложения (например, в main.ts или корневом компоненте),
 * прежде чем Zustand или другие сервисы начнут читать конфиг.
 */
export const initStoreService = async (): Promise<void> => {
  if (!isTauri) {
    // Для браузера данные уже в memoryConfig из defaultConfig
    return;
  }

  try {
    const { load } = await import("@tauri-apps/plugin-store");
    tauriStoreInstance = await load("config.json", {
      autoSave: true,
      defaults: defaultConfig,
    });

    // Выкачиваем все данные из файла в оперативную память для синхронного доступа
    const entries = await tauriStoreInstance.entries();
    Object.assign(memoryConfig, Object.fromEntries(entries));
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
export const storeService: IStoreService = {
  get: (key) => {
    return (memoryConfig as Record<string, any>)[key] ?? null;
  },

  set: async (key, value) => {
    // 1. Сразу синхронно обновляем оперативную память
    (memoryConfig as Record<string, any>)[key] = value;

    // 2. Асинхронно сохраняем изменения в зависимости от среды
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
