import { Button, type ButtonProps } from "./button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UniversalLinkButtonProps extends ButtonProps {
  fileUrl: string;
  text?: string;
  icon?: LucideIcon;
}

declare const chrome: {
  runtime: { getURL: (path: string) => string };
  tabs: { create: (properties: { url: string }) => Promise<unknown> };
};

export function openUrl(url: string): Promise<unknown> {
  const target = url.startsWith("/")
    ? chrome.runtime.getURL(url.slice(1))
    : url;
  return chrome.tabs.create({ url: target });
}

export function UniversalLinkButton({
  fileUrl,
  text = "",
  icon: Icon,
  variant = "secondary",
  className,
  ...props
}: UniversalLinkButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        className,
      )}
      onClick={() => {
        void openUrl(fileUrl).catch((error) =>
          console.error("Не удалось открыть ссылку", error),
        );
      }}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {text && <span>{text}</span>}
    </Button>
  );
}
