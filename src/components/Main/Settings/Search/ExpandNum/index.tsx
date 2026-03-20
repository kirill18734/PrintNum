import { useAppContext } from "../../../../../AppContext";

import styles from "./styles.module.scss";

function ExpandNum() {
  const { search, setSearch }: any = useAppContext();
  return (
    <div className={styles.expand}>
      <label htmlFor="">Полные номера (от)</label>
      <input
        type="number"
        value={search.expand}
        min="5"
        onChange={(e) => setSearch({ ...search, expand: e.target.value })}
      />
    </div>
  );
}

export default ExpandNum;
