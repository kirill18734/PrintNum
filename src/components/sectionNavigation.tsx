import { Printer, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppSection = "auto-print" | "create-label";

interface SectionNavigationProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  className?: string;
}

export function SectionNavigation({
  activeSection,
  onSectionChange,
  className,
}: SectionNavigationProps) {
  return (
    <div
      className={cn(
        "grid h-12 w-full grid-cols-2 rounded-xl bg-muted p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSectionChange("auto-print")}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all",
          activeSection === "auto-print"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
        )}
      >
        <Printer className="size-4 shrink-0" />
        <span className="truncate">Автопечать</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-green-200/60 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-950/40 dark:text-green-400">
          <span className="size-1.5 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
          работает
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSectionChange("create-label")}
        className={cn(
          "inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all",
          activeSection === "create-label"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
        )}
      >
        <FilePlus className="size-4 shrink-0" />
        <span className="truncate">Создать этикетку</span>
      </button>
    </div>
  );
}

export default SectionNavigation;
