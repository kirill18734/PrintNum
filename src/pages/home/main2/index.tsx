import Paper from "@/components/paper";
import Printer from "@/components/printer";
import { useAppStore } from "@/services/store";
import { useState } from "react";

export default function Main() {
  const [mode, setMode] = useState<"autoprint" | "create">("autoprint");

  const printer = useAppStore((state) => state.printer);
  const paper = useAppStore((state) => state.paper);
  const listPrinters = useAppStore((state) => state.listPrinters);
  const listPapers = useAppStore((state) => state.listPapers);

  const setSetting = useAppStore((state) => state.setSetting);
  const setPrinter = (newPrinter: string) => setSetting("printer", newPrinter);
  const setPaper = (newPaper: string) => setSetting("paper", newPaper);

  return (
    <main className="flex flex-col flex-1 justify-center">
      {/* Параметры печати */}
      <div className="flex items-center justify-center gap-10">
        {/* Принтер */}
        <Printer
          defaultPrinter={printer}
          defaultListPrinters={listPrinters}
          setDefaultPrinter={setPrinter}
        />
        {/* Бумага */}
        <Paper
          defaultPaper={paper}
          setDefaultPaper={setPaper}
          defaultListPapers={listPapers}
        />
      </div>
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
          onClick={() => setMode("autoprint")}
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
          onClick={() => setMode("create")}
          className={`min-h-9 rounded-lg px-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
            mode === "create"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Создать этикетку
        </button>
      </div>
    </main>
  );
}
