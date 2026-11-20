import { Printer, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppSection = "auto-print" | "create-label";

interface SectionNavigationProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  backendOnline: boolean;
  printerOnline: boolean;
  className?: string;
}

export function SectionNavigation({
  activeSection,
  onSectionChange,
  backendOnline,
  printerOnline,
  className,
}: SectionNavigationProps) {
  const statusClassName = !backendOnline
    ? "border-border bg-muted text-muted-foreground"
    : printerOnline
      ? "border-green-200/60 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-950/40 dark:text-green-400"
      : "border-red-200/60 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/40 dark:text-red-400";

  const indicatorClassName = !backendOnline
    ? "bg-muted-foreground"
    : printerOnline
      ? "bg-green-500 dark:bg-green-400 animate-pulse"
      : "bg-red-500 dark:bg-red-400";

  return (
    <div
      className={cn("grid h-12 w-full grid-cols-2 items-end gap-1", className)}
    >
      <button
        type="button"
        onClick={() => onSectionChange("auto-print")}
        className={cn(
          "relative z-10 -mb-px inline-flex h-12 items-center justify-center gap-2 rounded-t-xl border border-b-0 px-2 text-sm font-medium transition-colors",
          activeSection === "auto-print"
            ? "border-border/60 bg-card text-foreground"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <Printer className="size-4 shrink-0" />
        <span className="truncate">Автопечать</span>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
            statusClassName,
          )}
        >
          <span className={cn("size-1.5 rounded-full", indicatorClassName)} />
          {!backendOnline ? "Подключение..." : printerOnline ? "Работает" : "Остановлена"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSectionChange("create-label")}
        className={cn(
          "relative z-10 -mb-px inline-flex h-12 items-center justify-center gap-2 rounded-t-xl border border-b-0 px-2 text-sm font-medium transition-colors",
          activeSection === "create-label"
            ? "border-border/60 bg-card text-foreground"
            : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
      >
        <FilePlus className="size-4 shrink-0" />
        <span className="truncate">Создать этикетку</span>
      </button>
    </div>
  );
}

export default SectionNavigation;
