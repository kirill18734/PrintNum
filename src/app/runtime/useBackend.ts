import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { useAppStore } from "@/services/store";
import type { DataAppResponse } from "@/types/api";


const POLLING_INTERVAL = 1000;

// Backend возвращает сериализуемые данные; сравнение защищает Zustand от лишних обновлений.
function hasChanged<T>(current: T, next: T): boolean {
  return JSON.stringify(current) !== JSON.stringify(next);
}

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

        // Обновляем Zustand только при фактическом изменении данных.
        if (!store.serverOnline) store.setServerOnline(true);
        if (store.printerOnline !== onlinePrinter) {
          store.setPrinterOnline(onlinePrinter);
        }
        if (hasChanged(store.listPrinters, listPrinters)) {
          store.setListPrinters(listPrinters);
        }
        if (hasChanged(store.dataBackgrounds, dataBackgrounds)) {
          store.setDataBackgrounds(dataBackgrounds);
        }
        if (hasChanged(store.printJobs, printJobs)) {
          store.setPrintJobs(printJobs);
        }

        // Ссылки на шрифты в DOM меняем только при изменении списка.
        if (hasChanged(store.dataFonts, dataFonts)) {
          const attrName = "data-google-font";
          document
            .querySelectorAll(`link[${attrName}]`)
            .forEach((link) => link.remove());

          if (Array.isArray(dataFonts)) {
            dataFonts.forEach((font) => {
              if (font && font.rel) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = font.rel;
                link.setAttribute(attrName, "true");
                document.head.appendChild(link);
              }
            });
          }

          store.setDataFonts(dataFonts);
        }
      } catch (error) {
        if (!active) return;
        const store = useAppStore.getState();
        if (store.serverOnline) store.setServerOnline(false);
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
