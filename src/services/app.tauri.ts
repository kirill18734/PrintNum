// Адаптер системных возможностей приложения для Tauri и браузерного режима.
export const isTauri = typeof window !== "undefined" && "__TAURI__" in window;

// Описываем интерфейс, чтобы React всегда знал, какие методы доступны
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

// Переменные для веб-заглушки обновлений

// ─── РЕАЛИЗАЦИЯ ДЛЯ БРАУЗЕРА (MOCK) ───
const webAppService: IAppService = {
  getAppVersion: async () => "2.0.0",
  openExternalUrl: async (url) => {
    window.open(url, "_blank");
  },
  checkForUpdates: async () => {
    return true; // Имитируем, что обновление найдено
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
    // Если уже есть объект обновления, повторно сеть не дергаем
    if (realUpdateObject) return true;

    const { check } = await import("@tauri-apps/plugin-updater");
    try {
      const update = await check();
      console.log(update);

      if (!update) {
        // Не кэшируем отрицательный результат — позволяем перепроверить позже
        return false;
      }

      realUpdateObject = update;
      return true;
    } catch (e) {
      console.error("Update check failed:", e);
      // После ошибки позволяем перепроверить
      return false;
    }
  },

  installAndRelaunch: async () => {
    if (!realUpdateObject) {
      console.error("No update object found. Run checkForUpdates first.");
      return;
    }
    const { relaunch } = await import("@tauri-apps/plugin-process");

    // Пытаемся корректно остановить backend без PowerShell
    try {
      await fetch("http://127.0.0.1:5000/shutdown", {
        method: "POST",
        headers: { "X-PrintNum-Shutdown": "local-client" },
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
      // Сигналим бэкенду завершиться через HTTP (если доступен)
      try {
        await fetch("http://127.0.0.1:5000/shutdown", {
          method: "POST",
          headers: { "X-PrintNum-Shutdown": "local-client" },
        });
      } catch {}
      // Fallback: убиваем дочерний процесс sidecar, если запущен
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
      fetch("http://127.0.0.1:5000/", { method: "GET" })
        .then(() => true)
        .catch(() => false);

    if (await isReachable()) return;

    try {
      // Стартуем сайдкар, имя берётся из имени бинарника (backend.exe)
      backendChild = await Command.sidecar("../backend/output/backend").spawn();
    } catch (e) {
      console.error("Не удалось запустить backend sidecar:", e);
      return;
    }

    // Дожидаемся готовности HTTP-сервера бэкенда
    const maxAttempts = 40; // ~10 секунд при шаге 250мс
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < maxAttempts; i++) {
      if (await isReachable()) return;
      await delay(250);
    }
    console.warn("Backend запущен, но не отвечает на 127.0.0.1:5000");
  },
};

export const appService = isTauri ? tauriAppService : webAppService;
// Адаптер системных возможностей приложения для Tauri и браузерного режима.
