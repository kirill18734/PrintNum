import { Command } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

export const updater = async () => {
  const update = await check();
  const startBackend = () => Command.create("start_backend").execute();
  if (!update) {
    startBackend();
    console.log("No update available");
  } else {
    console.log("Update available!", update.version, update.body);
    const yes = await ask(
      `Доступна новая версия ${update.version}!\n\nЧто нового:\n${update.rawJson.note}`,
      {
        title: "Обновление PrintNum",
        kind: "info",
        okLabel: "Обновить",
        cancelLabel: "Позже",
      },
    );
    if (yes) {
      await update.downloadAndInstall();
      await relaunch();
    } else {
      startBackend();
    }
  }
};
