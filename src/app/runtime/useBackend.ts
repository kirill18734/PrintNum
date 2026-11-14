import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { syncFontStyles } from "@/shared/utils/fontStyles";
import { useAppStore } from "@/services/store";

const POLLING_INTERVAL = 1000;

export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      try {
        // Сначала проверяем флаги и загружаем только действительно изменившиеся данные.
        const changes = await backendClient.getChanges();
        if (!active) return;

        const store = useAppStore.getState();
        if (!store.serverOnline) store.setServerOnline(true);

        const updates: Promise<void>[] = [];

        if (changes.printersChanged) {
          updates.push(
            backendClient.getPrinters().then((printers) => {
              if (active) useAppStore.getState().setListPrinters(printers);
            }),
          );
        }

        if (changes.printerStatusChanged) {
          updates.push(
            backendClient.getPrinterStatus().then((online) => {
              if (active) useAppStore.getState().setPrinterOnline(online);
            }),
          );
        }

        if (changes.backgroundsChanged) {
          updates.push(
            backendClient.getBackgrounds().then((backgrounds) => {
              if (active) useAppStore.getState().setDataBackgrounds(backgrounds);
            }),
          );
        }

        if (changes.fontsChanged) {
          updates.push(
            backendClient.getFonts().then((fonts) => {
              if (!active) return;

              syncFontStyles(fonts);
              useAppStore.getState().setDataFonts(fonts);
            }),
          );
        }

        if (changes.printJobsChanged) {
          updates.push(
            backendClient.getPrintJobs().then((jobs) => {
              if (active) useAppStore.getState().setPrintJobs(jobs);
            }),
          );
        }

        // Независимые наборы данных можно загружать одновременно.
        await Promise.all(updates);
      } catch (error: unknown) {
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
