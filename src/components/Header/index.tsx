import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppContext } from "../../AppContext";

import Print from "../../assets/Print";
import Settings from "../../assets/Settings";
import Hide from "../../assets/Hide";
import Close from "../../assets/Close";

import styles from "./styles.module.scss";

function Header() {
  const { activeTab, setActiveTab }: any = useAppContext();

  return (
    <header data-tauri-drag-region className={styles.header}>
      <div data-tauri-drag-region className={styles.title}>
        <Print /> Печать ячеек
      </div>
      <div
        title="Настройки"
        className={`${styles.tabSettings} ${activeTab ? styles.active : ""}`}
        onClick={() => setActiveTab(!activeTab)}
      >
        <Settings />
      </div>
      <div className={styles.toolbar}>
        <div
          title="Свернуть"
          onClick={() => getCurrentWindow().minimize()}
          className={styles.hide}
        >
          <Hide />
        </div>
        <div
          title="Закрыть"
          onClick={() => getCurrentWindow().close()}
          className={styles.close}
        >
          <Close />
        </div>
      </div>
    </header>
  );
}

export default Header;
