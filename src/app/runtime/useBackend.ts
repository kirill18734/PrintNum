import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { useAppStore } from "@/services/store";
import type { StatusCardProps } from "@/types/printJob";

const POLLING_INTERVAL = 1000;

function arePrintJobsEqual(
  current: StatusCardProps[],
  next: StatusCardProps[],
): boolean {
  return (
    current.length === next.length &&
    current.every((job, index) => {
      const nextJob = next[index];

      return (
        job.status === nextJob.status &&
        job.text === nextJob.text &&
        job.renameText === nextJob.renameText &&
        job.receivedAt === nextJob.receivedAt
      );
    })
  );
}

function areStringsEqual(current: string[], next: string[]): boolean {
  return (
    current.length === next.length &&
    current.every((value, index) => value === next[index])
  );
}

export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      try {
        // Все данные backend получаем одним запросом.
        const printerData = await backendClient.getPrinterData();
        if (!active) return;

        const store = useAppStore.getState();

        if (!store.serverOnline) {
          store.setServerOnline(true);
        }

        if (!areStringsEqual(store.listPrinters, printerData.listPrinters)) {
          store.setListPrinters(printerData.listPrinters);
        }

        if (store.printerOnline !== printerData.printerOnline) {
          store.setPrinterOnline(printerData.printerOnline);
        }

        if (!arePrintJobsEqual(store.printJobs, printerData.printQueue)) {
          store.setPrintJobs(printerData.printQueue);
        }

        if (!areStringsEqual(store.dataBackgrounds, printerData.backgrounds)) {
          store.setDataBackgrounds(printerData.backgrounds);
        }

        // Arial и «Без фона» — встроенные значения по умолчанию.
        // Проверяем настройки только после успешного получения актуальных списков.
        const availableFontOptions = [...printerData.fonts];
        if (!availableFontOptions.includes("Arial")) {
          availableFontOptions.unshift("Arial");
        }
        if (!areStringsEqual(store.dataFonts, availableFontOptions)) {
          store.setDataFonts(availableFontOptions);
        }

        const availableFonts = new Set(availableFontOptions);
        const availableBackgrounds = new Set(printerData.backgrounds);
        const invalidSettings: Array<Promise<void>> = [];

        if (store.font !== "Arial" && !availableFonts.has(store.font)) {
          invalidSettings.push(store.setSetting("font", "Arial"));
        }
        if (store.font_manual !== "Arial" && !availableFonts.has(store.font_manual)) {
          invalidSettings.push(store.setSetting("font_manual", "Arial"));
        }
        if (
          store.background !== "Без фона" &&
          !availableBackgrounds.has(store.background)
        ) {
          invalidSettings.push(store.setSetting("background", "Без фона"));
        }
        if (
          store.background_manual !== "Без фона" &&
          !availableBackgrounds.has(store.background_manual)
        ) {
          invalidSettings.push(
            store.setSetting("background_manual", "Без фона"),
          );
        }

        if (invalidSettings.length > 0) {
          await Promise.all(invalidSettings).catch((error: unknown) => {
            // Ошибка сохранения настройки не должна прерывать опрос backend.
            console.error("Не удалось сохранить значения ресурсов по умолчанию:", error);
          });
        }

      } catch (error: unknown) {
        if (!active) return;

        const store = useAppStore.getState();
        if (store.serverOnline) {
          store.setServerOnline(false);
        }

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
