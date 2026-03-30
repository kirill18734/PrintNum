import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useAppContext } from "../../AppContext";

import styles from "./styles.module.scss";

function Footer() {
  const { status, activeTab }: any = useAppContext();
  const [version, setVersion] = useState("");

  useEffect(() => {
    invoke("get_version").then(
      (message) => message && setVersion(`${message}`),
    );
  }, []);

  return (
    <footer data-tauri-drag-region className={styles.footer}>
      {activeTab && <span className={styles.span}>v{version}</span>}
      <label htmlFor="">{status}</label>
    </footer>
  );
}

export default Footer;
