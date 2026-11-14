import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { syncFontStyles } from "@/shared/utils/fontStyles";
import { assetsService } from "@/services/assets.tauri";
import { useAppStore } from "@/services/store";

const POLLING_INTERVAL = 1000;

export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    let assetsInitialized = false;

    const refreshAssets = async () => {
      try {
        if (!assetsInitialized) {
          const assets = await assetsService.getAssets();
          if (!active) return;
          syncFontStyles(assets.fonts);
          useAppStore.getState().setDataBackgrounds(assets.backgrounds);
          useAppStore.getState().setDataFonts(assets.fonts);
          assetsInitialized = true;
          return;
        }

        if (await assetsService.assetsChanged()) {
          const assets = await assetsService.getAssets();
          if (!active) return;
          syncFontStyles(assets.fonts);
          useAppStore.getState().setDataBackgrounds(assets.backgrounds);
          useAppStore.getState().setDataFonts(assets.fonts);
        }
      } catch (error) {
        if (active) console.error("Ошибка чтения локальных ресурсов:", error);
      }
    };

    const refresh = async () => {
      try {
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

        if (changes.printJobsChanged) {
          updates.push(
            backendClient.getPrintJobs().then((jobs) => {
              if (active) useAppStore.getState().setPrintJobs(jobs);
            }),
          );
        }

        await Promise.all(updates);
        if (active) await refreshAssets();
      } catch (error: unknown) {
        if (!active) return;

        const store = useAppStore.getState();
        if (store.serverOnline) store.setServerOnline(false);
        console.error("Ошибка получения данных backend:", error);
      } finally {
        if (active) timeout = setTimeout(refresh, POLLING_INTERVAL);
      }
    };

    void refresh();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);
}
