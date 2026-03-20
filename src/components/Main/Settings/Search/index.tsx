import { useAppContext } from "../../../../AppContext";
import ExpandNum from "./ExpandNum";

import styles from "./styles.module.scss";

function Search() {
  const { search, setSearch }: any = useAppContext();
  return (
    <div data-tauri-drag-region className={styles.search}>
      <label htmlFor="">Что печатать?</label>
      <select
        name="search"
        value={search.default}
        onChange={(e) =>
          setSearch({
            ...search,
            default: e.target.value,
            expand: e.target.value.startsWith("Другое") ? "5" : "1",
          })
        }
      >
        {search.data.map((name: any, index: any) => (
          <option value={name} key={index} className={name}>
            {name}
          </option>
        ))}
      </select>
      {search.default.startsWith("Другое") && <ExpandNum />}
    </div>
  );
}

export default Search;
