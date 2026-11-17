import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { useAppStore } from "@/services/store";
import type { StatusCardProps } from "@/types/printJob";
import { refreshBackgrounds, refreshFonts } from "@/services/resources.tauri";

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

function areResourceFilesEqual(current: { fileName?: string }[], next: string[]): boolean {
  const currentFiles = current
    .map((item) => item.fileName)
    .filter((fileName): fileName is string => Boolean(fileName))
    .sort();
  const nextFiles = [...next].sort();
  return areStringsEqual(currentFiles, nextFiles);
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

        // Списки ресурсов приходят в том же ответе, что и остальные данные backend.
        // Перечитываем локальные файлы только при фактическом изменении списка.
        const resourceUpdates: Promise<void>[] = [];
        if (!areResourceFilesEqual(store.dataBackgrounds, printerData.backgrounds)) {
          resourceUpdates.push(refreshBackgrounds());
        }
        if (!areResourceFilesEqual(store.dataFonts, printerData.fonts)) {
          resourceUpdates.push(refreshFonts());
        }
        if (resourceUpdates.length > 0) {
          await Promise.all(resourceUpdates);
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
