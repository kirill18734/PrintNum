import {
  BaseDirectory, exists, mkdir, readFile, remove, writeFile,
} from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "@/services/store";

export type ResourceKind = "background" | "font";
const RESOURCE_CONFIG = {
  background: { directory: "backgrounds", extensions: ["png", "jpg", "jpeg", "bmp", "webp"] },
  font: { directory: "fonts", extensions: ["ttf", "otf"] },
} as const;

function getBaseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? "";
}

/** Tauri отвечает только за добавление файлов; списки ресурсов формирует backend. */
export async function addResourceFiles(kind: ResourceKind): Promise<{ added: number; skipped: number }> {
  const config = RESOURCE_CONFIG[kind];
  const selected = await open({
    multiple: true, directory: false,
    filters: [{ name: kind === "font" ? "Шрифты" : "Изображения", extensions: [...config.extensions] }],
  });
  if (!selected || !Array.isArray(selected) || selected.length === 0) return { added: 0, skipped: 0 };
  if (!(await exists(config.directory, { baseDir: BaseDirectory.AppData }))) {
    await mkdir(config.directory, { baseDir: BaseDirectory.AppData, recursive: true });
  }

  let added = 0, skipped = 0;
  const addedPaths: string[] = [];
  for (const sourcePath of selected) {
    const fileName = getBaseName(sourcePath);
    const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!fileName || fileName === "." || fileName === ".." || !config.extensions.includes(extension as never)) {
      skipped += 1; continue;
    }
    const destination = config.directory + "/" + fileName;
    // Сравниваем полное имя, включая расширение: .ttf и .otf — разные ресурсы.
    if (await exists(destination, { baseDir: BaseDirectory.AppData })) { skipped += 1; continue; }
    const bytes = await readFile(sourcePath);
    await writeFile(destination, bytes, { baseDir: BaseDirectory.AppData });
    addedPaths.push(destination);
    added += 1;
  }

  // Если пользователь добавил файл с именем ранее удалённого встроенного ресурса,
  // он должен остаться на диске и не считаться удалённым.
  if (addedPaths.length > 0) {
    const store = useAppStore.getState();
    const nextDeletedResources = store.deletedResources.filter((path) => !addedPaths.includes(path));
    if (nextDeletedResources.length !== store.deletedResources.length) {
      await store.setSetting("deletedResources", nextDeletedResources);
    }
  }

  return { added, skipped };
}

/** Удаляет файл; в конфиг записываются только удалённые встроенные ресурсы. */
export async function deleteResource(kind: ResourceKind, fileName: string): Promise<void> {
  const config = RESOURCE_CONFIG[kind];
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!fileName || fileName !== getBaseName(fileName) || fileName === "." || fileName === ".." ||
      !config.extensions.includes(extension as never)) throw new Error("Некорректное имя файла");

  const relativePath = config.directory + "/" + fileName;
  if (!(await exists(relativePath, { baseDir: BaseDirectory.AppData }))) throw new Error("Файл уже удалён или недоступен");

  const isBuiltIn = await invoke<boolean>("is_builtin_resource", { kind, fileName });
  const store = useAppStore.getState();
  const previousDeletedResources = store.deletedResources;
  const nextDeletedResources = isBuiltIn && !previousDeletedResources.includes(relativePath)
    ? [...previousDeletedResources, relativePath]
    : previousDeletedResources;

  // Сначала сохраняем отметку, чтобы ресурс не восстановился даже при аварийном
  // завершении приложения между записью конфига и удалением файла.
  if (nextDeletedResources !== previousDeletedResources) {
    await store.setSetting("deletedResources", nextDeletedResources);
  }

  try {
    await remove(relativePath, { baseDir: BaseDirectory.AppData });
  } catch (error) {
    if (nextDeletedResources !== previousDeletedResources) {
      await useAppStore.getState().setSetting("deletedResources", previousDeletedResources);
    }
    throw error;
  }
}
