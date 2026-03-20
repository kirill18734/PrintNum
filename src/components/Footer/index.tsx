import { useAppContext } from "../../AppContext";

import styles from "./styles.module.scss";

function Footer() {
  const { status }: any = useAppContext();
  return (
    <footer data-tauri-drag-region className={styles.footer}>
      <label htmlFor="">{status}</label>
    </footer>
  );
}

export default Footer;
