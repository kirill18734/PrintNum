import {
  BaseDirectory,
  exists,
  mkdir,
  readDir,
  readFile,
  readTextFile,
  remove,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";

export type ResourceKind = "background" | "font";

const RESOURCE_CONFIG = {
  background: {
    directory: "backgrounds",
    extensions: ["png", "jpg", "jpeg", "bmp", "webp"],
  },
  font: {
    directory: "fonts",
    extensions: ["ttf", "otf"],
  },
} as const;

const DELETED_RESOURCES_FILE = "deleted-resources.txt";

function getBaseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? "";
}

function getFileStem(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").toLowerCase();
}

async function readDeletedResources(): Promise<Set<string>> {
  try {
    const content = await readTextFile(DELETED_RESOURCES_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    return new Set(content.split(/\r?\n/).map((item) => item.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

async function writeDeletedResources(resources: Set<string>): Promise<void> {
  await writeTextFile(DELETED_RESOURCES_FILE, [...resources].sort().join("\n"), {
    baseDir: BaseDirectory.AppData,
  });
}

export async function addResourceFiles(
  kind: ResourceKind,
): Promise<{ added: number; skipped: number }> {
  const config = RESOURCE_CONFIG[kind];
  const selected = await open({
    multiple: true,
    directory: false,
    filters: [
      {
        name: kind === "font" ? "Шрифты" : "Изображения",
        extensions: [...config.extensions],
      },
    ],
  });

  if (!selected || !Array.isArray(selected) || selected.length === 0) {
    return { added: 0, skipped: 0 };
  }

  if (!(await exists(config.directory, { baseDir: BaseDirectory.AppData }))) {
    await mkdir(config.directory, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }

  const deleted = await readDeletedResources();
  const currentEntries = await readDir(config.directory, {
    baseDir: BaseDirectory.AppData,
  });
  const existingStems = new Set(
    currentEntries
      .filter((entry) => !entry.isDirectory)
      .map((entry) => getFileStem(entry.name)),
  );

  let added = 0;
  let skipped = 0;

  for (const sourcePath of selected) {
    const fileName = getBaseName(sourcePath);
    if (!fileName) {
      skipped += 1;
      continue;
    }

    const destination = config.directory + "/" + fileName;
    const stem = getFileStem(fileName);

    // Имя без расширения тоже должно быть уникальным: backend хранит именно его.
    if (
      existingStems.has(stem) ||
      (await exists(destination, { baseDir: BaseDirectory.AppData }))
    ) {
      skipped += 1;
      continue;
    }

    const bytes = await readFile(sourcePath);
    await writeFile(destination, bytes, { baseDir: BaseDirectory.AppData });
    deleted.delete(destination);
    existingStems.add(stem);
    added += 1;
  }

  await writeDeletedResources(deleted);
  return { added, skipped };
}

export async function deleteResource(
  kind: ResourceKind,
  fileName: string,
): Promise<void> {
  const config = RESOURCE_CONFIG[kind];
  if (!fileName || fileName !== getBaseName(fileName)) {
    throw new Error("Некорректное имя файла");
  }

  const relativePath = config.directory + "/" + fileName;
  if (!(await exists(relativePath, { baseDir: BaseDirectory.AppData }))) {
    throw new Error("Файл уже удалён или недоступен");
  }

  // Сначала сохраняем tombstone: удалённый встроенный ресурс не вернётся
  // даже если приложение завершится между записью manifest и удалением файла.
  const deleted = await readDeletedResources();
  deleted.add(relativePath);
  await writeDeletedResources(deleted);
  await remove(relativePath, { baseDir: BaseDirectory.AppData });
}
