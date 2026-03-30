import { useEffect, useState } from "react";
import { Command } from "@tauri-apps/plugin-shell";
import { check } from "@tauri-apps/plugin-updater";
import { ask } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";

import styles from "./styles.module.scss";
import Print from "../../assets/Print";

export async function checkForAppUpdates() {
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
}

function Load() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    checkForAppUpdates();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div data-tauri-drag-region className={styles.load}>
      <div className={styles.title}>
        <Print /> Печать ячеек
      </div>
      <span>Запуск приложения{dots}</span>
    </div>
  );
}

export default Load;
