import { BaseDirectory, exists, mkdir, readFile, readTextFile, remove, writeFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";

export type ResourceKind = "background" | "font";

const RESOURCE_CONFIG = {
  background: {
    directory: "backgrounds",
    label: "фон",
    extensions: ["png", "jpg", "jpeg", "bmp", "webp"],
  },
  font: {
    directory: "fonts",
    label: "шрифт",
    extensions: ["ttf", "otf"],
  },
} as const;

const DELETED_RESOURCES_FILE = "deleted-resources.txt";

function getBaseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? "";
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
  const content = [...resources].sort().join("\n");
  await writeTextFile(DELETED_RESOURCES_FILE, content, {
    baseDir: BaseDirectory.AppData,
  });
}

export async function addResourceFiles(kind: ResourceKind): Promise<{ added: number; skipped: number }> {
  const config = RESOURCE_CONFIG[kind];
  const selected = await open({
    multiple: true,
    directory: false,
    filters: [{ name: kind === "font" ? "Шрифты" : "Изображения", extensions: [...config.extensions] }],
  });

  if (!selected || !Array.isArray(selected) || selected.length === 0) {
    return { added: 0, skipped: 0 };
  }

  const directoryExists = await exists(config.directory, { baseDir: BaseDirectory.AppData });
  if (!directoryExists) {
    await mkdir(config.directory, { baseDir: BaseDirectory.AppData, recursive: true });
  }

  const deleted = await readDeletedResources();
  const currentEntries = await import("@tauri-apps/plugin-fs").then(({ readDir }) =>
    readDir(config.directory, { baseDir: BaseDirectory.AppData }),
  );
  const existingStems = new Set(currentEntries.filter((entry) => !entry.isDirectory).map((entry) =>
    getBaseName(entry.name).replace(/\\.[^.]+$/, "").toLowerCase(),
  ));
  let added = 0;
  let skipped = 0;

  for (const sourcePath of selected) {
    const fileName = getBaseName(sourcePath);
    if (!fileName) {
      skipped += 1;
      continue;
    }

    const destination = `${config.directory}/${fileName}`;
    const stem = fileName.replace(/\\.[^.]+$/, "").toLowerCase();
    if (existingStems.has(stem) || await exists(destination, { baseDir: BaseDirectory.AppData })) {
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

export async function deleteResource(kind: ResourceKind, fileName: string): Promise<void> {
  const config = RESOURCE_CONFIG[kind];
  if (!fileName || fileName !== getBaseName(fileName)) {
    throw new Error("Некорректное имя файла");
  }

  const relativePath = `${config.directory}/${fileName}`;
  const fileExists = await exists(relativePath, { baseDir: BaseDirectory.AppData });
  if (!fileExists) {
    throw new Error("Файл уже удалён или недоступен");
  }

  const deleted = await readDeletedResources();
  deleted.add(relativePath);
  await writeDeletedResources(deleted);
  await remove(relativePath, { baseDir: BaseDirectory.AppData });
}
