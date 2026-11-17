import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import type { FontItem } from "@/types/api";

const BACKGROUND_EXTENSIONS = new Set(["png", "jpg", "jpeg", "bmp", "webp"]);
const FONT_EXTENSIONS = new Set(["ttf", "otf"]);
function getExtension(fileName: string): string { return fileName.split(".").pop()?.toLowerCase() ?? ""; }
function isSafeFileName(fileName: string): boolean {
  return Boolean(fileName && fileName === fileName.split(/[\\/]/).pop() && fileName !== "." && fileName !== "..");
}
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

/** Читает только конкретный фон, имя которого получено от backend. */
export async function loadBackgroundPreview(fileName: string): Promise<string> {
  const extension = getExtension(fileName);
  if (!isSafeFileName(fileName) || !BACKGROUND_EXTENSIONS.has(extension)) throw new Error("Некорректное имя файла фона");
  const bytes = await readFile(`backgrounds/${fileName}`, { baseDir: BaseDirectory.AppData });
  const mimeType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`;
  return `data:${mimeType};base64,${bytesToBase64(bytes)}`;
}

/** Читает только конкретный шрифт, имя которого получено от backend. */
export async function loadFontPreview(fileName: string): Promise<FontItem> {
  const extension = getExtension(fileName);
  if (!isSafeFileName(fileName) || !FONT_EXTENSIONS.has(extension)) throw new Error("Некорректное имя файла шрифта");
  const bytes = await readFile(`fonts/${fileName}`, { baseDir: BaseDirectory.AppData });
  return {
    id: fileName, name: fileName, label: fileName, family: fileName, weight: 400,
    fontStyle: /italic|oblique/i.test(fileName) ? "italic" : "normal",
    format: extension === "otf" ? "opentype" : "truetype",
    base64: bytesToBase64(bytes),
  };
}
