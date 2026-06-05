import { Eye, EyeOff } from "lucide-react";
import { SettingSection } from "../SettingSection";

export default function Other() {
  const [other, setOther] = useStorageState("other", []);
  // Храним только СКРЫТЫЕ элементы (массивы будут максимально короткими)
  const [offOther, setOffOther] = useStorageState("offOther", []);

  return (
    <SettingSection
      value="other-settings"
      title="Другое"
      items={other}
      hiddenItems={offOther}
      onItemToggle={setOffOther}
      VisibleIcon={Eye}
      HiddenIcon={EyeOff}
    />
  );
}
