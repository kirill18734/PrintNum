import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { useAppStore } from "@/services/store";

import type { BackgroundItem, FontItem } from "@/services/store";

import type { StatusCardProps } from "@/components/statusCard";

interface DataAppResponse {
  onlinePrinter: boolean;
  listPrinters: string[];
  dataBackgrounds: BackgroundItem[];
  dataFonts: FontItem[];
  printJobs: StatusCardProps[];
}

const POLLING_INTERVAL = 1000;

export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      try {
        const data: DataAppResponse = await backendClient.dataApp();
        if (!active) return;

        // Деструктурируем объект прямо здесь
        const {
          onlinePrinter,
          listPrinters,
          dataBackgrounds,
          printJobs,
          dataFonts,
        } = data;

        const store = useAppStore.getState();
        // СТАТУС СЕРВЕРА
        store.setServerOnline(true);
        // СТАТУС ПРИНТЕРА
        store.setPrinterOnline(onlinePrinter);
        // СПИСОК ПРИНТЕРОВ
        store.setListPrinters(listPrinters);
        // ФОНЫ
        store.setDataBackgrounds(dataBackgrounds);
        // СПИСОК ЗАДАНИЙ
        store.setPrintJobs(printJobs);

        // ШРИФТЫ
        store.setDataFonts((current) => {
          const unchanged =
            JSON.stringify(current) === JSON.stringify(dataFonts);
          if (unchanged) return current;

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
      } catch (error) {
        if (!active) return;
        useAppStore.getState().setServerOnline(false);
        console.error("Ошибка получения данных backend:", error);
      } finally {
        if (active) {
          timeout = setTimeout(refresh, POLLING_INTERVAL);
        }
      }
    };

    void refresh();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);
}
