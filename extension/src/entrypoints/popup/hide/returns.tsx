import { Eye, EyeOff } from "lucide-react";
import { SettingSection } from "../SettingSection";

export default function Returns() {
  const [returns, setReturns] = useStorageState("returns", []);
  // Храним только СКРЫТЫЕ элементы (массивы будут максимально короткими)
  const [offReturns, setOffReturns] = useStorageState("offReturns", []);

  return (
    <SettingSection
      value="returns-settings"
      title="Видимость возвратов"
      items={returns}
      hiddenItems={offReturns}
      onItemToggle={setOffReturns}
      VisibleIcon={Eye}
      HiddenIcon={EyeOff}
    />
  );
}
