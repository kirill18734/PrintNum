import type { FontItem } from "@/types/api";

interface LoadedFont {
  face: FontFace;
  promise: Promise<void>;
}

const loadedFonts = new Map<string, LoadedFont>();

function getFontFamily(font: FontItem): string {
  return font.family?.trim() || font.name.trim();
}

/** Загружает только выбранное семейство; повторные запросы используют тот же Promise. */
export async function loadFontFamily(fonts: FontItem[], family: string): Promise<void> {
  const selected = fonts.filter((font) => getFontFamily(font) === family);

  await Promise.all(selected.map(async (font) => {
    const key = `${font.id}:${font.modifiedAt}`;
    let loaded = loadedFonts.get(key);

    if (!loaded) {
      const face = new FontFace(family, `url("${font.src}")`, {
        weight: String(font.weight ?? 400),
        style: font.fontStyle ?? "normal",
        display: "swap",
      });
      loaded = {
        face,
        promise: face.load().then(() => {
          document.fonts.add(face);
        }),
      };
      loadedFonts.set(key, loaded);
    }

    try {
      await loaded.promise;
    } catch (error) {
      loadedFonts.delete(key);
      throw error;
    }
  }));
}

/** Удаляет из браузерного FontFaceSet шрифты, которые были изменены или удалены. */
export function syncFontStyles(fonts: FontItem[]): void {
  const activeKeys = new Set(fonts.map((font) => `${font.id}:${font.modifiedAt}`));
  for (const [key, loaded] of loadedFonts) {
    if (!activeKeys.has(key)) {
      document.fonts.delete(loaded.face);
      loadedFonts.delete(key);
    }
  }
}
