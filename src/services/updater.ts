import { Command } from "@tauri-apps/plugin-shell";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

let isUpdateChecked = false;
let currentUpdate: Update | null = null;

// 1. Функция проверки: возвращает true (если есть апдейт) или false
export const checkForUpdates = async (): Promise<boolean> => {
  if (isUpdateChecked) return !!currentUpdate;
  isUpdateChecked = true;

  const update = await check();

  if (!update) return false;

  currentUpdate = update; // Сохраняем объект для последующей установки
  return true;
};

// 2. Функция чистой установки и перезапуска
export const installAndRelaunch = async (): Promise<void> => {
  if (!currentUpdate) {
    console.error("No update object found. Run checkForUpdates first.");
    return;
  }
  await Command.create("stop_backend").execute();
  await currentUpdate.downloadAndInstall();
  await relaunch();
};
