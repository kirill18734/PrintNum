// Адаптер системных возможностей приложения для Tauri и браузерного режима.

export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

// Описываем интерфейс, чтобы React всегда знал,
// какие методы доступны.
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
  getAvailableImages(): Promise<string[]>;
}

// ─── ПОЛУЧЕНИЕ СПИСКА РЕСУРСОВ ───
const getResourceFiles = async (
  folder: "fonts" | "images",
  extensions: string[],
): Promise<string[]> => {
  try {
    const { readDir, BaseDirectory } = await import("@tauri-apps/plugin-fs");

    const entries = await readDir(`resources\\${folder}`, {
      baseDir: BaseDirectory.AppLocalData,
    });

    const files = entries
      .filter((entry) => {
        if (!entry.isFile || !entry.name) return false;

        const extension = entry.name.split(".").pop()?.toLowerCase();

        return extension ? extensions.includes(extension) : false;
      })
      .map((entry) => entry.name!.replace(/\.[^.]+$/, ""));

    const result = folder === "fonts" ? [...files, "Arial"] : files;

    return [...new Set(result)].sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error(`Не удалось получить список ресурсов (${folder}):`, error);

    return folder === "fonts" ? ["Arial"] : [];
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
  getAvailableImages: async () => [],
};

// ─── РЕАЛИЗАЦИЯ ДЛЯ TAURI V2 ───

interface UpdateHandle {
  downloadAndInstall(): Promise<void>;
}

let realUpdateObject: UpdateHandle | null = null;

let backendChild: import("@tauri-apps/plugin-shell").Child | null = null;

const tauriAppService: IAppService = {
  getAppVersion: async () => {
    const { invoke } = await import("@tauri-apps/api/core");

    const message = await invoke("get_version");

    return message ? `${message}` : "";
  },

  openExternalUrl: async (url) => {
    const { open } = await import("@tauri-apps/plugin-shell");

    await open(url);
  },

  checkForUpdates: async () => {
    // Если уже есть объект обновления,
    // повторно сеть не дергаем.
    if (realUpdateObject) return true;

    const { check } = await import("@tauri-apps/plugin-updater");

    try {
      const update = await check();

      if (!update) {
        return false;
      }

      realUpdateObject = update;

      return true;
    } catch (e) {
      console.error("Update check failed:", e);

      return false;
    }
  },

  installAndRelaunch: async () => {
    if (!realUpdateObject) {
      console.error("No update object found. Run checkForUpdates first.");

      return;
    }

    const { relaunch } = await import("@tauri-apps/plugin-process");

    // Пытаемся корректно остановить backend без PowerShell.
    try {
      await fetch("http://127.0.0.1:5000/shutdown", {
        method: "POST",
        headers: {
          "X-PrintNum-Shutdown": "local-client",
        },
      });
    } catch {}

    try {
      if (backendChild) {
        await backendChild.kill();
        backendChild = null;
      }
    } catch {}

    await realUpdateObject.downloadAndInstall();

    await relaunch();
  },

  visibleWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    getCurrentWindow().show();
  },

  minWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    getCurrentWindow().minimize();
  },

  closeWindow: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    const window = getCurrentWindow();

    await window.close();
  },

  initCloseHandler: async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");

    await getCurrentWindow().onCloseRequested(async () => {
      // Сигналим бэкенду завершиться через HTTP.
      try {
        await fetch("http://127.0.0.1:5000/shutdown", {
          method: "POST",
          headers: {
            "X-PrintNum-Shutdown": "local-client",
          },
        });
      } catch {}

      // Fallback: убиваем дочерний процесс sidecar.
      try {
        if (backendChild) {
          await backendChild.kill();
          backendChild = null;
        }
      } catch {}
    });
  },

  initStartHandler: async () => {
    const { Command } = await import("@tauri-apps/plugin-shell");

    const isReachable = async () =>
      fetch("http://127.0.0.1:5000/", {
        method: "GET",
      })
        .then(() => true)
        .catch(() => false);

    if (await isReachable()) return;

    try {
      // Стартуем sidecar.
      backendChild = await Command.sidecar("../backend/output/backend").spawn();
    } catch (e) {
      console.error("Не удалось запустить backend sidecar:", e);

      return;
    }

    // Дожидаемся готовности HTTP-сервера.
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

  getAvailableImages: async () => {
    const imagesCache = await getResourceFiles("images", [
      "png",
      "jpg",
      "jpeg",
      "webp",
    ]);

    return imagesCache;
  },
};

// ─── ЭКСПОРТ СЕРВИСА ───

export const appService = isTauri ? tauriAppService : webAppService;
