// Адаптер системных возможностей приложения для Tauri и браузерного режима.

export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

// ─── ИНТЕРФЕЙС СИСТЕМНОГО СЕРВИСА ───

interface IAppService {
  getAppVersion(): Promise<string>;
  openExternalUrl(url: string): Promise<void>;
  checkForUpdates(): Promise<boolean>;
  installAndRelaunch(): Promise<void>;
  initCloseHandler(): Promise<void>;
  closeWindow(): Promise<void>;
  initStartHandler(): Promise<void>;
  minWindow(): Promise<void>;
  visibleWindow(): Promise<void>;

  // Ресурсы приложения
  getAvailableFonts(): Promise<string[]>;
  getAvailableBackgrounds(): Promise<string[]>;
  getDataBackgrounds(): Promise<Record<string, string>>;
}

// ─── КОНСТАНТЫ ИЗОБРАЖЕНИЙ ───

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

// ─── ДОБАВЛЕНИЕ ИЗОБРАЖЕНИЙ ───

export const addBackgroundImages = async (): Promise<void> => {
  try {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readFile, writeFile, BaseDirectory, mkdir } =
      await import("@tauri-apps/plugin-fs");

    // Выбор нескольких изображений
    const selectedFiles = await open({
      multiple: true,
      directory: false,
      filters: [
        {
          name: "Изображения",
          extensions: IMAGE_EXTENSIONS,
        },
      ],
    });

    if (!selectedFiles || !Array.isArray(selectedFiles)) return;

    // Сохраняем выбранные изображения
    await Promise.all(
      selectedFiles.map(async (filePath) => {
        const fileName = filePath.split(/[\\/]/).pop();

        if (!fileName) return;

        const bytes = await readFile(filePath);

        await writeFile(`resources/images/${fileName}`, bytes, {
          baseDir: BaseDirectory.AppLocalData,
        });
      }),
    );
  } catch (error) {
    console.error("Не удалось добавить изображения:", error);
  }
};

// ─── ПОЛУЧЕНИЕ СПИСКА РЕСУРСОВ ───
const getResourceFiles = async (
  folder: "fonts" | "images",
  extensions: string[],
): Promise<string[]> => {
  try {
    const { readDir, BaseDirectory } = await import("@tauri-apps/plugin-fs");

    const entries = await readDir(`resources/${folder}`, {
      baseDir: BaseDirectory.AppLocalData,
    });

    const files = entries
      .filter((entry) => {
        if (!entry.isFile || !entry.name) return false;

        const extension = entry.name.split(".").pop()?.toLowerCase();

        return extension ? extensions.includes(extension) : false;
      })
      .map((entry) => entry.name!.replace(/\.[^.]+$/, ""));

    const defaultResource = {
      fonts: "Arial",
      images: "Без фона",
    };

    const result = [...files, defaultResource[folder]];

    return [...new Set(result)].sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(`Не удалось получить список ресурсов (${folder}):`, error);

    return folder === "fonts" ? ["Arial"] : ["Без фона"];
  }
};

// ─── ПОЛУЧЕНИЕ ИЗОБРАЖЕНИЙ В BASE64 ───

const getDataBackgrounds = async (): Promise<Record<string, string>> => {
  try {
    const { readDir, readFile, BaseDirectory } =
      await import("@tauri-apps/plugin-fs");

    const entries = await readDir("resources/images", {
      baseDir: BaseDirectory.AppLocalData,
    });

    const imageEntries = entries.filter((entry) => {
      if (!entry.isFile || !entry.name) return false;

      const extension = entry.name.split(".").pop()?.toLowerCase();

      return extension ? IMAGE_EXTENSIONS.includes(extension) : false;
    });

    const images: Record<string, string> = {};

    // Читаем изображения параллельно
    await Promise.all(
      imageEntries.map(async (entry) => {
        try {
          const fileName = entry.name!;
          const extension = fileName.split(".").pop()!.toLowerCase();

          const resourceName = fileName.replace(/\.[^.]+$/, "");

          // Получаем содержимое изображения
          const bytes = await readFile(`resources/images/${fileName}`, {
            baseDir: BaseDirectory.AppLocalData,
          });

          // Uint8Array -> Base64
          let binary = "";

          const chunkSize = 0x8000;

          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);

            binary += String.fromCharCode(...chunk);
          }

          const base64 = btoa(binary);

          const mimeType = IMAGE_MIME_TYPES[extension];

          // Формируем Data URL
          images[resourceName] = `data:${mimeType};base64,${base64}`;
        } catch (error) {
          console.error(
            `Не удалось загрузить изображение ${entry.name}:`,
            error,
          );
        }
      }),
    );

    return images;
  } catch (error) {
    console.error("Не удалось получить изображения:", error);

    return {};
  }
};

// ─── РЕАЛИЗАЦИЯ ДЛЯ БРАУЗЕРА (MOCK) ───

