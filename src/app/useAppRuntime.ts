// Управляет темой, запуском backend, обновлениями и периодической проверкой устройств.
import { useEffect } from "react";
import { appService } from "@/services/app.tauri";
import { BackgroundItem, FontItem, useAppStore } from "@/services/store";
import { backendClient } from "@/shared/api/backendClient";
import { StatusCardProps } from "@/components/statusCard";

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

    // 1. Описываем интерфейс ответа от бэкенда (хорошая практика)
    interface DataAppResponse {
      onlinePrinter: boolean;
      listPrinters: string[];
      dataBackgrounds: BackgroundItem[]; // лучше заменить на конкретный тип, если возможно
      dataFonts: FontItem[]; // лучше заменить на конкретный тип, если возможно
      printJobs: StatusCardProps[]; // лучше заменить на конкретный тип, если возможно
    }

    const refreshDataApp = async () => {
      try {
        // 2. Типизируем ответ от клиента
        const dataApp = (await backendClient.dataApp()) as DataAppResponse;

        // Проверка active ДО деструктуризации экономит ресурсы
        if (!active) return;
        useAppStore.getState().setServerOnline(true);

        const updateData = (cur: any, newData: any) =>
          JSON.stringify(cur) === JSON.stringify(newData) ? cur : newData;

        // 3. Правильный синтаксис деструктуризации
        const {
          onlinePrinter,
          listPrinters,
          dataBackgrounds,
          dataFonts,
          printJobs,
        } = dataApp;

        // СПИСОК ПРИНТЕРОВ
        useAppStore
          .getState()
          .setListPrinters((current) => updateData(current, listPrinters));

        // СТАТУС ПРИНТЕРА
        useAppStore.getState().setPrinterOnline(onlinePrinter);

        // ШРИФТЫ
        useAppStore.getState().setDataFonts((current) => {
          // Если данные не изменились, ничего не делаем
          if (JSON.stringify(current) === JSON.stringify(dataFonts)) {
            return current;
          }
          document
            .querySelectorAll("link[data-google-font]")
            .forEach((link) => link.remove());

          // Маркер для поиска только наших тегов link
          const attrName = "data-google-font";

          // 1. Удаляем старые шрифты, добавленные этим скриптом
          document
            .querySelectorAll(`link[${attrName}]`)
            .forEach((link) => link.remove());

          // 2. Добавляем новые шрифты из актуального списка
          if (Array.isArray(dataFonts)) {
            dataFonts.forEach((font) => {
              if (font && font.rel) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = font.rel;
                link.setAttribute(attrName, "true"); // Именная метка скрипта
                document.head.appendChild(link);
              }
            });
          }

          return dataFonts;
        });

        // ФОНЫ
        useAppStore
          .getState()
          .setDataBackgrounds((current) =>
            updateData(current, dataBackgrounds),
          );

        // ЗАДАНИЯ НА ПЕЧАТЬ
        useAppStore
          .getState()
          .setPrintJobs((current) => updateData(current, printJobs));
      } catch (error) {
        if (!active) return;

        useAppStore.getState().setServerOnline(false);
      }
    };

    void refreshDataApp();

    const dataInterval = setInterval(refreshDataApp, 1000);

    return () => {
      active = false;
      clearInterval(dataInterval);
    };
  }, []);
}
