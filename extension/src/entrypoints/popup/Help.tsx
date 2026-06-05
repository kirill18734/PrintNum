import { UniversalLinkButton } from "@/components/opeTabURL";
import { HelpCircle } from "lucide-react";

export default function Help() {
  return (
    <UniversalLinkButton
      fileUrl="https://github.com/kirill18734/PrintNum/tree/main/extension"
      icon={HelpCircle}
      text="Помощь"
      variant="ghost"
      size="sm" // Или "default" / "lg" в зависимости от требований дизайна
      className="text-muted-foreground hover:text-foreground" // Дополнительная стилизация цвета при желании
    />
  );
}
