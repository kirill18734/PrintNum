import { useAppContext } from "../../../../AppContext";

import Manual from "./Manual";

import styles from "./styles.module.scss";

function Paper() {
  const { paper, setPaper }: any = useAppContext();

  function changePaper(e: any) {
    const new_value = e.target.value;
    let new_height = "20";
    let new_width = "30";
    const parts = new_value.split("*");
    if (parts.length === 2) {
      new_width = parts[0];
      new_height = parts[1];
    }
    setPaper({
      ...paper,
      default: e.target.value,
      width: new_width,
      height: new_height,
    });
  }

  return (
    <div data-tauri-drag-region className={styles.paper}>
      <label htmlFor="">Размер этикетки (mm)</label>
      <select
        name="paper"
        title="Ширина*Высота"
        value={paper.default}
        onChange={(e) => changePaper(e)}
      >
        {paper.data.map((name: any, index: any) => (
          <option value={name} key={index} className={name}>
            {name}
          </option>
        ))}
      </select>
      {paper.default == "Ручной ввод" && <Manual />}
    </div>
  );
}

export default Paper;
