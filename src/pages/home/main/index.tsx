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
    </main>
  );
}
