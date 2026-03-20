import { useAppContext } from "../../../AppContext";

import styles from "./styles.module.scss";

function Home() {
  const { running, setRunning }: any = useAppContext();

  return (
    <div data-tauri-drag-region className={styles.home}>
      <label htmlFor="">
        Приложение {running.default ? "запущено..." : "остановлено"}
      </label>
      <div
        className={running.default ? styles.active : ""}
        onClick={() => setRunning({ ...running, default: !running.default })}
      >
        {running.default ? "Остановить" : "Запустить"}
      </div>
    </div>
  );
}

export default Home;
