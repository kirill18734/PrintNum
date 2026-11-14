// Чтение локальных ресурсов PrintNum через штатные JavaScript API Tauri.
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import {
  BaseDirectory,
  exists,
  readDir,
  stat,
  type DirEntry,
} from "@tauri-apps/plugin-fs";
import type { BackgroundItem, FontItem } from "@/types/api";
import { isTauri } from "@/services/app.tauri";

const BACKGROUND_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);
const FONT_EXTENSIONS = new Set(["ttf", "otf"]);

interface AssetSnapshot {
  backgrounds: string[];
  fonts: string[];
}

export interface LocalAssets {
  backgrounds: BackgroundItem[];
  fonts: FontItem[];
}

let previousSnapshot: AssetSnapshot | null = null;

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getName(fileName: string): string {
  const extensionIndex = fileName.lastIndexOf(".");
  return extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
}

function getFontMetadata(fileName: string): {
  family: string;
  weight: number;
  fontStyle: "normal" | "italic";
} {
  const name = getName(fileName);
  const normalized = name.replace(/[ _]+/g, "-");
  const variantPattern =
    /(?:^|[-])(thin|extralight|ultralight|light|regular|normal|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy)(?:[-](italic|oblique))?$/i;
  const match = normalized.match(variantPattern);
  const weights: Record<string, number> = {
    thin: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    regular: 400,
    normal: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  };

  if (!match || match.index === undefined) {
    return { family: name, weight: 400, fontStyle: "normal" };
  }

  const family = normalized.slice(0, match.index).replace(/-+$/, "") || name;
  return {
    family,
    weight: weights[match[1].toLowerCase()] ?? 400,
    fontStyle: match[2] ? "italic" : "normal",
  };
}

function getModifiedAt(value: Date | null | undefined): number {
  return value instanceof Date ? value.getTime() : 0;
}

async function listFiles(
  folder: "backgrounds" | "fonts",
  extensions: Set<string>,
): Promise<Array<{ entry: DirEntry; size: number; modifiedAt: number }>> {
  // Не создаём каталоги: отсутствие каталога означает пустой список.
  if (!(await exists(folder, { baseDir: BaseDirectory.AppData }))) {
    return [];
  }

  const entries = await readDir(folder, { baseDir: BaseDirectory.AppData });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile && extensions.has(getExtension(entry.name)))
      .map(async (entry) => {
        const metadata = await stat(await join(folder, entry.name), {
          baseDir: BaseDirectory.AppData,
        });
        return {
          entry,
          size: metadata.size,
          modifiedAt: getModifiedAt(metadata.mtime),
        };
      }),
  );

  return files.sort((left, right) =>
    left.entry.name.localeCompare(right.entry.name, undefined, {
      sensitivity: "base",
    }),
  );
}

async function scanAssets(): Promise<{
  assets: LocalAssets;
  snapshot: AssetSnapshot;
}> {
  if (!isTauri) {
    return {
      assets: { backgrounds: [], fonts: [] },
      snapshot: { backgrounds: [], fonts: [] },
    };
  }

  const [backgroundFiles, fontFiles] = await Promise.all([
    listFiles("backgrounds", BACKGROUND_EXTENSIONS),
    listFiles("fonts", FONT_EXTENSIONS),
  ]);
  const root = await appDataDir();

  const backgrounds = await Promise.all(
    backgroundFiles.map(async ({ entry, size, modifiedAt }) => ({
      id: entry.name,
      name: getName(entry.name),
      src: convertFileSrc(await join(root, "backgrounds", entry.name)),
      size,
      modifiedAt,
    })),
  );

  const fonts = await Promise.all(
    fontFiles.map(async ({ entry, size, modifiedAt }) => {
      const extension = getExtension(entry.name);
      const fontMetadata = getFontMetadata(entry.name);
      return {
        id: entry.name,
        name: fontMetadata.family,
        family: fontMetadata.family,
        weight: fontMetadata.weight,
        fontStyle: fontMetadata.fontStyle,
        format: extension === "otf" ? ("opentype" as const) : ("truetype" as const),
        src: convertFileSrc(await join(root, "fonts", entry.name)),
        size,
        modifiedAt,
      };
    }),
  );

  return {
    assets: { backgrounds, fonts },
    snapshot: {
      backgrounds: backgroundFiles.map(
        ({ entry, size, modifiedAt }) => `${entry.name}:${size}:${modifiedAt}`,
      ),
      fonts: fontFiles.map(
        ({ entry, size, modifiedAt }) => `${entry.name}:${size}:${modifiedAt}`,
      ),
    },
  };
}

export const assetsService = {
  async getAssets(): Promise<LocalAssets> {
    const result = await scanAssets();
    previousSnapshot = result.snapshot;
    return result.assets;
  },

  async assetsChanged(): Promise<boolean> {
    const result = await scanAssets();
    if (!previousSnapshot) {
      previousSnapshot = result.snapshot;
      return false;
    }

    const changed =
      JSON.stringify(previousSnapshot) !== JSON.stringify(result.snapshot);
    previousSnapshot = result.snapshot;
    return changed;
  },
};
