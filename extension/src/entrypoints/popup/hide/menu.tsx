import { Eye, EyeOff } from "lucide-react";
import { SettingSection } from "../SettingSection";

export default function Menu() {
  const [menu, setMenu] = useStorageState("menu", []);
  // Храним только СКРЫТЫЕ элементы (массивы будут максимально короткими)
  const [offMenu, setOffMenu] = useStorageState("offMenu", []);

  return (
    <SettingSection
      value="menu-settings"
      title="Видимость меню"
      items={menu}
      hiddenItems={offMenu}
      onItemToggle={setOffMenu}
      VisibleIcon={Eye}
      HiddenIcon={EyeOff}
    />
  );
}
