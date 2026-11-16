import { BaseDirectory, readDir, readFile } from "@tauri-apps/plugin-fs";
import type { BackgroundItem, FontItem } from "@/types/api";
import { syncFontStyles } from "@/shared/utils/fontStyles";

const BACKGROUND_EXTENSIONS = new Set(["png", "jpg", "jpeg", "bmp", "webp"]);
const FONT_EXTENSIONS = new Set(["ttf", "otf", "woff2"]);

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getFileStem(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf(".");
  return extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function readResourceFiles(
  directory: "backgrounds" | "fonts",
  supportedExtensions: Set<string>,
): Promise<string[]> {
  const entries = await readDir(directory, { baseDir: BaseDirectory.AppData });

  return entries
    .filter((entry) => !entry.isDirectory && supportedExtensions.has(getExtension(entry.name)))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "ru"));
}

/** Загружает фоны из %APPDATA%\\PrintNum\\backgrounds. */
export async function loadBackgrounds(): Promise<BackgroundItem[]> {
  const files = await readResourceFiles("backgrounds", BACKGROUND_EXTENSIONS);

  return Promise.all(
    files.map(async (fileName) => {
      const extension = getExtension(fileName);
      const mimeType = extension === "jpg" || extension === "jpeg"
        ? "image/jpeg"
        : `image/${extension}`;
      const bytes = await readFile(`backgrounds/${fileName}`, {
        baseDir: BaseDirectory.AppData,
      });
      const name = getFileStem(fileName);

      return {
        id: name,
        name,
        base64: `data:${mimeType};base64,${bytesToBase64(bytes)}`,
      };
    }),
  );
}

/** Загружает шрифты из %APPDATA%\\PrintNum\\fonts. */
export async function loadFonts(): Promise<FontItem[]> {
  const files = await readResourceFiles("fonts", FONT_EXTENSIONS);
  const fonts = await Promise.all(
    files.map(async (fileName) => {
      const extension = getExtension(fileName);
      const name = getFileStem(fileName);
      const bytes = await readFile(`fonts/${fileName}`, {
        baseDir: BaseDirectory.AppData,
      });

      return {
        id: name,
        name,
        family: name,
        label: name,
        weight: 400,
        fontStyle: /italic|oblique/i.test(name) ? "italic" as const : "normal" as const,
        format: extension === "otf" ? "opentype" as const : extension === "woff2" ? "woff2" as const : "truetype" as const,
        base64: bytesToBase64(bytes),
      };
    }),
  );

  if (!fonts.some((font) => font.name.toLowerCase() === "arial")) {
    fonts.unshift({
      id: "Arial",
      name: "Arial",
      label: "Arial",
      family: "Arial",
      weight: 400,
      fontStyle: "normal",
      format: "truetype",
      base64: "",
    });
  }

  return fonts;
}

export async function refreshBackgrounds(): Promise<void> {
  const backgrounds = await loadBackgrounds();
  const { useAppStore } = await import("@/services/store");
  useAppStore.getState().setDataBackgrounds(backgrounds);
}

export async function refreshFonts(): Promise<void> {
  const fonts = await loadFonts();
  syncFontStyles(fonts);
  const { useAppStore } = await import("@/services/store");
  useAppStore.getState().setDataFonts(fonts);
}

/** Первичная загрузка локальных ресурсов в общее состояние UI. */
export async function initializeResources(): Promise<void> {
  const [backgrounds, fonts] = await Promise.all([
    loadBackgrounds(),
    loadFonts(),
  ]);

  syncFontStyles(fonts);
  const { useAppStore } = await import("@/services/store");
  useAppStore.setState({
    dataBackgrounds: backgrounds,
    dataFonts: fonts,
  });

  const availableFonts = new Set(fonts.map((font) => font.name));
  const availableBackgrounds = new Set([
    "Без фона",
    ...backgrounds.map((background) => background.name),
  ]);
  const settings = useAppStore.getState();

  if (!availableFonts.has(settings.font)) {
    await settings.setSetting("font", "Arial");
  }
  if (!availableFonts.has(settings.font_manual)) {
    await settings.setSetting("font_manual", "Arial");
  }
  if (!availableBackgrounds.has(settings.background)) {
    await settings.setSetting("background", "Без фона");
  }
  if (!availableBackgrounds.has(settings.background_manual)) {
    await settings.setSetting("background_manual", "Без фона");
  }
}
