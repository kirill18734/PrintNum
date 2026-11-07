// Управляет темой, запуском backend, обновлениями и периодической проверкой устройств.
import { useEffect } from "react";
import { appService } from "@/services/app.tauri";
import { useAppStore } from "@/services/store";
import { backendClient } from "@/shared/api/backendClient";

export function useAppRuntime(): void {
  const theme = useAppStore((state) => state.theme);
  const themeStyle = useAppStore((state) => state.themeStyle);

  // стиль
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("theme-style") !== themeStyle) {
      root.setAttribute("theme-style", themeStyle);
    }
  }, [themeStyle]);

  // тема
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
      void useAppStore
        .getState()
        .setSetting("theme", isDark ? "dark" : "light");
      return;
    }
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    let active = true;
    let printerErrorLogged = false;
    let statusErrorLogged = false;

    const runPlatformTask = (name: string, task: () => Promise<unknown>) => {
      void task().catch((error: unknown) => {
        console.error(
          `Не удалось выполнить действие платформы (${name}):`,
          error,
        );
      });
    };

    runPlatformTask("инициализация обработчика закрытия", () =>
      appService.initCloseHandler(),
    );
    runPlatformTask("запуск backend", () => appService.initStartHandler());
    runPlatformTask("показ окна", () => appService.visibleWindow());
    runPlatformTask("проверка обновлений", async () => {
      const available = await appService.checkForUpdates();
      if (active) useAppStore.getState().setIsUpdate(available);
    });

    const refreshPrinters = async () => {
      try {
        const printers = await backendClient.getPrinters();
        if (!active) return;
        useAppStore
          .getState()
          .setListPrinters((current) =>
            JSON.stringify(current) === JSON.stringify(printers)
              ? current
              : printers,
          );
        printerErrorLogged = false;
      } catch (error) {
        if (!active) return;
        useAppStore.getState().setListPrinters([]);
        if (!printerErrorLogged) {
          console.error("Не удалось получить список принтеров:", error);
          printerErrorLogged = true;
        }
      }
    };

    const loadGoogleFonts = (fonts: any) => {
      const id = "google-fonts";

      let link: any = document.getElementById(id);

      const families = [
        ...new Set(
          fonts
            .map((font: string) => font.split("-")[0])
            .filter((font: string) => font !== "Arial")
            .map((font: string) => font.replace(/([a-z])([A-Z])/g, "$1 $2")),
        ),
      ].map((font: any) => `family=${encodeURIComponent(font)}`);

      if (!families.length) {
        link?.remove();
        return;
      }

      if (!link) {
        link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }

      link.href = `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
    };

    const refreshFonts = async () => {
      try {
        const fonts = await appService.getAvailableFonts();
        if (!active) return;

        loadGoogleFonts(fonts);

        useAppStore
          .getState()
          .setListFonts((current) =>
            JSON.stringify(current) === JSON.stringify(fonts) ? current : fonts,
          );

        printerErrorLogged = false;
      } catch (error) {
        if (!active) return;

        useAppStore.getState().setListFonts([]);

        if (!printerErrorLogged) {
          console.error("Не удалось получить список шрифтов:", error);
          printerErrorLogged = true;
        }
      }
    };

    const refreshBackgrounds = async () => {
      try {
        const background = await appService.getAvailableBackgrounds();

        if (!active) return;

        const store = useAppStore.getState();

        const isChanged =
          JSON.stringify(store.listBackgrounds) !== JSON.stringify(background);

        if (isChanged) {
          // Обновляем список фонов
          store.setListBackgrounds(background);

          // Загружаем изображения только при изменении списка
          const dataBackgrounds = await appService.getDataBackgrounds();

          if (!active) return;

          // Обновляем изображения
          useAppStore.getState().setDataBackgrounds(dataBackgrounds);
        }

        printerErrorLogged = false;
      } catch (error) {
        if (!active) return;

        const store = useAppStore.getState();

        store.setListBackgrounds([]);

        if (!printerErrorLogged) {
          console.error("Не удалось получить список фонов:", error);
          printerErrorLogged = true;
        }
      }
    };

    const refreshStatus = async () => {
      try {
        const printerOnline = await backendClient.getPrinterStatus();
        if (!active) return;
        useAppStore.getState().setConnectionStatus(true, printerOnline);
        statusErrorLogged = false;
      } catch (error) {
        if (!active) return;
        useAppStore.getState().setConnectionStatus(false, false);
        if (!statusErrorLogged) {
          console.error("Backend недоступен или вернул ошибку статуса:", error);
          statusErrorLogged = true;
        }
      }
    };

    void refreshPrinters();
    void refreshFonts();
    void refreshBackgrounds();
    void refreshStatus();
    const printerInterval = setInterval(refreshPrinters, 5000);
    const fontInterval = setInterval(refreshFonts, 5000);
    const backgroundInterval = setInterval(refreshBackgrounds, 5000);
    const statusInterval = setInterval(refreshStatus, 1000);

    return () => {
      active = false;
      clearInterval(printerInterval);
      clearInterval(fontInterval);
      clearInterval(backgroundInterval);
      clearInterval(statusInterval);
    };
  }, []);
}
