declare const chrome: any;

import { Button, ButtonProps } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Импортируем утилиту слияния классов shadcn

interface UniversalLinkButtonProps extends ButtonProps {
  fileUrl: string;
  text?: string;
  icon?: LucideIcon;
}

export function UniversalLinkButton({
  fileUrl,
  text = "",
  icon: Icon,
  variant = "secondary",
  className,
  ...props
}: UniversalLinkButtonProps) {
  const handleOpenUrl = () => {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url: fileUrl });
    } else {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button
      variant={variant}
      // Используем cn(), чтобы дефолтные стили не ломали кастомные
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        className,
      )}
      onClick={handleOpenUrl}
      {...props}
    >
      {/* Теперь у иконки есть жесткие размеры */}
      {Icon && <Icon className="h-4 w-4 shrink-0" />}

      {/* Текст отображается с правильным отступом gap-2 от иконки */}
      {text && <span>{text}</span>}
    </Button>
  );
}
