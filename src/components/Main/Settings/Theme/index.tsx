import { useAppContext } from "../../../../AppContext";

import styles from "./styles.module.scss";

function Theme() {
  const { theme, setTheme }: any = useAppContext();

  const themes: any = {
    auto: { icon: "🌓", title: "Системная", next: "dark" },
    dark: { icon: "🌙", title: "Темная", next: "light" },
    light: { icon: "☀️", title: "Светлая", next: "auto" },
  };

  return (
    <label
      className={styles.theme}
      onClick={() =>
        setTheme({ ...theme, default: themes[theme.default].next })
      }
      title={`Тема: ${themes[theme.default].title}`}
    >
      {themes[theme.default].icon}
    </label>
  );
}

export default Theme;
