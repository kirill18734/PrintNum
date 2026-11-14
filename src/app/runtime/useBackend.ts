import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { syncFontStyles } from "@/shared/utils/fontStyles";
import { useAppStore } from "@/services/store";
import type { DataAppResponse } from "@/types/api";

const POLLING_INTERVAL = 1000;

// Версии хранятся в runtime, чтобы после ошибки загрузки ресурс запрашивался повторно.
export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    let fontsVersion: string | null = null;
    let backgroundsVersion: string | null = null;
    let printersVersion: string | null = null;

    const refresh = async () => {
      try {
        const data: DataAppResponse = await backendClient.dataApp();
        if (!active) return;

        const { onlinePrinter, printJobs } = data;
        const store = useAppStore.getState();

        if (!store.serverOnline) store.setServerOnline(true);
        if (store.printerOnline !== onlinePrinter) {
          store.setPrinterOnline(onlinePrinter);
        }
        if (JSON.stringify(store.printJobs) !== JSON.stringify(printJobs)) {
          store.setPrintJobs(printJobs);
        }

        if (fontsVersion !== data.fontsVersion) {
          try {
            const { dataFonts } = await backendClient.fonts();
            if (!active) return;
            syncFontStyles(dataFonts);
            useAppStore.getState().setDataFonts(dataFonts);
            fontsVersion = data.fontsVersion;
          } catch (error) {
            console.error("Не удалось обновить список шрифтов:", error);
          }
        }

        if (backgroundsVersion !== data.backgroundsVersion) {
          try {
            const { dataBackgrounds } = await backendClient.backgrounds();
            if (!active) return;
            useAppStore.getState().setDataBackgrounds(dataBackgrounds);
            backgroundsVersion = data.backgroundsVersion;
          } catch (error) {
            console.error("Не удалось обновить список фонов:", error);
          }
        }

        if (printersVersion !== data.printersVersion) {
          try {
            const { listPrinters } = await backendClient.printers();
            if (!active) return;
            useAppStore.getState().setListPrinters(listPrinters);
            printersVersion = data.printersVersion;
          } catch (error) {
            console.error("Не удалось обновить список принтеров:", error);
          }
        }
      } catch (error) {
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
