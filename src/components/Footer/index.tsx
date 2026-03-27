import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext } from "../../AppContext";
import { Command } from "@tauri-apps/plugin-shell";

import styles from "./styles.module.scss";

export async function checkForAppUpdates(onUserClick: false) {
  const update = await check();
  if (!update) {
    console.log("No update available");
  } else if (update) {
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
      await Command.create("stop_backend").execute();
      await update.downloadAndInstall();
      await relaunch();
    }
  } else if (onUserClick) {
    await message("You are on the latest version. Stay awesome!", {
      title: "No Update Available",
      kind: "info",
      okLabel: "OK",
    });
  }
}

function Footer() {
  const { status, activeTab }: any = useAppContext();
  const [version, setVersion] = useState("");

  useEffect(() => {
    invoke("get_version").then(
      (message) => message && setVersion(`${message}`),
    );
    checkForAppUpdates(false);
  }, []);

  return (
    <footer data-tauri-drag-region className={styles.footer}>
      {activeTab && <span className={styles.span}>v{version}</span>}
      <label htmlFor="">{status}</label>
    </footer>
  );
}

export default Footer;
