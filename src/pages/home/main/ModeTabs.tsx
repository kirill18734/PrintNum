// Переключатель между режимами автопечати и создания этикетки.
type Mode = "autoprint" | "create";

interface ModeTabsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Режим работы"
        className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/70 p-1"
      >
        <button
          type="button"
          role="tab"
          id="mode-tab-autoprint"
          aria-controls="mode-panel-autoprint"
          aria-selected={mode === "autoprint"}
          onClick={() => onModeChange("autoprint")}
          className={`min-h-9 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            mode === "autoprint"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Автопечать
        </button>
        <button
          type="button"
          role="tab"
          id="mode-tab-create"
          aria-controls="mode-panel-create"
          aria-selected={mode === "create"}
          onClick={() => onModeChange("create")}
          className={`min-h-9 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            mode === "create"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Создать этикетку
        </button>
      </div>
    </div>
  );
}
// Переключатель между режимами автопечати и создания этикетки.