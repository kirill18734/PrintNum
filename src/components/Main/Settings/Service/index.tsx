import { useAppContext } from "../../../../AppContext";

import styles from "./styles.module.scss";

function Service() {
  const { service, setService }: any = useAppContext();
  return (
    <div data-tauri-drag-region className={styles.service}>
      <label htmlFor="">ПВЗ:</label>
      <select
        name="printer"
        value={service.default}
        onChange={(e) => setService({ ...service, default: e.target.value })}
      >
        {service.data.map((name: any, index: any) => (
          <option value={name} key={index} className={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Service;