const webAppService: IAppService = {
  getAppVersion: async () => "2.0.0",

  openExternalUrl: async (url) => {
    window.open(url, "_blank");
  },

  checkForUpdates: async () => {
    return true;
  },

  installAndRelaunch: async () => {},

  visibleWindow: async () => {},
  minWindow: async () => {},
  closeWindow: async () => {},
  initCloseHandler: async () => {},
  initStartHandler: async () => {},

  // Ресурсы в браузерном режиме недоступны
  getAvailableFonts: async () => ["Arial"],

  getAvailableBackgrounds: async () => ["Без фона"],

  getDataBackgrounds: async () => ({}),
};

// ─── РЕАЛИЗАЦИЯ ДЛЯ TAURI V2 ───

interface UpdateHandle {
  downloadAndInstall(): Promise<void>;
}

let realUpdateObject: UpdateHandle | null = null;

let backendChild: import("@tauri-apps/plugin-shell").Child | null = null;

const tauriAppService: IAppService = {
  // ─── ВЕРСИЯ ПРИЛОЖЕНИЯ ───

  getAppVersion: async () => {
    const { invoke } = await import("@tauri-apps/api/core");

    const message = await invoke("get_version");

    return message ? `${message}` : "";
  },

  // ─── ОТКРЫТИЕ ВНЕШНЕЙ ССЫЛКИ ───

  openExternalUrl: async (url) => {
    const { open } = await import("@tauri-apps/plugin-shell");

    await open(url);
  },

  // ─── ПРОВЕРКА ОБНОВЛЕНИЙ ───

  checkForUpdates: async () => {
    if (realUpdateObject) return true;

    const { check } = await import("@tauri-apps/plugin-updater");

    try {
      const update = await check();

      if (!update) {
        return false;
      }

      realUpdateObject = update;

      return true;
    } catch (error) {
      console.error("Update check failed:", error);

      return false;
    }
  },

  // ─── УСТАНОВКА ОБНОВЛЕНИЯ ───

  installAndRelaunch: async () => {
    if (!realUpdateObject) {
      console.error("No update object found. Run checkForUpdates first.");

      return;
    }

    const { relaunch } = await import("@tauri-apps/plugin-process");

    // Останавливаем backend через HTTP
    try {
      await fetch("http://127.0.0.1:5000/shutdown", {
        method: "POST",
        headers: {
          "X-PrintNum-Shutdown": "local-client",
        },
      });
    } catch {}

    // Fallback: завершаем дочерний процесс
    try {
      if (backendChild) {
        await backendChild.kill();

        backendChild = null;
      }
    } catch {}

    await realUpdateObject.downloadAndInstall();

    await relaunch();
  },

  // ─── УПРАВЛЕНИЕ ОКНОМ ───

  visibleWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    await getCurrentWindow().show();
  },

  minWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    await getCurrentWindow().minimize();
  },

  closeWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    const window = getCurrentWindow();

    await window.close();
  },

  // ─── ОБРАБОТЧИК ЗАКРЫТИЯ ───

  initCloseHandler: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    await getCurrentWindow().onCloseRequested(async () => {
      // Сигналим backend завершиться через HTTP
      try {
        await fetch("http://127.0.0.1:5000/shutdown", {
          method: "POST",
          headers: {
            "X-PrintNum-Shutdown": "local-client",
          },
        });
      } catch {}

      // Fallback: завершаем sidecar
      try {
        if (backendChild) {
          await backendChild.kill();

          backendChild = null;
        }
      } catch {}
    });
  },

  // ─── ЗАПУСК BACKEND ───

  initStartHandler: async () => {
    const { Command } = await import("@tauri-apps/plugin-shell");

    const isReachable = async () =>
      fetch("http://127.0.0.1:5000/", {
        method: "GET",
      })
        .then(() => true)
        .catch(() => false);

    // Если backend уже работает, повторно не запускаем
    if (await isReachable()) return;

    try {
      backendChild = await Command.sidecar("../backend/output/backend").spawn();
    } catch (error) {
      console.error("Не удалось запустить backend sidecar:", error);

      return;
    }

    // Ожидаем готовности HTTP-сервера
    const maxAttempts = 40;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < maxAttempts; i++) {
      if (await isReachable()) return;

      await delay(250);
    }

    console.warn("Backend запущен, но не отвечает на 127.0.0.1:5000");
  },

  // ─── РЕСУРСЫ ───

  getAvailableFonts: async () => {
    return await getResourceFiles("fonts", ["ttf"]);
  },

  getAvailableBackgrounds: async () => {
    return await getResourceFiles("images", IMAGE_EXTENSIONS);
  },

  getDataBackgrounds: async () => {
    return await getDataBackgrounds();
  },
};

// ─── ЭКСПОРТ СЕРВИСА ───

export const appService: IAppService = isTauri
  ? tauriAppService
  : webAppService;
