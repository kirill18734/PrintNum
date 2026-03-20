import { useAppContext } from "../../../../../AppContext";

import styles from "./styles.module.scss";

function Manaul() {
  const { paper, setPaper }: any = useAppContext();
  return (
    <div className={styles.manual}>
      <input
        type="number"
        placeholder="Ширина"
        title="Ширина"
        min={1}
        onChange={(e) => setPaper({ ...paper, width: e.target.value })}
        value={paper.width}
      />
      <label htmlFor="">x</label>
      <input
        type="number"
        title="Высота"
        placeholder="Высота"
        min={1}
        onChange={(e) => setPaper({ ...paper, height: e.target.value })}
        value={paper.height}
      />
    </div>
  );
}

export default Manaul;
