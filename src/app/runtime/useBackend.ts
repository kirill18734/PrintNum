import { useEffect } from "react";
import { backendClient } from "@/shared/api/backendClient";
import { syncFontStyles } from "@/shared/utils/fontStyles";
import { useAppStore } from "@/services/store";
import type { DataAppResponse, FontItem } from "@/types/api";

const POLLING_INTERVAL = 1000;
const fontContentCache = new Map<string, string>();

function hasChanged<T>(current: T, next: T): boolean {
  return JSON.stringify(current) !== JSON.stringify(next);
}

function hasMetadataChanged(current: FontItem[], next: FontItem[]): boolean {
  const normalize = (fonts: FontItem[]) =>
    fonts.map(({ base64: _base64, ...metadata }) => metadata);
  return JSON.stringify(normalize(current)) !== JSON.stringify(normalize(next));
}

async function loadFontContent(fonts: FontItem[]): Promise<FontItem[]> {
  const loaded = await Promise.all(fonts.map(async (font) => {
    const cached = fontContentCache.get(font.id);
    if (cached) return { ...font, base64: cached };
    try {
      const resource = await backendClient.font(font.id);
      fontContentCache.set(font.id, resource.base64);
      return { ...font, base64: resource.base64 };
    } catch (error) {
      console.error(`Не удалось загрузить шрифт "${font.name}":`, error);
      return null;
    }
  }));

  const activeIds = new Set(fonts.map((font) => font.id));
  for (const id of fontContentCache.keys()) {
    if (!activeIds.has(id)) fontContentCache.delete(id);
  }
  return loaded.filter((font): font is FontItem => font !== null);
}

export function useBackendRuntime(): void {
  useEffect(() => {
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    const refresh = async () => {
      try {
        const data: DataAppResponse = await backendClient.dataApp();
        if (!active) return;

        const {
          onlinePrinter,
          listPrinters,
          dataBackgrounds,
          printJobs,
          dataFonts,
        } = data;
        const store = useAppStore.getState();

        if (!store.serverOnline) store.setServerOnline(true);
        if (store.printerOnline !== onlinePrinter) store.setPrinterOnline(onlinePrinter);
        if (hasChanged(store.listPrinters, listPrinters)) store.setListPrinters(listPrinters);
        if (hasChanged(store.dataBackgrounds, dataBackgrounds)) {
          store.setDataBackgrounds(dataBackgrounds);
        }
        if (hasChanged(store.printJobs, printJobs)) store.setPrintJobs(printJobs);

        if (hasMetadataChanged(store.dataFonts, dataFonts)) {
          const fontsWithContent = await loadFontContent(dataFonts);
          if (!active) return;
          syncFontStyles(fontsWithContent);
          store.setDataFonts(fontsWithContent);
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
