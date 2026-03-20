import { useAppContext } from "../../../../AppContext";

import styles from "./styles.module.scss";

function Printer() {
  const { printer, setPrinter }: any = useAppContext();
  return (
    <div data-tauri-drag-region className={styles.printer}>
      <label htmlFor="">Принтер</label>
      <select
        name="printer"
        value={printer.default}
        onChange={(e) => setPrinter({ ...printer, default: e.target.value })}
      >
        {printer.data.map((name: any, index: any) => (
          <option value={name} key={index} className={name} title={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Printer;
