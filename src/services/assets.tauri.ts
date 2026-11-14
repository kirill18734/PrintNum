// Работа с локальными ресурсами через JavaScript API Tauri.
import { convertFileSrc } from "@tauri-apps/api/core";
import { appDataDir, join, resourceDir } from "@tauri-apps/api/path";
import {
  copyFile,
  exists,
  mkdir,
  readDir,
  stat,
  type DirEntry,
} from "@tauri-apps/plugin-fs";
import type { BackgroundItem, FontItem } from "@/types/api";
import { isTauri } from "@/services/app.tauri";
import { open } from "@tauri-apps/plugin-dialog";

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
let initializePromise: Promise<void> | null = null;

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
    /(?:^|[-])(thin|extralight|ultralight|light|regular|normal|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy)(?:-?(italic|oblique))?$/i;
  const match = normalized.match(variantPattern);
  const italicOnly = normalized.match(/(?:^|-)italic$/i);
  const weights: Record<string, number> = {
    thin: 100, extralight: 200, ultralight: 200, light: 300,
    regular: 400, normal: 400, medium: 500, semibold: 600,
    demibold: 600, bold: 700, extrabold: 800, ultrabold: 800,
    black: 900, heavy: 900,
  };

  if (!match || match.index === undefined) {
    if (italicOnly && italicOnly.index !== undefined) {
      return {
        family: normalized.slice(0, italicOnly.index).replace(/-+$/, "") || name,
        weight: 400,
        fontStyle: "italic",
      };
    }
    return { family: name, weight: 400, fontStyle: "normal" };
  }

  return {
    family: normalized.slice(0, match.index).replace(/-+$/, "") || name,
    weight: weights[match[1].toLowerCase()] ?? 400,
    fontStyle: match[2] ? "italic" : "normal",
  };
}

function getModifiedAt(value: Date | null | undefined): number {
  return value instanceof Date ? value.getTime() : 0;
}

/**
 * Копирует встроенные ресурсы в AppData при первом запуске.
 * Уже существующие файлы не перезаписываются, чтобы сохранить пользовательские изменения.
 */
async function installBundledFolder(
  resourceRoot: string,
  appDataRoot: string,
  folder: "fonts" | "backgrounds",
): Promise<void> {
  const source = await join(resourceRoot, folder);
  const destination = await join(appDataRoot, folder);

  if (!(await exists(source))) return;
  if (!(await exists(destination))) {
    await mkdir(destination, { recursive: true });
  }

  const entries = await readDir(source);
  for (const entry of entries) {
    if (!entry.isFile) continue;
    const extension = getExtension(entry.name);
    const allowed = folder === "fonts"
      ? FONT_EXTENSIONS.has(extension)
      : BACKGROUND_EXTENSIONS.has(extension);
    if (!allowed) continue;

    const sourceFile = await join(source, entry.name);
    const destinationFile = await join(destination, entry.name);
    if (!(await exists(destinationFile))) {
      await copyFile(sourceFile, destinationFile);
    }
  }
}

async function initializeBundledAssets(): Promise<void> {
  if (!isTauri) return;
  if (!initializePromise) {
    initializePromise = (async () => {
      const [resourceRoot, appDataRoot] = await Promise.all([
        resourceDir(),
        appDataDir(),
      ]);
      await Promise.all([
        installBundledFolder(resourceRoot, appDataRoot, "fonts"),
        installBundledFolder(resourceRoot, appDataRoot, "backgrounds"),
      ]);
    })().catch((error) => {
      initializePromise = null;
      throw error;
    });
  }
  await initializePromise;
}

async function listFiles(
  root: string,
  folder: "backgrounds" | "fonts",
  extensions: Set<string>,
): Promise<Array<{ entry: DirEntry; size: number; modifiedAt: number }>> {
  const directory = await join(root, folder);
  if (!(await exists(directory))) return [];

  const entries = await readDir(directory);
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile && extensions.has(getExtension(entry.name)))
      .map(async (entry) => {
        const metadata = await stat(await join(directory, entry.name));
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

  await initializeBundledAssets();
  const root = await appDataDir();
  const [backgroundFiles, fontFiles] = await Promise.all([
    listFiles(root, "backgrounds", BACKGROUND_EXTENSIONS),
    listFiles(root, "fonts", FONT_EXTENSIONS),
  ]);

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
  async initialize(): Promise<void> {
    await initializeBundledAssets();
  },

  async getAssets(): Promise<LocalAssets> {
    const result = await scanAssets();
    previousSnapshot = result.snapshot;
    return result.assets;
  },


  async addBackgroundImages(): Promise<LocalAssets> {
    if (!isTauri) return this.getAssets();

    const selected = await open({
      multiple: true,
      directory: false,
      filters: [{ name: "Изображения", extensions: [...BACKGROUND_EXTENSIONS] }],
    });
    if (!selected) return this.getAssets();

    const files = Array.isArray(selected) ? selected : [selected];
    const root = await appDataDir();
    const destination = await join(root, "backgrounds");
    if (!(await exists(destination))) {
      await mkdir(destination, { recursive: true });
    }

    for (const source of files) {
      const fileName = source.split(/[\\\\/]/).pop();
      if (!fileName || !BACKGROUND_EXTENSIONS.has(getExtension(fileName))) continue;
      const target = await join(destination, fileName);
      if (!(await exists(target))) {
        await copyFile(source, target);
      }
    }

    return this.getAssets();
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
