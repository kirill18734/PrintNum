import { open } from "@tauri-apps/plugin-shell";

import Service from "./Service";
import Printer from "./Printer";
import Paper from "./Paper";
import Search from "./Search";
import GitHub from "../../../assets/GitHub";
import Browser from "../../../assets/Browser";
import Theme from "./Theme";

import styles from "./styles.module.scss";

function Settings() {
  return (
    <div data-tauri-drag-region className={styles.settings}>
      <Service />
      <div data-tauri-drag-region className={styles.dataPrinter}>
        <Printer />
        <Paper />
      </div>
      <Search />
      <div data-tauri-drag-region className={styles.footer}>
        <div
          title="Исходный код / документация"
          className="footer__github"
          onClick={() => open("https://github.com/kirill18734/PrintNum")}
        >
          <GitHub classname={styles.github} />
        </div>
        <div title="Режим работы: Расширение">
          <Browser />
        </div>
        <Theme />
      </div>
    </div>
  );
}

export default Settings;
