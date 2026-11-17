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

        if (!areStringsEqual(store.dataFonts, printerData.fonts)) {
          store.setDataFonts(printerData.fonts);
        }

        // Сбрасываем настройки, если выбранный ресурс удалён.
        const availableFonts = new Set(printerData.fonts);
        if (store.font !== "Arial" && !availableFonts.has(store.font)) {
          void store.setSetting("font", "Arial");
        }
        if (store.font_manual !== "Arial" && !availableFonts.has(store.font_manual)) {
          void store.setSetting("font_manual", "Arial");
        }
        const availableBackgrounds = new Set(printerData.backgrounds);
        if (store.background !== "Без фона" && !availableBackgrounds.has(store.background)) {
          void store.setSetting("background", "Без фона");
        }
        if (store.background_manual !== "Без фона" && !availableBackgrounds.has(store.background_manual)) {
          void store.setSetting("background_manual", "Без фона");
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
