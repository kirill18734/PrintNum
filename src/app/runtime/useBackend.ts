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
        if (!assetsInitialized || (await assetsService.assetsChanged())) {
          const assets = await assetsService.getAssets();
          if (!active) return;
          syncFontStyles(assets.fonts);
          useAppStore.getState().setDataBackgrounds(assets.backgrounds);
          useAppStore.getState().setDataFonts(assets.fonts);
          assetsInitialized = true;
        }
      } catch (error) {
        if (active) console.error("Ошибка чтения локальных ресурсов:", error);
      }
    };

    const refresh = async () => {
      await refreshAssets();
      try {
        const state = await backendClient.getState();
        if (!active) return;

        const store = useAppStore.getState();
        store.setServerOnline(true);
        store.setPrinterOnline(state.printerOnline);
        store.setListPrinters(state.listPrinters);
        store.setPrintJobs(state.printJobs);
      } catch (error: unknown) {
        if (!active) return;
        const store = useAppStore.getState();
        store.setServerOnline(false);
        store.setPrinterOnline(false);
        console.error("Ошибка получения состояния backend:", error);
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
