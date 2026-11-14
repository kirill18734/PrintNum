import type { FontItem } from "@/types/api";

const loadedFonts = new Map<string, Promise<void>>();

function getFontFamily(font: FontItem): string {
  return font.family?.trim() || font.name.trim();
}

/** Загружает только выбранное семейство; повторные запросы используют тот же Promise. */
export async function loadFontFamily(fonts: FontItem[], family: string): Promise<void> {
  const selected = fonts.filter((font) => getFontFamily(font) === family);

  await Promise.all(selected.map(async (font) => {
    const key = `${font.id}:${font.modifiedAt}`;
    let loading = loadedFonts.get(key);

    if (!loading) {
      loading = (async () => {
        const face = new FontFace(family, `url("${font.src}")`, {
          weight: String(font.weight ?? 400),
          style: font.fontStyle ?? "normal",
          display: "swap",
        });
        await face.load();
        document.fonts.add(face);
      })();
      loadedFonts.set(key, loading);
    }

    try {
      await loading;
    } catch (error) {
      loadedFonts.delete(key);
      throw error;
    }
  }));
}

/** Удаляет из кэша загрузки ресурсы, которых больше нет или которые изменились. */
export function syncFontStyles(fonts: FontItem[]): void {
  const activeKeys = new Set(fonts.map((font) => `${font.id}:${font.modifiedAt}`));
  for (const key of loadedFonts.keys()) {
    if (!activeKeys.has(key)) loadedFonts.delete(key);
  }
}
