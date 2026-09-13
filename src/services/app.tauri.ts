const isTauri = typeof window !== "undefined" && "__TAURI_METADATA__" in window;

// Описываем интерфейс, чтобы React всегда знал, какие методы доступны
interface IAppService {
  getAppVersion(): any;
  openExternalUrl(url: string): any;
  checkForUpdates(): any;
  installAndRelaunch(): any;
  initCloseHandler(): any;
  closeWindow(): any;
  initStartHandler(): any;
  minWindow(): any;
  visibleWindow(): any;
}

// Переменные для веб-заглушки обновлений
let isUpdateCheckedMock = false;

// ─── РЕАЛИЗАЦИЯ ДЛЯ БРАУЗЕРА (MOCK) ───
const webAppService: IAppService = {
  getAppVersion: async () => "2.0.0",
  openExternalUrl: async (url) => {
    window.open(url, "_blank");
  },
  checkForUpdates: async () => {
    if (isUpdateCheckedMock) return false;
    isUpdateCheckedMock = true;

    return true; // Имитируем, что обновление найдено
  },
  installAndRelaunch: async () => {
    alert("Приложение обновилось бы и перезапустилось в Tauri!");
  },
  visibleWindow: async () => {},
  minWindow: async () => {},
  closeWindow: async () => {},
  initCloseHandler: async () => {
    // В браузере закрытие вкладки обрабатывать не нужно
  },
  initStartHandler: async () => {
    // В браузере открытие вкладки обрабатывать не нужно
  },
};

// ─── РЕАЛИЗАЦИЯ ДЛЯ TAURI V2 ───
let realUpdateObject: any = null;
let isUpdateCheckedReal = false;

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
    if (isUpdateCheckedReal) return !!realUpdateObject;
    isUpdateCheckedReal = true;

    const { check } = await import("@tauri-apps/plugin-updater");
    const update = await check();
    if (!update) return false;

    realUpdateObject = update;
    return true;
  },

  installAndRelaunch: async () => {
    if (!realUpdateObject) {
      console.error("No update object found. Run checkForUpdates first.");
      return;
    }
    const { Command } = await import("@tauri-apps/plugin-shell");
    const { relaunch } = await import("@tauri-apps/plugin-process");

    await Command.create("stop_backend").execute();
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
    const { Command } = await import("@tauri-apps/plugin-shell");

    // ---------- Остановка backend ----------
    getCurrentWindow().onCloseRequested(() => {
      Command.create("stop_backend").execute();
    });
  },
  initStartHandler: async () => {
    const { Command } = await import("@tauri-apps/plugin-shell");

    Command.create("start_backend").execute();
  },
};

export const appService = isTauri ? tauriAppService : webAppService;
