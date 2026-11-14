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
}

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


};

// ─── ЭКСПОРТ СЕРВИСА ───

export const appService: IAppService = isTauri
  ? tauriAppService
  : webAppService;
